// Clase para manejar el carrito de compras
class Cart {
    constructor() {
        this.items = [];
        this.shipping = 150.00;
        this.taxRate = 0.19; // 19% IVA
        this.loadCart();
        this.setupEventListeners();
    }

    loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
        }
        this.updateCartDisplay();
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    addToCart(product) {
        console.log('Añadiendo producto:', product); // Para debugging
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                description: product.description,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCartCount();
        alert('Producto agregado al carrito');
    }

    updateCartCount() {
        const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
        const cartCountElements = document.querySelectorAll('.cart-count, #cart-count');
        cartCountElements.forEach(element => {
            if(element) element.textContent = totalItems;
        });
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                const productCard = e.target.closest('.product-card');
                if (productCard) {
                    const product = {
                        id: productCard.dataset.productId,
                        name: productCard.querySelector('h3').textContent,
                        price: parseFloat(productCard.querySelector('.price').textContent.replace('$', '')),
                        image: productCard.querySelector('img').src,
                        description: productCard.querySelector('.description').textContent
                    };
                    this.addToCart(product);
                }
            }
        });

        // Event listeners para los botones de cantidad
        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const item = e.target.closest('.cart-item');
                const productId = item.dataset.productId;
                if (button.classList.contains('plus')) {
                    this.increaseQuantity(productId);
                } else {
                    this.decreaseQuantity(productId);
                }
            });
        });

        // Event listeners para los botones de eliminar
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const item = e.target.closest('.cart-item');
                const productId = item.dataset.productId;
                this.removeItem(productId);
            });
        });

        // Event listener para el botón de checkout
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.proceedToCheckout());
        }

        // Event listener para continuar comprando
        const continueBtn = document.querySelector('.continue-shopping');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                window.location.href = 'catalogo.html';
            });
        }

        // Event listeners para inputs de cantidad
        document.querySelectorAll('.item-quantity input').forEach(input => {
            input.addEventListener('change', (e) => {
                const item = e.target.closest('.cart-item');
                const productId = item.dataset.productId;
                const newQuantity = parseInt(e.target.value);
                this.updateQuantity(productId, newQuantity);
            });
        });
    }

    // Añadir un item al carrito
    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                description: product.description,
                quantity: 1
            });
        }
        this.saveCart();
        this.updateCartDisplay();
    }

    // Remover un item del carrito
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
    }

    // Aumentar la cantidad de un item
    increaseQuantity(productId) {
        const item = this.items.find(item => item.id === productId);
        if (item && item.quantity < 10) {
            item.quantity += 1;
            this.saveCart();
            this.updateCartDisplay();
        }
    }

    // Disminuir la cantidad de un item
    decreaseQuantity(productId) {
        const item = this.items.find(item => item.id === productId);
        if (item && item.quantity > 1) {
            item.quantity -= 1;
            this.saveCart();
            this.updateCartDisplay();
        }
    }

    // Actualizar cantidad directamente
    updateQuantity(productId, newQuantity) {
        if (newQuantity >= 1 && newQuantity <= 10) {
            const item = this.items.find(item => item.id === productId);
            if (item) {
                item.quantity = newQuantity;
                this.saveCart();
                this.updateCartDisplay();
            }
        }
    }

    // Calcular subtotal
    calculateSubtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Calcular IVA
    calculateTax() {
        return this.calculateSubtotal() * this.taxRate;
    }

    // Calcular total
    calculateTotal() {
        return this.calculateSubtotal() + this.calculateTax() + this.shipping;
    }

    // Actualizar la visualización del carrito
    updateCartDisplay() {
        const cartItems = document.querySelector('.cart-items');
        const emptyCart = document.querySelector('.empty-cart');
        const cartContent = document.querySelector('.cart-content');

        if (this.items.length === 0) {
            if (cartContent) cartContent.style.display = 'none';
            if (emptyCart) emptyCart.style.display = 'block';
            return;
        }

        if (cartContent) cartContent.style.display = 'grid';
        if (emptyCart) emptyCart.style.display = 'none';

        // Actualizar items
        if (cartItems) {
            cartItems.innerHTML = this.items.map(item => this.createCartItemHTML(item)).join('');
        }

        // Actualizar resumen
        this.updateSummary();

        // Reconfigurar event listeners
        this.setupEventListeners();
    }

    // Crear HTML para un item del carrito
    createCartItemHTML(item) {
        return `
            <div class="cart-item" data-product-id="${item.id}">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p class="item-description">${item.description}</p>
                </div>
                <div class="item-quantity">
                    <button class="quantity-btn minus"><i class="fas fa-minus"></i></button>
                    <input type="number" value="${item.quantity}" min="1" max="10">
                    <button class="quantity-btn plus"><i class="fas fa-plus"></i></button>
                </div>
                <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                <button class="remove-item"><i class="fas fa-trash"></i></button>
            </div>
        `;
    }

    // Actualizar el resumen de la compra
    updateSummary() {
        const subtotal = this.calculateSubtotal();
        const tax = this.calculateTax();
        const total = this.calculateTotal();

        document.querySelector('.summary-item:nth-child(1) span:last-child').textContent = 
            `$${subtotal.toFixed(2)}`;
        document.querySelector('.summary-item:nth-child(2) span:last-child').textContent = 
            `$${tax.toFixed(2)}`;
        document.querySelector('.summary-item:nth-child(3) span:last-child').textContent = 
            `$${this.shipping.toFixed(2)}`;
        document.querySelector('.summary-total span:last-child').textContent = 
            `$${total.toFixed(2)}`;
    }

    // Proceder al checkout
    proceedToCheckout() {
        if (this.items.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }
        // Aquí iría la lógica para redirigir al checkout
        window.location.href = 'pago.html';
    }
}

