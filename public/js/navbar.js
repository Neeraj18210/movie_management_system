// ============================================================
// MOVIE TICKET MANAGEMENT SYSTEM - DYNAMIC NAVBAR & FOOTER
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();
    renderFooter();
});

function renderNavbar() {
    const navPlaceholder = document.getElementById('navbar-placeholder');
    if (!navPlaceholder) return;

    const user = Auth.getUser();
    const isLoggedIn = Auth.isLoggedIn();
    const isAdmin = Auth.isAdmin();

    // Determine current active page
    const currentPath = window.location.pathname;

    const navHTML = `
    <nav class="navbar">
        <div class="container">
            <a href="/pages/index.html" class="brand-logo">
                <div class="logo-icon"><i class="fas fa-ticket-alt"></i></div>
                <span>Neeraj <span class="red">Movie</span> <span class="gold">Theatre</span></span>
            </a>

            <div class="nav-links" id="mainNavLinks">
                <a href="/pages/index.html" class="${currentPath.includes('index') || currentPath === '/' ? 'active' : ''}">
                    <i class="fas fa-home"></i> Home
                </a>
                <a href="/pages/movies.html" class="${currentPath.includes('movies') ? 'active' : ''}">
                    <i class="fas fa-film"></i> Movies
                </a>
                <a href="/pages/theatres.html" class="${currentPath.includes('theatres') ? 'active' : ''}">
                    <i class="fas fa-city"></i> Theatres
                </a>
                <a href="/pages/shows.html" class="${currentPath.includes('shows') ? 'active' : ''}">
                    <i class="fas fa-clock"></i> Showtimes
                </a>
                ${isLoggedIn ? `
                <a href="/pages/my-bookings.html" class="${currentPath.includes('my-bookings') ? 'active' : ''}">
                    <i class="fas fa-bookmark"></i> My Bookings
                </a>
                ` : ''}
                ${isAdmin ? `
                <a href="/pages/admin.html" class="${currentPath.includes('admin') ? 'active' : ''}" style="color: var(--accent-gold);">
                    <i class="fas fa-shield-alt"></i> Admin Panel
                </a>
                ` : ''}
            </div>

            <div class="nav-actions">
                ${isLoggedIn ? `
                    <div class="user-menu">
                        <div class="user-avatar">${(user.name || 'U').charAt(0).toUpperCase()}</div>
                        <div class="user-name-role">
                            <span class="user-name">${user.name || 'Customer'}</span>
                            <span class="user-role">${user.role === 'admin' ? '⭐ Admin' : 'Customer'}</span>
                        </div>
                    </div>
                    <button onclick="Auth.logout()" class="btn btn-outline btn-sm" title="Sign Out">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                ` : `
                    <a href="/pages/login.html" class="btn btn-outline btn-sm">Sign In</a>
                    <a href="/pages/register.html" class="btn btn-primary btn-sm">Register</a>
                `}
                <button class="nav-toggle-btn" id="navToggleBtn" onclick="toggleMobileNav()">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
        </div>
    </nav>
    `;

    navPlaceholder.innerHTML = navHTML;
}

function toggleMobileNav() {
    const navLinks = document.getElementById('mainNavLinks');
    if (navLinks) {
        if (navLinks.style.display === 'flex') {
            navLinks.style.display = 'none';
        } else {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.background = 'var(--bg-secondary)';
            navLinks.style.padding = '1.5rem';
            navLinks.style.borderBottom = '1px solid var(--border-light)';
        }
    }
}

function renderFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (!footerPlaceholder) return;

    footerPlaceholder.innerHTML = `
    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-col">
                    <a href="/pages/index.html" class="brand-logo" style="margin-bottom: 1rem; display: inline-flex;">
                        <div class="logo-icon"><i class="fas fa-ticket-alt"></i></div>
                        <span>Neeraj <span class="red">Movie</span> <span class="gold">Theatre</span></span>
                    </a>
                    <p style="color: var(--text-muted); font-size: 0.9rem; max-width: 320px;">
                        Welcome to Neeraj Movie Theatre. Experience effortless cinema seat bookings, instant confirmations, and real-time showtimes.
                    </p>
                </div>
                <div class="footer-col">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="/pages/index.html">Home</a></li>
                        <li><a href="/pages/movies.html">All Movies</a></li>
                        <li><a href="/pages/theatres.html">Theatres</a></li>
                        <li><a href="/pages/shows.html">Show Timings</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>Account</h4>
                    <ul>
                        <li><a href="/pages/login.html">Customer Sign In</a></li>
                        <li><a href="/pages/register.html">Create Account</a></li>
                        <li><a href="/pages/my-bookings.html">Booking History</a></li>
                        <li><a href="/pages/admin.html">Admin Dashboard</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>System Info</h4>
                    <ul>
                        <li><span style="color: #10b981;">● MySQL Connected</span></li>
                        <li><span>Express & Node.js</span></li>
                        <li><span>Real-time Concurrency</span></li>
                        <li><span>Port: 5000</span></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} Neeraj Movie Theatre. Connected to MySQL Database.</p>
                <div style="display: flex; gap: 1rem; font-size: 1.1rem; color: var(--text-muted);">
                    <i class="fab fa-facebook"></i>
                    <i class="fab fa-twitter"></i>
                    <i class="fab fa-instagram"></i>
                    <i class="fab fa-youtube"></i>
                </div>
            </div>
        </div>
    </footer>
    `;
}
