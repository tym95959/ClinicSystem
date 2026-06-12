// auth-check.js - Include this in all protected pages
(function checkAuthentication() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    const username = localStorage.getItem('username');
    const userName = localStorage.getItem('userName');
    
    // List of pages that DON'T require authentication
    const publicPages = ['login.html', 'register.html', 'forgot-password.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    // Allow public pages
    if (publicPages.includes(currentPage)) {
        return;
    }
    
    // Check if user is authenticated
    if (!loggedInUser && !username && !userName) {
        console.log('🔒 Authentication required. Redirecting to login...');
        window.location.href = 'login.html';
        return;
    }
    
    // Validate user data
    let isValid = false;
    if (loggedInUser) {
        try {
            const userData = JSON.parse(loggedInUser);
            if (userData.username || userData.name) {
                isValid = true;
            }
        } catch(e) {}
    }
    
    if (!isValid && (username || userName)) {
        isValid = true;
    }
    
    if (!isValid) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
    
    // Set/update login time
    if (!localStorage.getItem('loginTime')) {
        localStorage.setItem('loginTime', Date.now().toString());
    }
})();