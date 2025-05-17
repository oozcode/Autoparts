class Auth {
    constructor() {
        this.isLoggedIn = false;
        this.init();
    }

    init() {
        this.checkLoginStatus();
        this.setupEventListeners();
    }

    checkLoginStatus() {
        const token = localStorage.getItem('authToken');
        this.isLoggedIn = !!token;
        this.updateNavigation();
    }

    login(email, password) {
        // Aquí iría la lógica de autenticación real
        if (email && password) {
            localStorage.setItem('authToken', 'dummy-token');
            this.isLoggedIn = true;
            this.updateNavigation();
            showMessage('Inicio de sesión exitoso');
            return true;
        }
        return false;
    }

    logout() {
        localStorage.removeItem('authToken');
        this.isLoggedIn = false;
        this.updateNavigation();
        showMessage('Sesión cerrada');
    }

    register(userData) {
        // Aquí iría la lógica de registro real
        const errors = validateForm(new FormData(userData));
        if (errors.length === 0) {
            showMessage('Registro exitoso');
            return true;
        }
        errors.forEach(error => showMessage(error, 'error'));
        return false;
    }

    updateNavigation() {
        const loginLink = document.querySelector('.nav-links a[href="registro.html"]');
        if (loginLink) {
            if (this.isLoggedIn) {
                loginLink.textContent = 'Cerrar Sesión';
                loginLink.href = '#';
                loginLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            } else {
                loginLink.textContent = 'Iniciar Sesión';
                loginLink.href = 'registro.html';
            }
        }
    }

    setupEventListeners() {
        const loginForm = document.querySelector('#login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = loginForm.querySelector('[name="email"]').value;
                const password = loginForm.querySelector('[name="password"]').value;
                if (this.login(email, password)) {
                    window.location.href = 'index.html';
                }
            });
        }

        const registerForm = document.querySelector('#register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.register(registerForm)) {
                    window.location.href = 'login.html';
                }
            });
        }
    }
} 