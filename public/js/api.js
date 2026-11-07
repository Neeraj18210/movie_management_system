// ============================================================
// MOVIE TICKET MANAGEMENT SYSTEM - API & CLIENT UTILITIES
// ============================================================

const API_BASE = '/api';

// Toast Notification Manager
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    if (type === 'error') {
        icon = 'fa-times-circle';
        toast.className = 'toast';
        toast.style.borderLeftColor = '#ef4444';
    }

    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Authentication Storage Helpers
const Auth = {
    getToken() {
        return localStorage.getItem('cinemax_token');
    },
    getUser() {
        const userStr = localStorage.getItem('cinemax_user');
        try {
            return userStr ? JSON.parse(userStr) : null;
        } catch (e) {
            return null;
        }
    },
    setAuth(token, user) {
        localStorage.setItem('cinemax_token', token);
        localStorage.setItem('cinemax_user', JSON.stringify(user));
    },
    clearAuth() {
        localStorage.removeItem('cinemax_token');
        localStorage.removeItem('cinemax_user');
    },
    isLoggedIn() {
        return !!this.getToken();
    },
    isAdmin() {
        const user = this.getUser();
        return user && user.role === 'admin';
    },
    logout() {
        this.clearAuth();
        showToast('Logged out successfully.', 'info');
        setTimeout(() => {
            window.location.href = '/pages/login.html';
        }, 800);
    }
};

// Core API Fetch Wrapper
async function apiRequest(endpoint, method = 'GET', data = null, requiresAuth = false) {
    const headers = {
        'Content-Type': 'application/json'
    };

    if (requiresAuth || Auth.getToken()) {
        const token = Auth.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const options = {
        method,
        headers
    };

    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            if (response.status === 401 && requiresAuth) {
                Auth.clearAuth();
                showToast('Session expired. Please log in again.', 'warning');
                setTimeout(() => {
                    window.location.href = `/pages/login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
                }, 1000);
            }
            throw new Error(result.message || 'An error occurred with your request.');
        }

        return result;
    } catch (err) {
        console.error(`API Error [${method} ${endpoint}]:`, err);
        throw err;
    }
}

// Formatters
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount || 0);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTime(timeString) {
    if (!timeString) return '';
    const parts = timeString.split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1] || '00';
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
}

// URL Param Helper
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}
