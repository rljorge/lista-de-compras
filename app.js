/**
 * Componente de Lista de Compras
 */
class ShoppingList {
    constructor(element) {
        this.element = element;
        this.products = [];
        this.searchTimeout = null;
        this.isLoading = false;
        
        this.instanceId = 'shopping-list-' + Math.random().toString(36).substring(2, 11);
        
        this.init();
    }
    
    /**
     * Inicialización de componente
     */
    init() {
        this.render();
        this.attachEvents();
        this.loadFromLocalStorage();
        this.updateStats();
        this.toggleClearButton('');
    }
    
    /**
     * Generar template inicial
     */
    render() {
        this.element.innerHTML = `
            <div class="shopping-list-component" data-instance="${this.instanceId}">
                <div class="search-section">
                    <div class="search-input-container">
                        <input 
                            type="text" 
                            class="search-input" 
                            placeholder="Buscar productos..." 
                            aria-label="Buscar productos"
                            autocomplete="off"
                        >
                        <button class="clear-button" aria-label="Limpiar búsqueda" title="Limpiar búsqueda">
                            ✕
                        </button>
                    </div>
                    <button class="search-button" aria-label="Buscar">
                        Buscar
                    </button>
                </div>
                
                <div class="error-message" style="display: none;" role="alert"></div>
                
                <div class="products-list" role="list" aria-label="Lista de productos">
                    <div class="loading" style="display: none;">
                        Buscando productos...
                    </div>
                </div>
                
                <div class="stats-section" role="region" aria-label="Estadísticas de compra">
                    <div class="stat-item">
                        <span class="stat-value" data-stat="total">0</span>
                        <div class="stat-label">Total Productos</div>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value" data-stat="completed">0</span>
                        <div class="stat-label">Comprados</div>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value" data-stat="pending">0</span>
                        <div class="stat-label">Pendientes</div>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value" data-stat="total-cost">$0.00</span>
                        <div class="stat-label">Costo Total</div>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value" data-stat="spent">$0.00</span>
                        <div class="stat-label">Gastado</div>
                    </div>
                </div>
                
                <div class="selected-products-section">
                    <h3 class="selected-products-title">
                        Mi Lista de Compras
                        <span class="selected-count">(0)</span>
                    </h3>
                    <div class="selected-products-list" role="list" aria-label="Productos seleccionados">
                        <div class="empty-list-message">
                            No hay productos en tu lista. Busca y selecciona productos para agregarlos.
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Event Binding
     */
    attachEvents() {
        const component = this.element.querySelector(`[data-instance="${this.instanceId}"]`);
        const searchInput = component.querySelector('.search-input');
        const searchButton = component.querySelector('.search-button');
        const clearButton = component.querySelector('.clear-button');
        const productsList = component.querySelector('.products-list');
        
        // Búsqueda en tiempo real
        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
        
        // Búsqueda por botón
        searchButton.addEventListener('click', () => {
            this.handleSearch(searchInput.value);
        });
        
        // Búsqueda por Enter
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch(searchInput.value);
            }
        });
        
        // Limpiar búsqueda
        clearButton.addEventListener('click', () => {
            this.clearSearch();
        });
        
        // Mostrar/ocultar botón de limpiar según contenido
        searchInput.addEventListener('input', (e) => {
            this.toggleClearButton(e.target.value);
        });
        
        // Delegación de eventos para checkboxes de productos
        productsList.addEventListener('change', (e) => {
            if (e.target.matches('.product-checkbox')) {
                this.handleProductToggle(e.target);
            }
        });
        
        // Delegación de eventos para la lista de productos seleccionados
        const selectedProductsList = component.querySelector('.selected-products-list');
        selectedProductsList.addEventListener('change', (e) => {
            if (e.target.matches('.selected-product-checkbox')) {
                this.handleSelectedProductToggle(e.target);
            }
        });
        
        selectedProductsList.addEventListener('click', (e) => {
            if (e.target.matches('.remove-product-btn')) {
                this.removeProductFromList(e.target);
            }
        });
    }
    
    /**
     * Maneja la búsqueda con debounce
     */
    handleSearch(query) {
        // Limpiar timeout anterior
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Debounce de 300ms
        this.searchTimeout = setTimeout(() => {
            if (query.trim().length >= 2) {
                this.searchProducts(query.trim());
            } else if (query.trim().length === 0) {
                this.clearResults();
            }
        }, 300);
    }
    
    /**
     * Realiza la búsqueda en la API de DummyJSON
     */
    async searchProducts(query) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading(true);
        this.hideError();
        
        try {
            const response = await fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            this.displaySearchResults(data.products);
            
        } catch (error) {
            console.error('Error al buscar productos:', error);
            this.showError('Error al buscar productos. Por favor, intenta de nuevo.');
        } finally {
            this.isLoading = false;
            this.showLoading(false);
        }
    }
    
    /**
     * Muestra los resultados de búsqueda
     */
    displaySearchResults(products) {
        const component = this.element.querySelector(`[data-instance="${this.instanceId}"]`);
        const productsList = component.querySelector('.products-list');
        
        if (products.length === 0) {
            productsList.innerHTML = '<div class="loading">No se encontraron productos</div>';
            return;
        }
        
        const productsHTML = products.map(product => {
            const isInList = this.products.some(p => p.id === product.id);
            const existingProduct = this.products.find(p => p.id === product.id);
            const isChecked = existingProduct ? existingProduct.checked : false;
            
            return `
                <div class="product-item ${isChecked ? 'checked' : ''}" role="listitem">
                    <input 
                        type="checkbox" 
                        class="product-checkbox" 
                        data-product-id="${product.id}"
                        ${isInList ? 'checked' : ''}
                        ${isChecked ? 'checked' : ''}
                        aria-label="Agregar ${product.title} a la lista"
                    >
                    <img 
                        src="${product.thumbnail}" 
                        alt="${product.title}" 
                        class="product-image"
                        loading="lazy"
                    >
                    <div class="product-info">
                        <div class="product-title">${product.title}</div>
                        <div class="product-description">${product.description}</div>
                        <div class="product-price">$${product.price.toFixed(2)}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        productsList.innerHTML = productsHTML;
    }
    
