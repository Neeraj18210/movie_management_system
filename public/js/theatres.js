// ============================================================
// MOVIE TICKET MANAGEMENT SYSTEM - THEATRES SCRIPT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    loadTheatres();
    setupTheatreSearch();
});

let theatresList = [];

async function loadTheatres() {
    const grid = document.getElementById('theatresGrid');

    try {
        const response = await apiRequest('/theatres');
        theatresList = response.theatres || [];
        renderTheatres(theatresList);
    } catch (err) {
        if (grid) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
                    <i class="fas fa-exclamation-triangle fa-2x" style="color: var(--primary-red); margin-bottom: 1rem;"></i>
                    <h3>Error Loading Theatres</h3>
                    <p style="color: var(--text-muted); margin-top: 0.5rem;">${err.message}</p>
                </div>
            `;
        }
    }
}

function renderTheatres(theatres) {
    const grid = document.getElementById('theatresGrid');
    if (!grid) return;

    if (theatres.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
                <i class="fas fa-building fa-2x" style="color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3>No Theatres Found</h3>
                <p style="color: var(--text-muted); margin-top: 0.5rem;">Try refining your search keyword.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = theatres.map(t => `
        <div class="theatre-card">
            <div class="theatre-header">
                <div class="theatre-icon-box">
                    <i class="fas fa-film"></i>
                </div>
                <div>
                    <h3 class="theatre-title">${t.theatre_name}</h3>
                    <p class="theatre-location"><i class="fas fa-map-marker-alt"></i> ${t.location}</p>
                </div>
            </div>

            <div class="theatre-amenities">
                <span class="amenity-chip"><i class="fas fa-volume-up"></i> Dolby Atmos</span>
                <span class="amenity-chip"><i class="fas fa-eye"></i> 4K Laser</span>
                <span class="amenity-chip"><i class="fas fa-utensils"></i> Gourmet Snack Bar</span>
                <span class="amenity-chip"><i class="fas fa-wheelchair"></i> Accessible</span>
            </div>

            <div class="theatre-footer">
                <span class="seats-badge">
                    <i class="fas fa-couch"></i> <strong>${t.total_seats || 60}</strong> Total Seats
                </span>
                <a href="/pages/shows.html?theatre_id=${t.theatre_id}" class="btn btn-primary btn-sm">
                    <i class="fas fa-calendar-check"></i> View Shows (${t.active_shows_count || 0})
                </a>
            </div>
        </div>
    `).join('');
}

function setupTheatreSearch() {
    const searchInput = document.getElementById('theatreSearchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        const filtered = theatresList.filter(t => 
            t.theatre_name.toLowerCase().includes(query) || 
            t.location.toLowerCase().includes(query)
        );
        renderTheatres(filtered);
    });
}
