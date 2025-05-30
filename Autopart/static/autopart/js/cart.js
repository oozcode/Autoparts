class Cart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.initEventListeners();
        this.updateCartDisplay();
    }

    initEventListeners() {
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', event => {
                const product = JSON.parse(event.target.getAttribute('data-product'));
                this.addToCart(product);
            });
        });

        const finalizeButton = document.getElementById('finalize-purchase');
        if (finalizeButton) {
            finalizeButton.addEventListener('click', () => this.finalizePurchase());
        }
    }

    addToCart(product) {
        const existingProduct = this.cart.find(item => item.id === product.id);
        if (existingProduct) {
            if (existingProduct.quantity < 10) {
                existingProduct.quantity++;
            } else {
                alert('Has alcanzado el máximo de 10 unidades para este producto.');
            }
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }

        this.saveCart();
        this.updateCartDisplay();
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
    }

    updateQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity < 1) {
                this.removeFromCart(productId);
                return;
            }
            if (item.quantity > 10) {
                item.quantity = 10;
            }
            this.saveCart();
            this.updateCartDisplay();
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    updateCartDisplay() {
        const cartItemsContainer = document.getElementById('cart-items');
        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = '';
        this.cart.forEach(product => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <p>${product.name}</p>
                <p>${product.price.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</p>
                <p>Cantidad: ${product.quantity}</p>
                <button class="decrease" data-id="${product.id}">-</button>
                <button class="increase" data-id="${product.id}">+</button>
                <button class="remove" data-id="${product.id}">Eliminar</button>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        document.querySelectorAll('.decrease').forEach(button =>
            button.addEventListener('click', () => {
                const productId = parseInt(button.getAttribute('data-id'));
                this.updateQuantity(productId, -1);
            })
        );

        document.querySelectorAll('.increase').forEach(button =>
            button.addEventListener('click', () => {
                const productId = parseInt(button.getAttribute('data-id'));
                this.updateQuantity(productId, 1);
            })
        );

        document.querySelectorAll('.remove').forEach(button =>
            button.addEventListener('click', () => {
                const productId = parseInt(button.getAttribute('data-id'));
                this.removeFromCart(productId);
            })
        );

        this.updateCartCount();
    }

    updateCartCount() {
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalItems;
        }
    }

    finalizePurchase() {
        alert('¡Gracias por tu compra! 😄');
        this.cart = [];
        this.saveCart();
        this.updateCartDisplay();
    }
}

// Inicializar carrito
const cart = new Cart();
window.cart = cart; // por si necesitas acceder globalmente desde consola