    /**
     * Maneja el toggle de productos (agregar/quitar de la lista)
     */
    handleProductToggle(checkbox) {
        const productId = parseInt(checkbox.dataset.productId);
        const productItem = checkbox.closest('.product-item');
        
        if (checkbox.checked) {
            // Agregar producto a la lista
            const productInfo = this.extractProductInfo(productItem);
            productInfo.id = productId;
            productInfo.checked = true;
            
            // Verificar si ya existe
            const existingIndex = this.products.findIndex(p => p.id === productId);
            if (existingIndex >= 0) {
                this.products[existingIndex].checked = true;
            } else {
                this.products.push(productInfo);
            }
            
            productItem.classList.add('checked');
        } else {
            // Marcar como no comprado pero mantener en la lista
            const existingProduct = this.products.find(p => p.id === productId);
            if (existingProduct) {
                existingProduct.checked = false;
            }
            
            productItem.classList.remove('checked');
        }
        
        this.updateStats();
        this.updateSelectedProductsList();
        this.saveToLocalStorage();
    }
    
    /**
     * Extrae información del producto del DOM
     */
    extractProductInfo(productItem) {
        const title = productItem.querySelector('.product-title').textContent;
        const description = productItem.querySelector('.product-description').textContent;
        const price = parseFloat(productItem.querySelector('.product-price').textContent.replace('$', ''));
        const image = productItem.querySelector('.product-image').src;
        
        return {
            title,
            description,
            price,
            image,
            checked: false
        };
    }
    
    /**
     * Actualiza las estadísticas
     */
    updateStats() {
        const component = this.element.querySelector(`[data-instance="${this.instanceId}"]`);
        
        const total = this.products.length;
        const completed = this.products.filter(p => p.checked).length;
        const pending = total - completed;
        const totalCost = this.products.reduce((sum, p) => sum + p.price, 0);
        const spent = this.products.filter(p => p.checked).reduce((sum, p) => sum + p.price, 0);
        
        // Actualizar valores en el DOM
        component.querySelector('[data-stat="total"]').textContent = total;
        component.querySelector('[data-stat="completed"]').textContent = completed;
        component.querySelector('[data-stat="pending"]').textContent = pending;
        component.querySelector('[data-stat="total-cost"]').textContent = `$${totalCost.toFixed(2)}`;
        component.querySelector('[data-stat="spent"]').textContent = `$${spent.toFixed(2)}`;
        
        // Actualizar contador en el título
        component.querySelector('.selected-count').textContent = `(${total})`;
    }
    
    /**
     * Muestra/oculta el indicador de carga
     */
    showLoading(show) {
        const component = this.element.querySelector(`[data-instance="${this.instanceId}"]`);
        const loading = component.querySelector('.loading');
        const searchButton = component.querySelector('.search-button');
        
        loading.style.display = show ? 'block' : 'none';
        searchButton.disabled = show;
        searchButton.textContent = show ? 'Buscando...' : 'Buscar';
    }
    
