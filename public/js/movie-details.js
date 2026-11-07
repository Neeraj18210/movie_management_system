// ============================================================
// MOVIE TICKET MANAGEMENT SYSTEM - MOVIE DETAILS SCRIPT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    loadMovieDetails();
});

async function loadMovieDetails() {
    const container = document.getElementById('movieDetailsContainer');
    const movieId = getUrlParam('id') || 1;

    try {
        const response = await apiRequest(`/movies/${movieId}`);
        const movie = response.movie;
        const shows = response.shows || [];

        renderMovieDetails(movie, shows);
    } catch (err) {
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 4rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
                    <i class="fas fa-exclamation-triangle fa-2x" style="color: var(--primary-red); margin-bottom: 1rem;"></i>
                    <h2>Movie Not Found</h2>
                    <p style="color: var(--text-muted); margin: 0.5rem 0 1.5rem;">${err.message}</p>
                    <a href="/pages/movies.html" class="btn btn-primary"><i class="fas fa-arrow-left"></i> Back to Movies</a>
                </div>
            `;
        }
    }
}

function renderMovieDetails(movie, shows) {
    const container = document.getElementById('movieDetailsContainer');
    if (!container) return;

    // Group shows by Theatre
    const showsByTheatre = {};
    shows.forEach(show => {
        if (!showsByTheatre[show.theatre_name]) {
            showsByTheatre[show.theatre_name] = {
                theatre_id: show.theatre_id,
                theatre_name: show.theatre_name,
                location: show.location,
                total_seats: show.total_seats,
                timings: []
            };
        }
        showsByTheatre[show.theatre_name].timings.push(show);
    });

    const theatresList = Object.values(showsByTheatre);

    container.innerHTML = `
    <!-- Top Details Hero -->
    <div class="hero-banner" style="min-height: 420px; margin-bottom: 2.5rem;">
        <div class="hero-backdrop" style="background-image: url('${movie.banner_url || movie.poster_url}'); filter: brightness(0.45);"></div>
        <div class="hero-overlay"></div>
        <div class="hero-content" style="max-width: 900px; display: flex; gap: 2rem; align-items: flex-end; flex-wrap: wrap;">
            <img src="${movie.poster_url}" alt="${movie.title}" style="width: 180px; aspect-ratio: 2/3; border-radius: var(--radius-md); object-fit: cover; box-shadow: 0 10px 30px rgba(0,0,0,0.8); border: 1px solid var(--border-light);" class="detail-poster">
            <div style="flex: 1; min-width: 280px;">
                <span class="hero-badge"><i class="fas fa-check-circle"></i> ${movie.status === 'upcoming' ? 'Upcoming' : 'Now Showing'}</span>
                <h1 style="font-size: 2.5rem; line-height: 1.1; margin-bottom: 0.75rem;">${movie.title}</h1>
                <div class="hero-meta" style="margin-bottom: 1rem;">
                    <span class="rating"><i class="fas fa-star"></i> ${movie.rating || 8.5}/10</span>
                    <span><i class="fas fa-film"></i> ${movie.genre}</span>
                    <span><i class="fas fa-language"></i> ${movie.language}</span>
                    <span><i class="fas fa-clock"></i> ${movie.duration} minutes</span>
                    <span><i class="fas fa-calendar"></i> Released: ${formatDate(movie.release_date)}</span>
                </div>
                <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; max-width: 700px;">
                    ${movie.description || 'Experience the cinema thrill on the big screen.'}
                </p>
            </div>
        </div>
    </div>

    <!-- Available Theatres & Showtimes Section -->
    <section>
        <div class="section-header">
            <div>
                <h2 class="section-title"><i class="fas fa-video"></i> Available Theatres & Timings</h2>
                <p class="section-subtitle">Select your preferred theatre and showtime to choose your seats</p>
            </div>
        </div>

        ${theatresList.length === 0 ? `
            <div style="text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
                <i class="fas fa-calendar-times fa-2x" style="color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3>No shows scheduled for this movie yet</h3>
                <p style="color: var(--text-muted); margin: 0.5rem 0 1.5rem;">Check back shortly or view other movies currently playing.</p>
                <a href="/pages/shows.html" class="btn btn-primary"><i class="fas fa-clock"></i> View All Showtimes</a>
            </div>
        ` : `
            <div class="theatres-shows-stack">
                ${theatresList.map(t => `
                    <div class="show-theatre-block">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
                            <div>
                                <h3 class="show-theatre-title"><i class="fas fa-map-marker-alt" style="color: var(--primary-red);"></i> ${t.theatre_name}</h3>
                                <p class="show-theatre-loc"><i class="fas fa-location-arrow"></i> ${t.location}</p>
                            </div>
                            <span class="amenity-chip" style="color: var(--accent-gold); border-color: var(--border-gold);">
                                <i class="fas fa-couch"></i> Capacity: ${t.total_seats || 60} Seats
                            </span>
                        </div>

                        <div class="timings-chips-grid">
                            ${t.timings.map(s => `
                                <a href="/pages/seats.html?show_id=${s.show_id}" class="time-slot-card" title="Click to select seats">
                                    <span class="time">${formatTime(s.show_time)}</span>
                                    <span style="font-size: 0.75rem; color: var(--text-muted);">${formatDate(s.show_date)}</span>
                                    <span class="price">${formatCurrency(s.ticket_price)}</span>
                                    <span class="available-tag"><i class="fas fa-chair"></i> Select Seats</span>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `}
    </section>
    `;
}
