// ============================================================
// MOVIE TICKET MANAGEMENT SYSTEM - ADMIN DASHBOARD SCRIPT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initAdminPortal();
});

let adminData = {
    movies: [],
    theatres: [],
    shows: [],
    bookings: [],
    customers: []
};

async function initAdminPortal() {
    // Admin access guard
    if (!Auth.isLoggedIn() || !Auth.isAdmin()) {
        document.body.innerHTML = `
            <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0a0b0f; color: #fff; text-align: center; font-family: 'Outfit', sans-serif; padding: 2rem;">
                <div style="max-width: 450px; background: #12141c; padding: 3rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
                    <i class="fas fa-shield-alt fa-3x" style="color: #e50914; margin-bottom: 1.5rem;"></i>
                    <h2 style="margin-bottom: 0.5rem;">Admin Access Restricted</h2>
                    <p style="color: #94a3b8; margin-bottom: 1.5rem;">You need administrative privileges to view this portal. Please log in with the administrator account.</p>
                    <a href="/pages/login.html?redirect=/pages/admin.html" style="display: inline-block; background: #e50914; color: #fff; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 600;">
                        Sign In as Admin
                    </a>
                </div>
            </div>
        `;
        return;
    }

    setupAdminTabs();
    setupAdminForms();
    setupTableSearches();

    // Load initial data
    await Promise.all([
        loadDashboardStats(),
        loadAdminMovies(),
        loadAdminTheatres(),
        loadAdminShows(),
        loadAdminBookings(),
        loadAdminCustomers()
    ]);
}

// ============================================================
// DASHBOARD STATS
// ============================================================
async function loadDashboardStats() {
    try {
        const response = await apiRequest('/admin/stats', 'GET', null, true);
        const stats = response.stats;

        // Update KPIs
        const kpiRevenue = document.getElementById('kpiRevenue');
        const kpiMovies = document.getElementById('kpiMovies');
        const kpiTheatres = document.getElementById('kpiTheatres');
        const kpiShows = document.getElementById('kpiShows');
        const kpiBookings = document.getElementById('kpiBookings');

        if (kpiRevenue) kpiRevenue.textContent = formatCurrency(stats.total_revenue);
        if (kpiMovies) kpiMovies.textContent = stats.total_movies;
        if (kpiTheatres) kpiTheatres.textContent = stats.total_theatres;
        if (kpiShows) kpiShows.textContent = stats.total_shows;
        if (kpiBookings) kpiBookings.textContent = stats.total_bookings;

        // Render Recent Bookings table on Overview
        const recentTableBody = document.querySelector('#recentBookingsTable tbody');
        if (recentTableBody && stats.recent_bookings) {
            if (stats.recent_bookings.length === 0) {
                recentTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No bookings yet.</td></tr>`;
            } else {
                recentTableBody.innerHTML = stats.recent_bookings.map(b => `
                    <tr>
                        <td><strong>${b.booking_reference}</strong></td>
                        <td>${b.customer_name}</td>
                        <td>${b.movie_title}</td>
                        <td style="color: var(--accent-gold); font-weight: 700;">${formatCurrency(b.total_amount)}</td>
                        <td>
                            <span class="${b.booking_status === 'CONFIRMED' ? 'booking-badge-confirmed' : 'booking-badge-cancelled'}">
                                ${b.booking_status}
                            </span>
                        </td>
                    </tr>
                `).join('');
            }
        }

        // Render Popular Movies
        const popularTableBody = document.querySelector('#popularMoviesTable tbody');
        if (popularTableBody && stats.popular_movies) {
            if (stats.popular_movies.length === 0) {
                popularTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No sales data available.</td></tr>`;
            } else {
                popularTableBody.innerHTML = stats.popular_movies.map(m => `
                    <tr>
                        <td><strong>${m.title}</strong></td>
                        <td>${m.genre}</td>
                        <td><i class="fas fa-ticket-alt" style="color: var(--primary-red);"></i> ${m.tickets_sold} tickets</td>
                        <td style="color: #10b981; font-weight: 700;">${formatCurrency(m.total_earnings)}</td>
                    </tr>
                `).join('');
            }
        }
    } catch (err) {
        console.error('Error loading dashboard stats:', err);
    }
}

