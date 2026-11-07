// ============================================================
// MOVIE TICKET MANAGEMENT SYSTEM - MY BOOKINGS SCRIPT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    loadMyBookings();
});

async function loadMyBookings() {
    const container = document.getElementById('myBookingsContainer');

    if (!Auth.isLoggedIn()) {
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 4rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
                    <i class="fas fa-lock fa-3x" style="color: var(--accent-gold); margin-bottom: 1rem;"></i>
                    <h2>Sign In Required</h2>
                    <p style="color: var(--text-muted); margin: 0.5rem 0 1.5rem;">Please log in to view your booked tickets and reservations.</p>
                    <a href="/pages/login.html?redirect=/pages/my-bookings.html" class="btn btn-primary"><i class="fas fa-sign-in-alt"></i> Sign In</a>
                </div>
            `;
        }
        return;
    }

    try {
        const response = await apiRequest('/bookings/my-bookings', 'GET', null, true);
        const bookings = response.bookings || [];

        renderBookingsList(bookings);
    } catch (err) {
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
                    <i class="fas fa-exclamation-triangle fa-2x" style="color: var(--primary-red); margin-bottom: 1rem;"></i>
                    <h3>Error Loading Bookings</h3>
                    <p style="color: var(--text-muted); margin-top: 0.5rem;">${err.message}</p>
                </div>
            `;
        }
    }
}

function renderBookingsList(bookings) {
    const container = document.getElementById('myBookingsContainer');
    if (!container) return;

    if (bookings.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
                <i class="fas fa-ticket-alt fa-3x" style="color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3>No Bookings Yet</h3>
                <p style="color: var(--text-muted); margin: 0.5rem 0 1.5rem;">You haven't reserved any movie tickets yet.</p>
                <a href="/pages/movies.html" class="btn btn-primary"><i class="fas fa-film"></i> Discover Movies</a>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="bookings-list">
            ${bookings.map(b => {
                const isConfirmed = b.booking_status === 'CONFIRMED';
                return `
                <div class="booking-item-card" style="border-left: 4px solid ${isConfirmed ? '#10b981' : '#ef4444'};">
                    <div class="booking-info-left">
                        <img src="${b.poster_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'}" alt="${b.movie_title}" class="booking-poster-thumb">
                        <div>
                            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.25rem;">
                                <h3 class="booking-item-title" style="margin: 0;">${b.movie_title}</h3>
                                <span class="${isConfirmed ? 'booking-badge-confirmed' : 'booking-badge-cancelled'}">
                                    <i class="fas ${isConfirmed ? 'fa-check-circle' : 'fa-times-circle'}"></i> ${b.booking_status}
                                </span>
                            </div>
                            <div class="booking-item-details">
                                <span><i class="fas fa-barcode"></i> Booking Ref: <strong>${b.booking_reference}</strong></span>
                                <span><i class="fas fa-building" style="color: var(--accent-gold);"></i> ${b.theatre_name} &bull; ${b.theatre_location}</span>
                                <span><i class="fas fa-calendar"></i> ${formatDate(b.show_date)} at <strong style="color: #fff;">${formatTime(b.show_time)}</strong></span>
                                <span><i class="fas fa-chair" style="color: var(--primary-red);"></i> Seats: <strong>${b.seat_numbers || 'N/A'}</strong> (${b.seat_count} seats)</span>
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.75rem;">
                        <div style="text-align: right;">
                            <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Total Paid</div>
                            <div style="font-size: 1.4rem; font-weight: 800; color: ${isConfirmed ? 'var(--accent-gold)' : 'var(--text-muted)'};">
                                ${formatCurrency(b.total_amount)}
                            </div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">
                                Booked on: ${formatDate(b.booking_date)}
                            </div>
                        </div>

                        <div style="display: flex; gap: 0.5rem;">
                            <button onclick="printBookingTicket('${b.booking_reference}')" class="btn btn-outline btn-sm">
                                <i class="fas fa-print"></i> Print
                            </button>
                            ${isConfirmed ? `
                                <button onclick="cancelUserBooking(${b.booking_id}, '${b.booking_reference}')" class="btn btn-danger btn-sm">
                                    <i class="fas fa-ban"></i> Cancel Booking
                                </button>
                            ` : `
                                <span style="font-size: 0.8rem; color: var(--text-muted); font-style: italic; padding: 0.4rem 0;">Cancelled</span>
                            `}
                        </div>
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    `;
}

async function cancelUserBooking(bookingId, reference) {
    if (!confirm(`Are you sure you want to cancel booking ${reference}? The reserved seats will be released for other customers.`)) {
        return;
    }

    try {
        await apiRequest(`/bookings/${bookingId}/cancel`, 'PUT', null, true);
        showToast(`Booking ${reference} has been cancelled and seats released.`, 'success');
        loadMyBookings();
    } catch (err) {
        showToast(err.message || 'Failed to cancel booking.', 'error');
    }
}

function printBookingTicket(reference) {
    window.print();
}
