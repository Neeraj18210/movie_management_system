// ============================================================
// MOVIE TICKET MANAGEMENT SYSTEM - SHOW TIMINGS SCRIPT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initShowsPage();
});

let allShows = [];

async function initShowsPage() {
    await populateFilterDropdowns();
    setupShowFilterListeners();
    await loadShows();
}

async function populateFilterDropdowns() {
    const movieSelect = document.getElementById('showMovieFilter');
    const theatreSelect = document.getElementById('showTheatreFilter');

    try {
        const [movieRes, theatreRes] = await Promise.all([
            apiRequest('/movies'),
            apiRequest('/theatres')
        ]);

        if (movieSelect && movieRes.movies) {
            const urlMovieId = getUrlParam('movie_id');
            movieSelect.innerHTML = '<option value="">All Movies</option>' + 
                movieRes.movies.map(m => `
                    <option value="${m.movie_id}" ${urlMovieId == m.movie_id ? 'selected' : ''}>
                        ${m.title} (${m.language})
                    </option>
                `).join('');
        }

        if (theatreSelect && theatreRes.theatres) {
            const urlTheatreId = getUrlParam('theatre_id');
            theatreSelect.innerHTML = '<option value="">All Theatres</option>' + 
                theatreRes.theatres.map(t => `
                    <option value="${t.theatre_id}" ${urlTheatreId == t.theatre_id ? 'selected' : ''}>
                        ${t.theatre_name} - ${t.location}
                    </option>
                `).join('');
        }
    } catch (err) {
        console.error('Error loading filter options:', err);
    }
}

async function loadShows() {
    const container = document.getElementById('showsListContainer');
    const movieSelect = document.getElementById('showMovieFilter');
    const theatreSelect = document.getElementById('showTheatreFilter');
    const dateInput = document.getElementById('showDateFilter');

    const movieId = movieSelect ? movieSelect.value : '';
    const theatreId = theatreSelect ? theatreSelect.value : '';
    const date = dateInput ? dateInput.value : '';

    let endpoint = '/shows?';
    if (movieId) endpoint += `movie_id=${movieId}&`;
    if (theatreId) endpoint += `theatre_id=${theatreId}&`;
    if (date) endpoint += `date=${date}&`;

    try {
        const response = await apiRequest(endpoint);
        allShows = response.shows || [];
        renderShowsList(allShows);
    } catch (err) {
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
                    <i class="fas fa-exclamation-circle fa-2x" style="color: var(--primary-red); margin-bottom: 1rem;"></i>
                    <h3>Error loading show timings</h3>
                    <p style="color: var(--text-muted); margin-top: 0.5rem;">${err.message}</p>
                </div>
            `;
        }
    }
}

function renderShowsList(shows) {
    const container = document.getElementById('showsListContainer');
    if (!container) return;

    if (shows.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3.5rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
                <i class="fas fa-calendar-times fa-3x" style="color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3>No Matching Shows Found</h3>
                <p style="color: var(--text-muted); margin: 0.5rem 0 1.5rem;">There are currently no scheduled shows matching your selected filters.</p>
                <button class="btn btn-outline btn-sm" onclick="resetFilters()"><i class="fas fa-undo"></i> Reset Filters</button>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
            ${shows.map(show => `
                <div class="booking-item-card" style="border-left: 4px solid var(--primary-red);">
                    <div class="booking-info-left">
                        <img src="${show.poster_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'}" alt="${show.movie_title}" class="booking-poster-thumb">
                        <div>
                            <h3 class="booking-item-title">${show.movie_title}</h3>
                            <div class="booking-item-details">
                                <span><i class="fas fa-building" style="color: var(--accent-gold);"></i> <strong>${show.theatre_name}</strong> &bull; ${show.theatre_location}</span>
                                <span><i class="fas fa-calendar"></i> ${formatDate(show.show_date)} at <strong style="color: #fff;">${formatTime(show.show_time)}</strong></span>
                                <span><i class="fas fa-tag"></i> ${show.genre} &bull; ${show.language} &bull; ${show.duration} mins</span>
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; align-items: center; gap: 2rem; flex-wrap: wrap;">
                        <div style="text-align: right;">
                            <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Ticket Price</div>
                            <div style="font-size: 1.35rem; font-weight: 800; color: var(--accent-gold);">${formatCurrency(show.ticket_price)}</div>
                            <div style="font-size: 0.75rem; color: #10b981; font-weight: 600;">
                                <i class="fas fa-chair"></i> ${show.available_seats} / ${show.total_seats || 60} Seats Free
                            </div>
                        </div>
                        <a href="/pages/seats.html?show_id=${show.show_id}" class="btn btn-primary btn-sm">
                            <i class="fas fa-couch"></i> Select Seats
                        </a>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function setupShowFilterListeners() {
    const movieSelect = document.getElementById('showMovieFilter');
    const theatreSelect = document.getElementById('showTheatreFilter');
    const dateInput = document.getElementById('showDateFilter');
    const resetBtn = document.getElementById('resetShowsFilterBtn');

    if (movieSelect) movieSelect.addEventListener('change', loadShows);
    if (theatreSelect) theatreSelect.addEventListener('change', loadShows);
    if (dateInput) dateInput.addEventListener('change', loadShows);
    if (resetBtn) resetBtn.addEventListener('click', resetFilters);
}

function resetFilters() {
    const movieSelect = document.getElementById('showMovieFilter');
    const theatreSelect = document.getElementById('showTheatreFilter');
    const dateInput = document.getElementById('showDateFilter');

    if (movieSelect) movieSelect.value = '';
    if (theatreSelect) theatreSelect.value = '';
    if (dateInput) dateInput.value = '';

    loadShows();
}
