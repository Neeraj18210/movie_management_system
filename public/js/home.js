// ============================================================
// MOVIE TICKET MANAGEMENT SYSTEM - HOME PAGE SCRIPT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    loadHomeMovies();
    setupFilters();
});

let allMoviesList = [];

async function loadHomeMovies() {
    const nowShowingGrid = document.getElementById('nowShowingGrid');
    const upcomingGrid = document.getElementById('upcomingGrid');

    try {
        const response = await apiRequest('/movies');
        allMoviesList = response.movies || [];

        renderMovieGrids(allMoviesList);

        // Update hero banner if movies exist
        if (allMoviesList.length > 0) {
            setupHeroBanner(allMoviesList[0]);
        }
    } catch (err) {
        if (nowShowingGrid) {
            nowShowingGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
                    <i class="fas fa-exclamation-triangle fa-2x" style="color: var(--accent-gold); margin-bottom: 1rem;"></i>
                    <h3>Unable to load movies from MySQL</h3>
                    <p style="color: var(--text-muted); margin: 0.5rem 0 1.5rem;">
                        Please verify that your MySQL server is running in MySQL Workbench and database.sql has been executed.
                    </p>
                    <button class="btn btn-primary" onclick="loadHomeMovies()">
                        <i class="fas fa-redo"></i> Retry Connection
                    </button>
                </div>
            `;
        }
    }
}

function setupHeroBanner(movie) {
    const backdrop = document.getElementById('heroBackdrop');
    const title = document.getElementById('heroTitle');
    const rating = document.getElementById('heroRating');
    const genre = document.getElementById('heroGenre');
    const duration = document.getElementById('heroDuration');
    const language = document.getElementById('heroLanguage');
    const desc = document.getElementById('heroDesc');
    const bookBtn = document.getElementById('heroBookBtn');
    const detailsBtn = document.getElementById('heroDetailsBtn');

    if (backdrop && movie.banner_url) {
        backdrop.style.backgroundImage = `url('${movie.banner_url}')`;
    }
    if (title) title.textContent = movie.title;
    if (rating) rating.innerHTML = `<i class="fas fa-star"></i> ${movie.rating || 8.5}`;
    if (genre) genre.innerHTML = `<i class="fas fa-film"></i> ${movie.genre}`;
    if (duration) duration.innerHTML = `<i class="fas fa-clock"></i> ${movie.duration} mins`;
    if (language) language.innerHTML = `<i class="fas fa-language"></i> ${movie.language}`;
    if (desc) desc.textContent = movie.description || 'Experience the cinema thrill on the big screen.';
    
    if (bookBtn) bookBtn.href = `/pages/shows.html?movie_id=${movie.movie_id}`;
    if (detailsBtn) detailsBtn.href = `/pages/movie-details.html?id=${movie.movie_id}`;
}

function renderMovieGrids(movies) {
    const nowShowingGrid = document.getElementById('nowShowingGrid');
    const upcomingGrid = document.getElementById('upcomingGrid');

    const nowShowing = movies.filter(m => m.status === 'now_showing' || !m.status);
    const upcoming = movies.filter(m => m.status === 'upcoming');

    if (nowShowingGrid) {
        if (nowShowing.length === 0) {
            nowShowingGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No current movies match the criteria.</p>`;
        } else {
            nowShowingGrid.innerHTML = nowShowing.map(movie => createMovieCardHTML(movie, false)).join('');
        }
    }

    if (upcomingGrid) {
        if (upcoming.length === 0) {
            upcomingGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No upcoming movies at the moment.</p>`;
        } else {
            upcomingGrid.innerHTML = upcoming.map(movie => createMovieCardHTML(movie, true)).join('');
        }
    }
}

function createMovieCardHTML(movie, isUpcoming = false) {
    const poster = movie.poster_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';
    return `
    <div class="movie-card">
        <div class="movie-poster-wrap">
            <img src="${poster}" alt="${movie.title}" class="movie-poster" loading="lazy">
            <div class="poster-overlay"></div>
            <span class="movie-rating-badge"><i class="fas fa-star"></i> ${movie.rating || 8.0}</span>
            <span class="movie-lang-badge">${movie.language}</span>
        </div>
        <div class="movie-card-info">
            <h3 class="movie-card-title" title="${movie.title}">${movie.title}</h3>
            <div class="movie-card-meta">
                <span class="movie-card-genre">${movie.genre}</span>
                <span><i class="fas fa-clock"></i> ${movie.duration}m</span>
            </div>
            <div class="movie-card-actions">
                <a href="/pages/movie-details.html?id=${movie.movie_id}" class="btn btn-outline btn-sm">
                    <i class="fas fa-info-circle"></i> Details
                </a>
                <a href="/pages/shows.html?movie_id=${movie.movie_id}" class="btn btn-primary btn-sm">
                    <i class="fas fa-ticket-alt"></i> ${isUpcoming ? 'Advance' : 'Book'}
                </a>
            </div>
        </div>
    </div>
    `;
}

function setupFilters() {
    const searchInput = document.getElementById('homeSearchInput');
    const genreFilter = document.getElementById('genreFilter');
    const languageFilter = document.getElementById('languageFilter');
    const applyBtn = document.getElementById('applyFilterBtn');

    function applyFilterAction() {
        const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
        const genre = genreFilter ? genreFilter.value : 'all';
        const lang = languageFilter ? languageFilter.value : 'all';

        const filtered = allMoviesList.filter(movie => {
            const matchesQuery = !query || 
                movie.title.toLowerCase().includes(query) || 
                (movie.description && movie.description.toLowerCase().includes(query));
            const matchesGenre = genre === 'all' || movie.genre.toLowerCase() === genre.toLowerCase();
            const matchesLang = lang === 'all' || movie.language.toLowerCase() === lang.toLowerCase();

            return matchesQuery && matchesGenre && matchesLang;
        });

        renderMovieGrids(filtered);
    }

    if (applyBtn) applyBtn.addEventListener('click', applyFilterAction);
    if (searchInput) searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') applyFilterAction();
    });
}
