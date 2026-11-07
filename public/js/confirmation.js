// ============================================================
// MOVIE TICKET MANAGEMENT SYSTEM - CONFIRMATION SCRIPT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initConfirmation();
});

let bookingDraft = null;

function initConfirmation() {
    // 1. Auth check
    if (!Auth.isLoggedIn()) {
        showToast('Please log in to confirm your booking.', 'warning');
        window.location.href = `/pages/login.html?redirect=${encodeURIComponent('/pages/confirmation.html')}`;
        return;
    }

    // 2. Draft check
    const draftStr = sessionStorage.getItem('active_booking_draft');
    if (!draftStr) {
        renderNoBookingState();
        return;
    }

    try {
        bookingDraft = JSON.parse(draftStr);
        renderOrderSummary(bookingDraft);
    } catch (e) {
        renderNoBookingState();
    }
}

function renderNoBookingState() {
    const container = document.getElementById('ticketContainer');
    if (!container) return;

    container.innerHTML = `
        <div style="text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
            <i class="fas fa-ticket-alt fa-3x" style="color: var(--text-muted); margin-bottom: 1rem;"></i>
            <h3>No Active Reservation Found</h3>
            <p style="color: var(--text-muted); margin: 0.5rem 0 1.5rem;">Please select a movie and your preferred seats first.</p>
            <a href="/pages/movies.html" class="btn btn-primary"><i class="fas fa-film"></i> Browse Movies</a>
        </div>
    `;
}

function renderOrderSummary(draft) {
    const container = document.getElementById('ticketContainer');
    const user = Auth.getUser() || {};
    if (!container) return;

    container.innerHTML = `
    <div class="ticket-card">
        <div class="ticket-header">
            <div>
                <span class="hero-badge" style="margin-bottom: 0.35rem;"><i class="fas fa-hourglass-half"></i> Pending Confirmation</span>
                <h2 class="ticket-movie-title">${draft.movie_title}</h2>
                <span style="font-size: 0.9rem; color: var(--accent-gold);"><i class="fas fa-building"></i> ${draft.theatre_name}</span>
            </div>
            <div class="ticket-ref-badge">
                <i class="fas fa-couch"></i> ${draft.seat_count} Seats
            </div>
        </div>

        <div class="ticket-body">
            <div class="ticket-info-item">
                <div class="info-label">Show Date</div>
                <div class="info-val"><i class="fas fa-calendar" style="color: var(--primary-red);"></i> ${formatDate(draft.show_date)}</div>
            </div>
            <div class="ticket-info-item">
                <div class="info-label">Show Time</div>
                <div class="info-val"><i class="fas fa-clock" style="color: var(--primary-red);"></i> ${formatTime(draft.show_time)}</div>
            </div>
            <div class="ticket-info-item">
                <div class="info-label">Auditorium / Location</div>
                <div class="info-val">${draft.theatre_location || 'Screen 1'}</div>
            </div>
            <div class="ticket-info-item">
                <div class="info-label">Price per Ticket</div>
                <div class="info-val">${formatCurrency(draft.ticket_price)}</div>
            </div>
            <div class="ticket-info-item full-width">
                <div class="info-label">Reserved Seat Numbers</div>
                <div class="info-val" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    ${draft.seats.map(s => `
                        <span style="background: rgba(229, 9, 20, 0.2); border: 1px solid var(--primary-red); color: #fff; padding: 0.25rem 0.65rem; border-radius: var(--radius-sm); font-weight: 700; font-size: 0.9rem;">
                            <i class="fas fa-chair"></i> ${s}
                        </span>
                    `).join('')}
                </div>
            </div>
            <div class="ticket-info-item full-width" style="border-top: 1px solid var(--border-light); padding-top: 1rem;">
                <div class="info-label">Booking Customer</div>
                <div class="info-val" style="font-size: 0.95rem;">
                    <strong>${user.name || 'Customer'}</strong> (${user.email || 'N/A'})
                </div>
            </div>
        </div>

        <div class="ticket-footer">
            <div class="ticket-total-box">
                <span class="total-label">Total Amount Payable</span>
                <span class="total-price">${formatCurrency(draft.total_amount)}</span>
            </div>
            <div style="display: flex; gap: 0.75rem;">
                <a href="/pages/seats.html?show_id=${draft.show_id}" class="btn btn-outline btn-sm">
                    <i class="fas fa-arrow-left"></i> Change Seats
                </a>
                <button id="confirmPayBtn" class="btn btn-primary" onclick="confirmReservation()">
                    <i class="fas fa-lock"></i> Confirm & Book Now
                </button>
            </div>
        </div>
    </div>
    `;
}

