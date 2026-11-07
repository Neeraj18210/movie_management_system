// ============================================================
// MOVIE TICKET MANAGEMENT SYSTEM - SEAT SELECTION SCRIPT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    loadAuditoriumSeats();
    setupProceedButton();
});

let currentShow = null;
const selectedSeatsSet = new Set();
const ROWS = ['A', 'B', 'C', 'D', 'E', 'F'];
const SEATS_PER_ROW = 10;

async function loadAuditoriumSeats() {
    const showId = getUrlParam('show_id') || 1;
    const header = document.getElementById('seatShowHeader');
    const grid = document.getElementById('auditoriumGrid');

    try {
        const response = await apiRequest(`/shows/${showId}`);
        currentShow = response.show;

        // Render Show Header
        if (header && currentShow) {
            header.innerHTML = `
                <div style="background: var(--bg-card); border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 1.5rem 2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem; box-shadow: var(--shadow-card);">
                    <div>
                        <span class="hero-badge" style="margin-bottom: 0.35rem;"><i class="fas fa-couch"></i> Seat Selection</span>
                        <h2 style="font-size: 1.75rem; margin-bottom: 0.25rem;">${currentShow.movie_title}</h2>
                        <div style="display: flex; gap: 1.25rem; font-size: 0.9rem; color: var(--text-secondary); flex-wrap: wrap;">
                            <span><i class="fas fa-film" style="color: var(--accent-gold);"></i> ${currentShow.theatre_name}</span>
                            <span><i class="fas fa-calendar"></i> ${formatDate(currentShow.show_date)}</span>
                            <span><i class="fas fa-clock"></i> ${formatTime(currentShow.show_time)}</span>
                            <span><i class="fas fa-tag"></i> ${formatCurrency(currentShow.ticket_price)} per ticket</span>
                        </div>
                    </div>
                    <div>
                        <a href="/pages/shows.html?movie_id=${currentShow.movie_id}" class="btn btn-outline btn-sm">
                            <i class="fas fa-exchange-alt"></i> Change Showtime
                        </a>
                    </div>
                </div>
            `;
        }

        // Render Seating Layout
        renderSeatingLayout(currentShow.booked_seats || []);
    } catch (err) {
        if (grid) {
            grid.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--primary-red);">
                    <i class="fas fa-exclamation-triangle fa-2x"></i>
                    <h3>Error loading auditorium seats</h3>
                    <p style="color: var(--text-muted); margin-top: 0.5rem;">${err.message}</p>
                </div>
            `;
        }
    }
}

function renderSeatingLayout(bookedSeats) {
    const grid = document.getElementById('auditoriumGrid');
    if (!grid) return;

    const bookedSet = new Set(bookedSeats.map(s => String(s).toUpperCase()));
    grid.innerHTML = '';

    ROWS.forEach(rowLetter => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'seat-row';

        // Row Letter Label Left
        const labelLeft = document.createElement('div');
        labelLeft.className = 'row-label';
        labelLeft.textContent = rowLetter;
        rowDiv.appendChild(labelLeft);

        // Left Aisle Seats (1 to 5)
        const leftAisle = document.createElement('div');
        leftAisle.className = 'seats-aisle';
        for (let i = 1; i <= 5; i++) {
            const seatNumber = `${rowLetter}${i}`;
            const seatEl = createSeatElement(seatNumber, bookedSet.has(seatNumber));
            leftAisle.appendChild(seatEl);
        }
        rowDiv.appendChild(leftAisle);

        // Center Aisle Walkway Gap
        const aisleGap = document.createElement('div');
        aisleGap.className = 'aisle-gap';
        rowDiv.appendChild(aisleGap);

        // Right Aisle Seats (6 to 10)
        const rightAisle = document.createElement('div');
        rightAisle.className = 'seats-aisle';
        for (let i = 6; i <= SEATS_PER_ROW; i++) {
            const seatNumber = `${rowLetter}${i}`;
            const seatEl = createSeatElement(seatNumber, bookedSet.has(seatNumber));
            rightAisle.appendChild(seatEl);
        }
        rowDiv.appendChild(rightAisle);

        // Row Letter Label Right
        const labelRight = document.createElement('div');
        labelRight.className = 'row-label';
        labelRight.textContent = rowLetter;
        rowDiv.appendChild(labelRight);

        grid.appendChild(rowDiv);
    });
}

function createSeatElement(seatNumber, isBooked) {
    const seat = document.createElement('div');
    seat.className = `seat ${isBooked ? 'booked' : 'available'}`;
    seat.dataset.seat = seatNumber;
    seat.title = isBooked ? `Seat ${seatNumber} (Reserved)` : `Seat ${seatNumber} - ${formatCurrency(currentShow ? currentShow.ticket_price : 0)}`;
    seat.textContent = seatNumber.slice(1);

    if (!isBooked) {
        seat.addEventListener('click', () => toggleSeatSelection(seatNumber, seat));
    }

    return seat;
}

function toggleSeatSelection(seatNumber, seatElement) {
    if (selectedSeatsSet.has(seatNumber)) {
        selectedSeatsSet.delete(seatNumber);
        seatElement.classList.remove('selected');
    } else {
        selectedSeatsSet.add(seatNumber);
        seatElement.classList.add('selected');
    }

    updateSummaryBar();
}

function updateSummaryBar() {
    const selectedList = Array.from(selectedSeatsSet).sort();
    const count = selectedList.length;
    const ticketPrice = currentShow ? parseFloat(currentShow.ticket_price) : 0;
    const totalAmount = count * ticketPrice;

    const seatsLabel = document.getElementById('selectedSeatsLabel');
    const countLabel = document.getElementById('seatCountLabel');
    const totalLabel = document.getElementById('totalAmountLabel');
    const proceedBtn = document.getElementById('proceedConfirmBtn');

    if (seatsLabel) {
        seatsLabel.textContent = count > 0 ? selectedList.join(', ') : 'None';
    }
    if (countLabel) {
        countLabel.textContent = count;
    }
    if (totalLabel) {
        totalLabel.textContent = formatCurrency(totalAmount);
    }
    if (proceedBtn) {
        proceedBtn.disabled = count === 0;
    }
}

function setupProceedButton() {
    const proceedBtn = document.getElementById('proceedConfirmBtn');
    if (!proceedBtn) return;

    proceedBtn.addEventListener('click', () => {
        if (selectedSeatsSet.size === 0) {
            showToast('Please select at least one seat to proceed.', 'warning');
            return;
        }

        const selectedSeats = Array.from(selectedSeatsSet).sort();
        const ticketPrice = currentShow ? parseFloat(currentShow.ticket_price) : 0;
        const totalAmount = parseFloat((selectedSeats.length * ticketPrice).toFixed(2));

        const bookingData = {
            show_id: currentShow.show_id,
            movie_id: currentShow.movie_id,
            movie_title: currentShow.movie_title,
            theatre_name: currentShow.theatre_name,
            theatre_location: currentShow.theatre_location,
            show_date: currentShow.show_date,
            show_time: currentShow.show_time,
            ticket_price: ticketPrice,
            seats: selectedSeats,
            seat_count: selectedSeats.length,
            total_amount: totalAmount
        };

        // Save active booking selection to sessionStorage
        sessionStorage.setItem('active_booking_draft', JSON.stringify(bookingData));

        if (!Auth.isLoggedIn()) {
            showToast('Please sign in or register to complete your reservation.', 'info');
            setTimeout(() => {
                window.location.href = `/pages/login.html?redirect=${encodeURIComponent('/pages/confirmation.html')}`;
            }, 800);
            return;
        }

        window.location.href = '/pages/confirmation.html';
    });
}
