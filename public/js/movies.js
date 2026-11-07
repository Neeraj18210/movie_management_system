// ============================================================
// MOVIE TICKET MANAGEMENT SYSTEM - MOVIES CATALOG SCRIPT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    loadMoviesCatalog();
    setupCatalogEventListeners();
});

let catalogMovies = [];

async function loadMoviesCatalog() {
    const grid = document.getElementById('allMoviesGrid');

    try {
        const response = await apiRequest('/movies');
        catalogMovies = response.movies || [];
        filterAndRenderCatalog();
    } catch (err) {
        if (grid) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
                    <i class="fas fa-exclamation-circle fa-2x" style="color: var(--primary-red); margin-bottom: 1rem;"></i>
                    <h3>Error loading movies from database</h3>
                    <p style="color: var(--text-muted); margin-top: 0.5rem;">${err.message}</p>
                    <button class="btn btn-primary btn-sm" style="margin-top: 1.5rem;" onclick="loadMoviesCatalog()">Retry</button>
                </div>
            `;
        }
    }
}

function filterAndRenderCatalog() {
    const searchInput = document.getElementById('movieSearchInput');
    const genreSelect = document.getElementById('genreSelect');
    const langSelect = document.getElementById('languageSelect');
    const sortSelect = document.getElementById('sortSelect');
    const grid = document.getElementById('allMoviesGrid');

    if (!grid) return;

    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const genre = genreSelect ? genreSelect.value : 'all';
    const lang = langSelect ? langSelect.value : 'all';
    const sort = sortSelect ? sortSelect.value : 'rating';

    let result = catalogMovies.filter(movie => {
        const matchQuery = !query || 
            movie.title.toLowerCase().includes(query) || 
            (movie.description && movie.description.toLowerCase().includes(query));
        const matchGenre = genre === 'all' || movie.genre.toLowerCase() === genre.toLowerCase();
        const matchLang = lang === 'all' || movie.language.toLowerCase() === lang.toLowerCase();

        return matchQuery && matchGenre && matchLang;
    });

    // Sort
    result.sort((a, b) => {
        if (sort === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sort === 'newest') return new Date(b.release_date) - new Date(a.release_date);
        if (sort === 'title') return a.title.localeCompare(b.title);
        return 0;
    });

    if (result.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
                <i class="fas fa-film fa-2x" style="color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3>No movies found</h3>
                <p style="color: var(--text-muted); margin-top: 0.5rem;">Try adjusting your search criteria or filters.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = result.map(movie => `
        <div class="movie-card">
            <div class="movie-poster-wrap">
                <img src="${movie.poster_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'}" alt="${movie.title}" class="movie-poster" loading="lazy">
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
                        <i class="fas fa-ticket-alt"></i> Book
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

function setupCatalogEventListeners() {
    const searchInput = document.getElementById('movieSearchInput');
    const genreSelect = document.getElementById('genreSelect');
    const langSelect = document.getElementById('languageSelect');
    const sortSelect = document.getElementById('sortSelect');

    if (searchInput) searchInput.addEventListener('input', filterAndRenderCatalog);
    if (genreSelect) genreSelect.addEventListener('change', filterAndRenderCatalog);
    if (langSelect) langSelect.addEventListener('change', filterAndRenderCatalog);
    if (sortSelect) sortSelect.addEventListener('change', filterAndRenderCatalog);
}
