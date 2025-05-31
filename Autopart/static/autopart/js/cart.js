
class Cart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.bindAddToCartButtons();
        this.updateCartCount();
    }

    bindAddToCartButtons() {
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', () => {
                const product = {
                    id: parseInt(button.dataset.id),
                    name: button.dataset.name,
                    price: parseInt(button.dataset.price),
                    image: button.dataset.image,
                    description: button.dataset.description
                };
                this.addToCart(product);
                this.showToast(product);
            });
        });
    }
    showSuccessToast() {
    const toastElement = document.getElementById('addToast');
    if (toastElement) {
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
        }
    }
    addToCart(product) {
        const existing = this.cart.find(item => item.id === product.id);
        if (existing) {
            if (existing.quantity < 100) {
                existing.quantity++;
            } else {
                alert('Máximo 100 unidades permitidas.');
            }
        } else {
            product.quantity = 0;
            this.cart.push(product);
        }
        
        this.saveCart();
        this.updateCartCount();
        this.showSuccessToast();
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    updateCartCount() {
        const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const countEl = document.getElementById('cart-count');
        const toastCount = document.getElementById('toast-count');
        if (countEl) countEl.textContent = count;
        if (toastCount) toastCount.textContent = count;
    }

    showToast(product) {
        const toast = document.getElementById('cart-toast');
        if (!toast) return;

        document.getElementById('toast-img').src = product.image;
        document.getElementById('toast-name').textContent = product.name;
        document.getElementById('toast-desc').textContent = product.description;

        toast.classList.remove('hidden');
        document.getElementById('toast-close').addEventListener('click', () => {
            toast.classList.add('hidden');
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Cart();
});
