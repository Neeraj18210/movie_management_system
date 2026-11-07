// ============================================================
// MOVIE TICKET MANAGEMENT SYSTEM - AUTHENTICATION SCRIPT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initAuthForms();
});

function initAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginSubmitBtn');

    if (!email || !password) {
        showToast('Please enter both email and password.', 'warning');
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Authenticating...`;
    }

    try {
        const response = await apiRequest('/users/login', 'POST', { email, password });

        Auth.setAuth(response.token, response.user);
        showToast(`Welcome back, ${response.user.name}!`, 'success');

        const redirect = getUrlParam('redirect');
        setTimeout(() => {
            if (redirect) {
                window.location.href = redirect;
            } else if (response.user.role === 'admin') {
                window.location.href = '/pages/admin.html';
            } else {
                window.location.href = '/pages/index.html';
            }
        }, 800);
    } catch (err) {
        showToast(err.message || 'Invalid credentials. Please try again.', 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="fas fa-sign-in-alt"></i> Sign In`;
        }
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;
    const btn = document.getElementById('registerSubmitBtn');

    if (!name || !email || !password) {
        showToast('Name, email, and password are required.', 'warning');
        return;
    }

    if (password.length < 6) {
        showToast('Password must be at least 6 characters.', 'warning');
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Creating Account...`;
    }

    try {
        const response = await apiRequest('/users/register', 'POST', { name, email, phone, password });

        Auth.setAuth(response.token, response.user);
        showToast('Registration successful! Welcome to Neeraj Movie Theatre.', 'success');

        const redirect = getUrlParam('redirect');
        setTimeout(() => {
            window.location.href = redirect || '/pages/index.html';
        }, 800);
    } catch (err) {
        showToast(err.message || 'Registration failed.', 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="fas fa-user-plus"></i> Register Customer Account`;
        }
    }
}

// Quick demo credential filler for immediate testing
function fillDemo(role) {
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');

    if (role === 'admin') {
        if (emailInput) emailInput.value = 'admin@neerajtheatre.com';
        if (passwordInput) passwordInput.value = 'Admin@123';
        showToast('Filled Admin credentials (admin@neerajtheatre.com)', 'info');
    } else {
        if (emailInput) emailInput.value = 'john@example.com';
        if (passwordInput) passwordInput.value = 'Password@123';
        showToast('Filled Customer credentials (john@example.com)', 'info');
    }
}
