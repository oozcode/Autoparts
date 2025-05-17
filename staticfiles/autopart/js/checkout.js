class Checkout {
    constructor() {
        this.cart = new Cart();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateOrderSummary();
    }

    setupEventListeners() {
        const checkoutForm = document.querySelector('#checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processPayment();
            });
        }
    }

    updateOrderSummary() {
        const summary = document.querySelector('.order-summary');
        if (!summary) return;

        summary.innerHTML = `
            <h2>Resumen del Pedido</h2>
            ${this.cart.items.map(item => `
                <div class="order-item">
                    <span>${item.name} x ${item.quantity}</span>
                    <span>${formatPrice(item.price * item.quantity)}</span>
                </div>
            `).join('')}
            <div class="order-total">
                <span>Total</span>
                <span>${formatPrice(this.cart.calculateTotal())}</span>
            </div>
        `;
    }

    processPayment() {
        // Aquí iría la integración con el sistema de pagos
        showMessage('Procesando pago...');
        setTimeout(() => {
            this.cart.items = [];
            this.cart.saveToStorage();
            showMessage('¡Pago exitoso! Gracias por tu compra');
            window.location.href = 'index.html';
        }, 2000);
    }
} 