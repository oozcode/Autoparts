class Catalog {
    constructor(userId = 'anon') {
        this.products = [];
        this.currentCategory = null;
        this.userId = userId;
        this.init();
    }

    init() {
        this.loadProducts();
        this.setupEventListeners();
        this.updateDisplay();
    }

    loadProducts() {
        this.products = [
            {
                id: 'motor1',
                name: 'Filtro de Aceite Premium',
                price: 299.99,
                category: 'motores',
                description: 'Filtro de aceite de alta calidad para motores de 4 cilindros',
                image: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d'
            },
        ];
    }

    setupEventListeners() {
        document.addEventListener('change', (e) => {
            if (e.target.matches('#categoria')) {
                this.currentCategory = e.target.value;
                this.updateDisplay();
            }
            if (e.target.matches('#ordenar')) {
                this.sortProducts(e.target.value);
            }
        });
    }

    sortProducts(criteria) {
        switch(criteria) {
            case 'precio-bajo':
                this.products.sort((a, b) => a.price - b.price);
                break;
            case 'precio-alto':
                this.products.sort((a, b) => b.price - a.price);
                break;
            case 'nombre':
                this.products.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
        this.updateDisplay();
    }

    filterProducts() {
        if (!this.currentCategory) return this.products;
        return this.products.filter(product => product.category === this.currentCategory);
    }

    updateDisplay() {
        const productsContainer = document.querySelector('.products-grid');
        if (!productsContainer) return;

        const filteredProducts = this.filterProducts();
        productsContainer.innerHTML = filteredProducts.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="description">${product.description}</p>
                <p class="price">${formatPrice(product.price)}</p>
                <button class="add-to-cart">Agregar al carrito</button>
            </div>
        `).join('');
    }

    // ========================
    // CRUD DE VENDEDOR ✨✨✨
    // ========================

    addProduct(product) {
        product.id = `p_${Date.now()}`; // ID único
        this.products.push(product);
        this.logChange('CREADO', product);
        this.updateDisplay();
    }

    updateProduct(productId, updatedData) {
        const index = this.products.findIndex(p => p.id === productId);
        if (index !== -1) {
            this.products[index] = { ...this.products[index], ...updatedData };
            this.logChange('MODIFICADO', this.products[index]);
            this.updateDisplay();
        }
    }

    deleteProduct(productId) {
        const index = this.products.findIndex(p => p.id === productId);
        if (index !== -1) {
            const deleted = this.products.splice(index, 1)[0];
            this.logChange('ELIMINADO', deleted);
            this.updateDisplay();
        }
    }

    logChange(action, product) {
        const now = new Date().toLocaleString();
        console.log(`[${now}] Producto ${action} por usuario ${this.userId}:`, product);
        // Aquí puedes enviar esto a una API o base de datos si deseas
    }
}