// ============================================================
// MOVIES MANAGEMENT
// ============================================================
async function loadAdminMovies() {
    try {
        const response = await apiRequest('/movies');
        adminData.movies = response.movies || [];

        const tabCount = document.getElementById('tabCountMovies');
        if (tabCount) tabCount.textContent = adminData.movies.length;

        renderAdminMoviesTable(adminData.movies);
        populateMovieDropdownForShows();
    } catch (err) {
        showToast('Failed to load movies: ' + err.message, 'error');
    }
}

function renderAdminMoviesTable(movies) {
    const tbody = document.querySelector('#adminMoviesTable tbody');
    if (!tbody) return;

    if (movies.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 2rem;">No movies found.</td></tr>`;
        return;
    }

    tbody.innerHTML = movies.map(m => `
        <tr>
            <td>#${m.movie_id}</td>
            <td>
                <img src="${m.poster_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'}" style="width: 40px; height: 55px; object-fit: cover; border-radius: 4px;">
            </td>
            <td><strong>${m.title}</strong></td>
            <td>${m.genre}</td>
            <td>${m.language}</td>
            <td>${m.duration} mins</td>
            <td>${formatDate(m.release_date)}</td>
            <td><i class="fas fa-star" style="color: var(--accent-gold);"></i> ${m.rating}</td>
            <td><span class="amenity-chip">${m.status}</span></td>
            <td>
                <div style="display: flex; gap: 0.35rem;">
                    <button class="btn btn-outline btn-sm" onclick="editMovie(${m.movie_id})" title="Edit Movie">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteMovie(${m.movie_id}, '${m.title.replace(/'/g, "\\'")}')" title="Delete Movie">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openMovieModal(isEdit = false) {
    const modal = document.getElementById('movieModal');
    const title = document.getElementById('movieModalTitle');
    if (!modal) return;

    if (!isEdit) {
        document.getElementById('movieForm').reset();
        document.getElementById('movieFormId').value = '';
        if (title) title.textContent = 'Add New Movie';
    }
    modal.classList.add('show');
}

function closeMovieModal() {
    const modal = document.getElementById('movieModal');
    if (modal) modal.classList.remove('show');
}

function editMovie(movieId) {
    const movie = adminData.movies.find(m => m.movie_id === movieId);
    if (!movie) return;

    document.getElementById('movieFormId').value = movie.movie_id;
    document.getElementById('movieFormTitle').value = movie.title;
    document.getElementById('movieFormGenre').value = movie.genre;
    document.getElementById('movieFormLanguage').value = movie.language;
    document.getElementById('movieFormDuration').value = movie.duration;
    document.getElementById('movieFormReleaseDate').value = movie.release_date ? movie.release_date.split('T')[0] : '';
    document.getElementById('movieFormRating').value = movie.rating;
    document.getElementById('movieFormStatus').value = movie.status || 'now_showing';
    document.getElementById('movieFormPoster').value = movie.poster_url || '';
    document.getElementById('movieFormBanner').value = movie.banner_url || '';
    document.getElementById('movieFormDesc').value = movie.description || '';

    const title = document.getElementById('movieModalTitle');
    if (title) title.textContent = `Edit Movie: ${movie.title}`;

    openMovieModal(true);
}

async function deleteMovie(movieId, movieTitle) {
    if (!confirm(`Are you sure you want to delete "${movieTitle}"? This will also remove any scheduled shows for this movie.`)) {
        return;
    }

    try {
        await apiRequest(`/movies/${movieId}`, 'DELETE', null, true);
        showToast(`Movie "${movieTitle}" deleted successfully.`, 'success');
        loadAdminMovies();
        loadAdminShows();
        loadDashboardStats();
    } catch (err) {
        showToast(err.message || 'Failed to delete movie.', 'error');
    }
}

// ============================================================
// THEATRES MANAGEMENT
// ============================================================
async function loadAdminTheatres() {
    try {
        const response = await apiRequest('/theatres');
        adminData.theatres = response.theatres || [];

        const tabCount = document.getElementById('tabCountTheatres');
        if (tabCount) tabCount.textContent = adminData.theatres.length;

        renderAdminTheatresTable(adminData.theatres);
        populateTheatreDropdownForShows();
    } catch (err) {
        showToast('Failed to load theatres: ' + err.message, 'error');
    }
}

function renderAdminTheatresTable(theatres) {
    const tbody = document.querySelector('#adminTheatresTable tbody');
    if (!tbody) return;

    if (theatres.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No theatres found.</td></tr>`;
        return;
    }

    tbody.innerHTML = theatres.map(t => `
        <tr>
            <td>#${t.theatre_id}</td>
            <td><strong>${t.theatre_name}</strong></td>
            <td><i class="fas fa-map-marker-alt" style="color: var(--primary-red);"></i> ${t.location}</td>
            <td><i class="fas fa-couch"></i> ${t.total_seats || 60} Seats</td>
            <td><span class="amenity-chip" style="color: #10b981;">${t.active_shows_count || 0} Shows</span></td>
            <td>
                <div style="display: flex; gap: 0.35rem;">
                    <button class="btn btn-outline btn-sm" onclick="editTheatre(${t.theatre_id})" title="Edit Theatre">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteTheatre(${t.theatre_id}, '${t.theatre_name.replace(/'/g, "\\'")}')" title="Delete Theatre">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openTheatreModal(isEdit = false) {
    const modal = document.getElementById('theatreModal');
    const title = document.getElementById('theatreModalTitle');
    if (!modal) return;

    if (!isEdit) {
        document.getElementById('theatreForm').reset();
        document.getElementById('theatreFormId').value = '';
        if (title) title.textContent = 'Add New Theatre';
    }
    modal.classList.add('show');
}

function closeTheatreModal() {
    const modal = document.getElementById('theatreModal');
    if (modal) modal.classList.remove('show');
}

function editTheatre(theatreId) {
    const theatre = adminData.theatres.find(t => t.theatre_id === theatreId);
    if (!theatre) return;

    document.getElementById('theatreFormId').value = theatre.theatre_id;
    document.getElementById('theatreFormName').value = theatre.theatre_name;
    document.getElementById('theatreFormLocation').value = theatre.location;
    document.getElementById('theatreFormSeats').value = theatre.total_seats || 60;

    const title = document.getElementById('theatreModalTitle');
    if (title) title.textContent = `Edit Theatre: ${theatre.theatre_name}`;

    openTheatreModal(true);
}

async function deleteTheatre(theatreId, theatreName) {
    if (!confirm(`Are you sure you want to delete theatre "${theatreName}"? Scheduled shows at this venue will be removed.`)) {
        return;
    }

    try {
        await apiRequest(`/theatres/${theatreId}`, 'DELETE', null, true);
        showToast(`Theatre "${theatreName}" deleted successfully.`, 'success');
        loadAdminTheatres();
        loadAdminShows();
        loadDashboardStats();
    } catch (err) {
        showToast(err.message || 'Failed to delete theatre.', 'error');
    }
}

// ============================================================
// SHOWS MANAGEMENT
// ============================================================
async function loadAdminShows() {
    try {
        const response = await apiRequest('/shows');
        adminData.shows = response.shows || [];

        const tabCount = document.getElementById('tabCountShows');
        if (tabCount) tabCount.textContent = adminData.shows.length;

        renderAdminShowsTable(adminData.shows);
    } catch (err) {
        showToast('Failed to load shows: ' + err.message, 'error');
    }
}

function renderAdminShowsTable(shows) {
    const tbody = document.querySelector('#adminShowsTable tbody');
    if (!tbody) return;

    if (shows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">No scheduled shows found.</td></tr>`;
        return;
    }

    tbody.innerHTML = shows.map(s => `
        <tr>
            <td>#${s.show_id}</td>
            <td><strong>${s.movie_title}</strong></td>
            <td>${s.theatre_name}</td>
            <td><i class="fas fa-calendar"></i> ${formatDate(s.show_date)}</td>
            <td><i class="fas fa-clock"></i> ${formatTime(s.show_time)}</td>
            <td style="color: var(--accent-gold); font-weight: 700;">${formatCurrency(s.ticket_price)}</td>
            <td>
                <span class="amenity-chip" style="color: #10b981; border-color: rgba(16, 185, 129, 0.3);">
                    ${s.available_seats} / ${s.total_seats || 60} Seats Free
                </span>
            </td>
            <td>
                <div style="display: flex; gap: 0.35rem;">
                    <button class="btn btn-outline btn-sm" onclick="editShow(${s.show_id})" title="Edit Show Schedule">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteShow(${s.show_id})" title="Delete Show">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openShowModal(isEdit = false) {
    const modal = document.getElementById('showModal');
    const title = document.getElementById('showModalTitle');
    if (!modal) return;

    if (!isEdit) {
        document.getElementById('showForm').reset();
        document.getElementById('showFormId').value = '';
        if (title) title.textContent = 'Schedule New Show';
    }
    modal.classList.add('show');
}

function closeShowModal() {
    const modal = document.getElementById('showModal');
    if (modal) modal.classList.remove('show');
}

function populateMovieDropdownForShows() {
    const select = document.getElementById('showFormMovie');
    if (!select) return;

    select.innerHTML = '<option value="">Select a movie...</option>' + 
        adminData.movies.map(m => `<option value="${m.movie_id}">${m.title} (${m.language})</option>`).join('');
}

function populateTheatreDropdownForShows() {
    const select = document.getElementById('showFormTheatre');
    if (!select) return;

    select.innerHTML = '<option value="">Select a theatre...</option>' + 
        adminData.theatres.map(t => `<option value="${t.theatre_id}">${t.theatre_name} - ${t.location}</option>`).join('');
}

function editShow(showId) {
    const show = adminData.shows.find(s => s.show_id === showId);
    if (!show) return;

    document.getElementById('showFormId').value = show.show_id;
    document.getElementById('showFormMovie').value = show.movie_id;
    document.getElementById('showFormTheatre').value = show.theatre_id;
    document.getElementById('showFormDate').value = show.show_date ? show.show_date.split('T')[0] : '';
    document.getElementById('showFormTime').value = show.show_time || '';
    document.getElementById('showFormPrice').value = show.ticket_price;

    const title = document.getElementById('showModalTitle');
    if (title) title.textContent = `Update Show #${show.show_id}`;

    openShowModal(true);
}

async function deleteShow(showId) {
    if (!confirm(`Are you sure you want to delete Show #${showId}? Any existing bookings will be removed.`)) {
        return;
    }

    try {
        await apiRequest(`/shows/${showId}`, 'DELETE', null, true);
        showToast(`Show #${showId} removed successfully.`, 'success');
        loadAdminShows();
        loadDashboardStats();
    } catch (err) {
        showToast(err.message || 'Failed to delete show.', 'error');
    }
}

// ============================================================
// BOOKINGS MANAGEMENT
// ============================================================
async function loadAdminBookings() {
    try {
        const response = await apiRequest('/bookings', 'GET', null, true);
        adminData.bookings = response.bookings || [];

        const tabCount = document.getElementById('tabCountBookings');
        if (tabCount) tabCount.textContent = adminData.bookings.length;

        renderAdminBookingsTable(adminData.bookings);
    } catch (err) {
        showToast('Failed to load bookings: ' + err.message, 'error');
    }
}

function renderAdminBookingsTable(bookings) {
    const tbody = document.querySelector('#adminBookingsTable tbody');
    if (!tbody) return;

    if (bookings.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 2rem;">No bookings recorded in MySQL.</td></tr>`;
        return;
    }

    tbody.innerHTML = bookings.map(b => `
        <tr>
            <td>#${b.booking_id}</td>
            <td><strong>${b.booking_reference}</strong></td>
            <td>
                <div><strong>${b.customer_name}</strong></div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${b.customer_email}</div>
            </td>
            <td>${b.movie_title}</td>
            <td>${b.theatre_name}</td>
            <td>${formatDate(b.show_date)} ${formatTime(b.show_time)}</td>
            <td><strong>${b.seat_numbers || 'N/A'}</strong> (${b.seat_count})</td>
            <td style="color: var(--accent-gold); font-weight: 700;">${formatCurrency(b.total_amount)}</td>
            <td>
                <span class="${b.booking_status === 'CONFIRMED' ? 'booking-badge-confirmed' : 'booking-badge-cancelled'}">
                    ${b.booking_status}
                </span>
            </td>
            <td>
                ${b.booking_status === 'CONFIRMED' ? `
                    <button class="btn btn-danger btn-sm" onclick="cancelAdminBooking(${b.booking_id}, '${b.booking_reference}')" title="Cancel Booking">
                        <i class="fas fa-ban"></i> Cancel
                    </button>
                ` : `
                    <span style="font-size: 0.8rem; color: var(--text-muted);">Cancelled</span>
                `}
            </td>
        </tr>
    `).join('');
}

async function cancelAdminBooking(bookingId, reference) {
    if (!confirm(`Cancel booking ${reference}? The reserved seats will be freed.`)) return;

    try {
        await apiRequest(`/bookings/${bookingId}/cancel`, 'PUT', null, true);
        showToast(`Booking ${reference} cancelled.`, 'success');
        loadAdminBookings();
        loadDashboardStats();
    } catch (err) {
        showToast(err.message || 'Failed to cancel booking.', 'error');
    }
}

// ============================================================
// CUSTOMERS MANAGEMENT
// ============================================================
async function loadAdminCustomers() {
    try {
        const response = await apiRequest('/users/customers', 'GET', null, true);
        adminData.customers = response.customers || [];

        const tabCount = document.getElementById('tabCountCustomers');
        if (tabCount) tabCount.textContent = adminData.customers.length;

        renderAdminCustomersTable(adminData.customers);
    } catch (err) {
        showToast('Failed to load customers: ' + err.message, 'error');
    }
}

function renderAdminCustomersTable(customers) {
    const tbody = document.querySelector('#adminCustomersTable tbody');
    if (!tbody) return;

    if (customers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No registered customers yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = customers.map(c => `
        <tr>
            <td>#${c.user_id}</td>
            <td><strong>${c.name}</strong></td>
            <td>${c.email}</td>
            <td>${c.phone || 'N/A'}</td>
            <td>${formatDate(c.created_at)}</td>
            <td><span class="amenity-chip"><i class="fas fa-ticket-alt"></i> ${c.total_bookings} bookings</span></td>
            <td style="color: #10b981; font-weight: 700;">${formatCurrency(c.total_spent)}</td>
        </tr>
    `).join('');
}

// ============================================================
// FORM SUBMISSIONS & TABS SETUP
// ============================================================
function setupAdminTabs() {
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const target = btn.dataset.tab;
            const content = document.getElementById(target);
            if (content) content.classList.add('active');
        });
    });
}

