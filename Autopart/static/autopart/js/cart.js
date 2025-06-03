class Cart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.bindAddToCartButtons();
        this.bindToastClose();
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
                    description: button.dataset.description,
                    peso: parseFloat(button.dataset.peso),
                    largo: parseFloat(button.dataset.largo),
                    ancho: parseFloat(button.dataset.ancho),
                    alto: parseFloat(button.dataset.alto),
                    stock: parseInt(button.dataset.stock), // <-- agrega esto
                    quantity: 1
                };
                this.addToCart(product);
                this.showToast(product);
            });
        });
    }

    bindToastClose() {
        const toastCloseBtn = document.getElementById('toast-close');
        const toast = document.getElementById('cart-toast');
        if (toastCloseBtn && toast) {
            toastCloseBtn.addEventListener('click', () => {
                toast.classList.add('hidden');
            });
        }
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
    const stock = product.stock !== undefined ? product.stock : 10000; // fallback si no hay stock

    if (existing) {
        if (existing.quantity < stock) {
            existing.quantity++;
        } else {
            alert('No puedes agregar más de la cantidad disponible en stock.');
        }
    } else {
        if (stock > 0) {
            this.cart.push(product);
        } else {
            alert('Producto sin stock disponible.');
            return;
        }
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
    }
    
}

document.addEventListener('DOMContentLoaded', () => {
    new Cart();
});