// Inicializar el carrito cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new Cart();
});

// Función para actualizar el contador del carrito
function updateCartCount() {
    try {
        const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = totalItems;
        }
    } catch (error) {
        console.error('Error al actualizar el contador del carrito:', error);
    }
}

// Función para agregar al carrito
function addToCart(productId, name, price, image, description) {
    try {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        const existingProduct = cart.find(item => item.id === productId);
        
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push({
                id: productId,
                name: name,
                price: parseFloat(price),
                image: image,
                description: description,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        alert('Producto agregado al carrito');
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        alert('Hubo un error al agregar el producto al carrito');
    }
}

// Función para inicializar los botones
function initializeAddToCartButtons() {
    const buttons = document.querySelectorAll('.add-to-cart');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            try {
                const productCard = this.closest('.product-card');
                if (!productCard) {
                    throw new Error('No se encontró la tarjeta del producto');
                }

                const productId = productCard.dataset.productId;
                const name = productCard.querySelector('h3').textContent;
                const priceText = productCard.querySelector('.price').textContent;
                const price = parseFloat(priceText.replace(/[^0-9.-]+/g, ''));
                const image = productCard.querySelector('img').src;
                const description = productCard.querySelector('.description').textContent;

                console.log('Agregando producto:', { productId, name, price, image, description });
                addToCart(productId, name, price, image, description);
            } catch (error) {
                console.error('Error al procesar el botón de agregar al carrito:', error);
                alert('Hubo un error al agregar el producto');
            }
        });
    });
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página cargada, inicializando carrito...');
    updateCartCount();
    initializeAddToCartButtons();
});

// Reinicializar cuando se carga nuevo contenido dinámicamente
function reinitializeCart() {
    updateCartCount();
}

// Exportar función para uso en otros archivos
window.reinitializeCart = reinitializeCart;

// Función para eliminar un producto del carrito
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCart(); // Actualizar la visualización del carrito
}

// Función para actualizar la cantidad de un producto
function updateQuantity(productId, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity += change;
        // Asegurarse de que la cantidad no sea menor a 1
        if (item.quantity < 1) {
            removeFromCart(productId);
            return;
        }
        // Limitar a un máximo de 10 unidades
        if (item.quantity > 10) {
            item.quantity = 10;
            alert('Máximo 10 unidades por producto');
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        displayCart();
    }
}

// Agregar event listeners para los botones de cantidad y eliminar
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('quantity-btn')) {
        const productId = e.target.closest('.cart-item').dataset.productId;
        if (e.target.classList.contains('plus')) {
            updateQuantity(productId, 1);
        } else if (e.target.classList.contains('minus')) {
            updateQuantity(productId, -1);
        }
    }
    
    if (e.target.classList.contains('remove-item')) {
        const productId = e.target.closest('.cart-item').dataset.productId;
        if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            removeFromCart(productId);
        }
    }
});

// Función para formatear precios
function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP'
    }).format(price);
} 