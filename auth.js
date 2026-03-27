// Shared Authentication Logic
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const errorMsg = document.getElementById('error-msg');
const logoutBtn = document.getElementById('logout-btn');

// Redirect logic to protect pages
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const path = window.location.pathname;
    
    // Fallbacks for localhost serving
    const isAuthPage = path.includes('login.html') || path.includes('signup.html');
    const isIndexPage = path.includes('index.html') || path.endsWith('/') || path.endsWith('movie-ticket-booking');
    
    // If not logged in and not already on auth page -> go to login
    if (!isLoggedIn && !isAuthPage) {
        window.location.href = 'login.html';
    } 
    // If logged in and on auth page -> go to index
    else if (isLoggedIn && isAuthPage) {
        window.location.href = 'index.html';
    }
}

// Run auth check on load
checkAuth();

// Initialize default test user for convenience
function initDefaultUser() {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    if (!users['test@example.com']) {
        users['test@example.com'] = { name: 'Test User', password: 'password123' };
        localStorage.setItem('users', JSON.stringify(users));
    }
}
initDefaultUser();

// Signup functionality
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Simple validation
        if (!email || !password || !name) {
            errorMsg.innerText = 'Please fill in all fields.';
            return;
        }
        
        // Save to local storage
        const users = JSON.parse(localStorage.getItem('users')) || {};
        
        if (users[email]) {
            errorMsg.innerText = 'Email already exists. Please login.';
            return;
        }
        
        users[email] = { name, password };
        localStorage.setItem('users', JSON.stringify(users));
        
        // Auto-login after signup
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', email);
        
        window.location.href = 'index.html';
    });
}

// Login functionality
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        const users = JSON.parse(localStorage.getItem('users')) || {};
        
        if (!users[email] || users[email].password !== password) {
            errorMsg.innerText = 'Invalid email or password.';
            return;
        }
        
        // Successful login
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', email);
        
        window.location.href = 'index.html';
    });
}

// Logout functionality
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });
}

// Display user name if on main page
document.addEventListener('DOMContentLoaded', () => {
    const userNameSpan = document.getElementById('user-name-display');
    if (userNameSpan) {
        const currentUser = localStorage.getItem('currentUser');
        const users = JSON.parse(localStorage.getItem('users')) || {};
        
        if (currentUser && users[currentUser]) {
            // Get first name
            const firstName = users[currentUser].name.split(' ')[0];
            userNameSpan.innerText = `Hi, ${firstName}!`;
        }
    }
});