    /**
     * Muestra mensaje de error
     */
    showError(message) {
        const component = this.element.querySelector(`[data-instance="${this.instanceId}"]`);
        const errorElement = component.querySelector('.error-message');
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    /**
     * Oculta mensaje de error
     */
    hideError() {
        const component = this.element.querySelector(`[data-instance="${this.instanceId}"]`);
        const errorElement = component.querySelector('.error-message');
        
        errorElement.style.display = 'none';
    }
    
    /**
     * Limpia los resultados de búsqueda
     */
    clearResults() {
        const component = this.element.querySelector(`[data-instance="${this.instanceId}"]`);
        const productsList = component.querySelector('.products-list');
        
        productsList.innerHTML = '<div class="loading" style="display: none;">Buscando productos...</div>';
    }
    
    /**
     * Limpia el campo de búsqueda y los resultados
     */
    clearSearch() {
        const component = this.element.querySelector(`[data-instance="${this.instanceId}"]`);
        const searchInput = component.querySelector('.search-input');
        
        searchInput.value = '';
        searchInput.focus();
        this.clearResults();
        this.hideError();
        this.toggleClearButton('');
        
        // Reiniciar estado del botón de búsqueda
        this.isLoading = false;
        this.showLoading(false);
        
        // Limpiar timeout de búsqueda si existe
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = null;
        }
    }
    
    /**
     * Muestra/oculta el botón de limpiar según el contenido del input
     */
    toggleClearButton(value) {
        const component = this.element.querySelector(`[data-instance="${this.instanceId}"]`);
        const clearButton = component.querySelector('.clear-button');
        
        clearButton.style.display = value.trim().length > 0 ? 'flex' : 'none';
    }
    
    /**
     * Guarda el estado en localStorage
     */
    saveToLocalStorage() {
        try {
            const key = `shopping-list-${this.instanceId}`;
            localStorage.setItem(key, JSON.stringify(this.products));
        } catch (error) {
            console.warn('No se pudo guardar en localStorage:', error);
        }
    }
    
    /**
     * Carga el estado desde localStorage
     */
    loadFromLocalStorage() {
        try {
            const key = `shopping-list-${this.instanceId}`;
            const saved = localStorage.getItem(key);
            
            if (saved) {
                this.products = JSON.parse(saved);
                this.updateSelectedProductsList();
            }
        } catch (error) {
            console.warn('No se pudo cargar desde localStorage:', error);
            this.products = [];
        }
    }
    
    /**
     * Actualiza la lista de productos seleccionados
     */
    updateSelectedProductsList() {
        const component = this.element.querySelector(`[data-instance="${this.instanceId}"]`);
        const selectedProductsList = component.querySelector('.selected-products-list');
        
        if (this.products.length === 0) {
            selectedProductsList.innerHTML = `
                <div class="empty-list-message">
                    No hay productos en tu lista. Busca y selecciona productos para agregarlos.
                </div>
            `;
            return;
        }
        
        const selectedHTML = this.products.map(product => `
            <div class="selected-product-item ${product.checked ? 'completed' : ''}" role="listitem">
                <input 
                    type="checkbox" 
                    class="selected-product-checkbox" 
                    data-product-id="${product.id}"
                    ${product.checked ? 'checked' : ''}
                    aria-label="Marcar ${product.title} como comprado"
                >
                <img 
                    src="${product.image}" 
                    alt="${product.title}" 
                    class="selected-product-image"
                    loading="lazy"
                >
                <div class="selected-product-info">
                    <div class="selected-product-title">${product.title}</div>
                    <div class="selected-product-price">$${product.price.toFixed(2)}</div>
                </div>
                <button 
                    class="remove-product-btn" 
                    data-product-id="${product.id}"
                    aria-label="Eliminar ${product.title} de la lista"
                    title="Eliminar de la lista"
                >
                    🗑️
                </button>
            </div>
        `).join('');
        
        selectedProductsList.innerHTML = selectedHTML;
    }
    
    /**
     * Maneja el toggle de productos en la lista seleccionada
     */
    handleSelectedProductToggle(checkbox) {
        const productId = parseInt(checkbox.dataset.productId);
        const productItem = checkbox.closest('.selected-product-item');
        const product = this.products.find(p => p.id === productId);
        
        if (product) {
            product.checked = checkbox.checked;
            
            if (checkbox.checked) {
                productItem.classList.add('completed');
            } else {
                productItem.classList.remove('completed');
            }
            
            this.updateStats();
            this.saveToLocalStorage();
        }
    }
    
    /**
     * Elimina un producto de la lista
     */
    removeProductFromList(button) {
        const productId = parseInt(button.dataset.productId);
        const productIndex = this.products.findIndex(p => p.id === productId);
        
        if (productIndex >= 0) {
            this.products.splice(productIndex, 1);
            this.updateStats();
            this.updateSelectedProductsList();
            this.saveToLocalStorage();
        }
    }
}

/**
 * Inicialización automática del componente
 */
document.addEventListener('DOMContentLoaded', () => {
    // Auto-inicializar todos los componentes
    const components = document.querySelectorAll('[data-component="shopping-list"]');
    
    components.forEach(element => {
        new ShoppingList(element);
    });
    
    console.log(`Inicializados ${components.length} componente(s) de lista de compras`);
});