function setupAdminForms() {
    // Movie Form
    const movieForm = document.getElementById('movieForm');
    if (movieForm) {
        movieForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('movieFormId').value;
            const payload = {
                title: document.getElementById('movieFormTitle').value.trim(),
                genre: document.getElementById('movieFormGenre').value.trim(),
                language: document.getElementById('movieFormLanguage').value.trim(),
                duration: document.getElementById('movieFormDuration').value,
                release_date: document.getElementById('movieFormReleaseDate').value,
                rating: document.getElementById('movieFormRating').value,
                status: document.getElementById('movieFormStatus').value,
                poster_url: document.getElementById('movieFormPoster').value.trim(),
                banner_url: document.getElementById('movieFormBanner').value.trim(),
                description: document.getElementById('movieFormDesc').value.trim()
            };

            try {
                if (id) {
                    await apiRequest(`/movies/${id}`, 'PUT', payload, true);
                    showToast('Movie updated successfully!', 'success');
                } else {
                    await apiRequest('/movies', 'POST', payload, true);
                    showToast('Movie created successfully!', 'success');
                }
                closeMovieModal();
                loadAdminMovies();
                loadDashboardStats();
            } catch (err) {
                showToast(err.message || 'Failed to save movie.', 'error');
            }
        });
    }

    // Theatre Form
    const theatreForm = document.getElementById('theatreForm');
    if (theatreForm) {
        theatreForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('theatreFormId').value;
            const payload = {
                theatre_name: document.getElementById('theatreFormName').value.trim(),
                location: document.getElementById('theatreFormLocation').value.trim(),
                total_seats: document.getElementById('theatreFormSeats').value
            };

            try {
                if (id) {
                    await apiRequest(`/theatres/${id}`, 'PUT', payload, true);
                    showToast('Theatre updated successfully!', 'success');
                } else {
                    await apiRequest('/theatres', 'POST', payload, true);
                    showToast('Theatre created successfully!', 'success');
                }
                closeTheatreModal();
                loadAdminTheatres();
                loadDashboardStats();
            } catch (err) {
                showToast(err.message || 'Failed to save theatre.', 'error');
            }
        });
    }

    // Show Form
    const showForm = document.getElementById('showForm');
    if (showForm) {
        showForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('showFormId').value;
            const payload = {
                movie_id: document.getElementById('showFormMovie').value,
                theatre_id: document.getElementById('showFormTheatre').value,
                show_date: document.getElementById('showFormDate').value,
                show_time: document.getElementById('showFormTime').value,
                ticket_price: document.getElementById('showFormPrice').value
            };

            try {
                if (id) {
                    await apiRequest(`/shows/${id}`, 'PUT', payload, true);
                    showToast('Show schedule updated successfully!', 'success');
                } else {
                    await apiRequest('/shows', 'POST', payload, true);
                    showToast('New show scheduled successfully!', 'success');
                }
                closeShowModal();
                loadAdminShows();
                loadDashboardStats();
            } catch (err) {
                showToast(err.message || 'Failed to schedule show.', 'error');
            }
        });
    }
}