async function confirmReservation() {
    const btn = document.getElementById('confirmPayBtn');
    if (!bookingDraft) return;

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Processing Transaction...`;
    }

    try {
        // Send transactional booking request to Node.js backend & MySQL
        const payload = {
            show_id: bookingDraft.show_id,
            seats: bookingDraft.seats
        };

        const result = await apiRequest('/bookings', 'POST', payload, true);

        // Clear draft from storage
        sessionStorage.removeItem('active_booking_draft');

        showToast('🎉 Booking Confirmed! Your tickets have been saved to MySQL.', 'success');
        renderSuccessTicket(result.booking);
    } catch (err) {
        showToast(err.message || 'Booking failed.', 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="fas fa-lock"></i> Confirm & Book Now`;
        }
    }
}

function renderSuccessTicket(confirmedBooking) {
    const container = document.getElementById('ticketContainer');
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.innerHTML = `<i class="fas fa-check-circle" style="color: #10b981;"></i> Booking Confirmed!`;
    }

    if (!container) return;

    container.innerHTML = `
    <div class="ticket-card" style="border: 2px solid #10b981; box-shadow: 0 0 30px rgba(16, 185, 129, 0.2);">
        <div class="ticket-header" style="background: linear-gradient(135deg, #092c19, #0f4024);">
            <div>
                <span style="background: rgba(16, 185, 129, 0.25); border: 1px solid #10b981; color: #10b981; padding: 0.25rem 0.65rem; border-radius: var(--radius-full); font-size: 0.8rem; font-weight: 700;">
                    <i class="fas fa-check-circle"></i> RESERVATION CONFIRMED
                </span>
                <h2 class="ticket-movie-title" style="margin-top: 0.5rem;">${confirmedBooking.movie_title}</h2>
                <span style="font-size: 0.9rem; color: #a7f3d0;"><i class="fas fa-building"></i> ${confirmedBooking.theatre_name}</span>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 0.75rem; color: #a7f3d0; text-transform: uppercase;">Booking Reference</div>
                <div class="ticket-ref-badge" style="background: #064e3b; border-color: #10b981; color: #fff;">
                    ${confirmedBooking.booking_reference}
                </div>
            </div>
        </div>

        <div class="ticket-body">
            <div class="ticket-info-item">
                <div class="info-label">Date</div>
                <div class="info-val">${formatDate(confirmedBooking.show_date)}</div>
            </div>
            <div class="ticket-info-item">
                <div class="info-label">Time</div>
                <div class="info-val">${formatTime(confirmedBooking.show_time)}</div>
            </div>
            <div class="ticket-info-item">
                <div class="info-label">Seats (${confirmedBooking.seat_count})</div>
                <div class="info-val" style="color: var(--accent-gold); font-weight: 700;">
                    ${confirmedBooking.seats.join(', ')}
                </div>
            </div>
            <div class="ticket-info-item">
                <div class="info-label">Total Amount Paid</div>
                <div class="info-val" style="color: #10b981; font-weight: 800;">
                    ${formatCurrency(confirmedBooking.total_amount)}
                </div>
            </div>
            <div class="ticket-info-item full-width" style="text-align: center; padding-top: 1rem; border-top: 1px dashed var(--border-light);">
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem;">Scan QR at Entrance</div>
                <div style="background: #fff; padding: 0.75rem; display: inline-block; border-radius: var(--radius-sm);">
                    <i class="fas fa-qrcode fa-5x" style="color: #0b0c10;"></i>
                </div>
                <div style="font-family: monospace; font-size: 0.85rem; color: var(--text-muted); margin-top: 0.4rem;">
                    PASS: ${confirmedBooking.booking_reference}
                </div>
            </div>
        </div>

        <div class="ticket-footer" style="justify-content: space-between;">
            <button onclick="window.print()" class="btn btn-outline">
                <i class="fas fa-print"></i> Print Ticket
            </button>
            <a href="/pages/my-bookings.html" class="btn btn-primary">
                <i class="fas fa-bookmark"></i> View in My Bookings
            </a>
        </div>
    </div>
    `;
}
