// ============================================================
// MOVIE TICKET MANAGEMENT SYSTEM - CORE GLOBAL SCRIPT
// ============================================================

console.log('🎬 Neeraj Movie Theatre Ticket Management System initialized.');

// Global smooth scrolling for anchor links
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.getAttribute('href') && e.target.getAttribute('href').startsWith('#')) {
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }
});