function setupTableSearches() {
    // Movies Search
    const movieSearch = document.getElementById('adminMovieSearch');
    if (movieSearch) {
        movieSearch.addEventListener('input', () => {
            const q = movieSearch.value.toLowerCase().trim();
            const filtered = adminData.movies.filter(m => 
                m.title.toLowerCase().includes(q) || 
                m.genre.toLowerCase().includes(q) || 
                m.language.toLowerCase().includes(q)
            );
            renderAdminMoviesTable(filtered);
        });
    }

    // Theatres Search
    const theatreSearch = document.getElementById('adminTheatreSearch');
    if (theatreSearch) {
        theatreSearch.addEventListener('input', () => {
            const q = theatreSearch.value.toLowerCase().trim();
            const filtered = adminData.theatres.filter(t => 
                t.theatre_name.toLowerCase().includes(q) || 
                t.location.toLowerCase().includes(q)
            );
            renderAdminTheatresTable(filtered);
        });
    }

    // Shows Search
    const showSearch = document.getElementById('adminShowSearch');
    if (showSearch) {
        showSearch.addEventListener('input', () => {
            const q = showSearch.value.toLowerCase().trim();
            const filtered = adminData.shows.filter(s => 
                s.movie_title.toLowerCase().includes(q) || 
                s.theatre_name.toLowerCase().includes(q)
            );
            renderAdminShowsTable(filtered);
        });
    }

    // Bookings Search & Filter
    const bookingSearch = document.getElementById('adminBookingSearch');
    const bookingStatus = document.getElementById('adminBookingStatusFilter');

    function filterBookings() {
        const q = (bookingSearch ? bookingSearch.value : '').toLowerCase().trim();
        const status = bookingStatus ? bookingStatus.value : 'all';

        const filtered = adminData.bookings.filter(b => {
            const matchesQ = !q || 
                b.booking_reference.toLowerCase().includes(q) ||
                b.customer_name.toLowerCase().includes(q) ||
                b.customer_email.toLowerCase().includes(q) ||
                b.movie_title.toLowerCase().includes(q);
            const matchesStatus = status === 'all' || b.booking_status === status;
            return matchesQ && matchesStatus;
        });

        renderAdminBookingsTable(filtered);
    }

    if (bookingSearch) bookingSearch.addEventListener('input', filterBookings);
    if (bookingStatus) bookingStatus.addEventListener('change', filterBookings);
}
