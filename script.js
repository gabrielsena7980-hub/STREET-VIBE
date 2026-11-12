// --- ESTADO DE LA TIENDA Y DATOS PERSISTENTES ---
let defaultProducts = [
    {
        id: 1,
        name: "Sudadera Satén Rose Gold",
        category: "sudaderas",
        price: 185000,
        stock: 12,
        images: [
            "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=600",
            "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&q=80&w=600"
        ],
        description: "Sudadera con acabado satinado de alta calidad y tacto suave."
    },
    {
        id: 2,
        name: "Sudadera Urban Velvet Pink",
        category: "sudaderas",
        price: 195000,
        stock: 8,
        images: [
            "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&q=80&w=600",
            "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=600"
        ],
        description: "Diseño urbano con detalles metálicos en oro rosa."
    },
    {
        id: 3,
        name: "Camisa Street Vibe Satin",
        category: "camisas",
        price: 145000,
        stock: 15,
        images: [
            "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=600",
            "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=600"
        ],
        description: "Camisa fluida con corte moderno y sutil brillo satinado."
    },
    {
        id: 4,
        name: "Camisa Oversize Rosa Estelar",
        category: "camisas",
        price: 130000,
        stock: 20,
        images: [
            "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=600",
            "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=600"
        ],
        description: "Estilo oversize relajado ideal para cualquier ocasión."
    }
];

// Cargar datos persistentes
let products = JSON.parse(localStorage.getItem('street_vibe_products')) || defaultProducts;
let orders = JSON.parse(localStorage.getItem('street_vibe_orders')) || [];

let cart = [];
let currentCategory = 'all';

function saveToStorage() {
    try {
        localStorage.setItem('street_vibe_products', JSON.stringify(products));
        localStorage.setItem('street_vibe_orders', JSON.stringify(orders));
    } catch (e) {
        showToast('El almacenamiento está lleno. Sube imágenes más ligeras.');
    }
}

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartBadge();
    initAdminPanel();
});

// --- RENDERIZAR PRODUCTOS Y FILTRAR CATEGORÍAS ---
function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    const filtered = currentCategory === 'all' 
        ? products 
        : products.filter(p => p.category === currentCategory);
    
    document.getElementById('product-count').innerText = `Mostrando ${filtered.length} productos`;
    
    if (filtered.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;">No hay productos registrados en esta categoría aún.</p>`;
        return;
    }

    grid.innerHTML = filtered.map(product => {
        const imgs = product.images && product.images.length > 0 ? product.images : [product.image || 'https://via.placeholder.com/300'];
        const firstImg = imgs[0];
        
        return `
        <div class="product-card" data-id="${product.id}">
            <div class="product-img-container" id="img-container-${product.id}">
                <span class="product-tag">${product.category}</span>
                <img src="${firstImg}" alt="${product.name}" class="carousel-img" data-index="0">
                
                ${imgs.length > 1 ? `
                    <button class="carousel-btn prev" onclick="changeImage(${product.id}, -1)">‹</button>
                    <button class="carousel-btn next" onclick="changeImage(${product.id}, 1)">›</button>
                    <div class="carousel-dots">
                        ${imgs.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" data-dot="${i}"></span>`).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="product-info">
                <h4 class="product-title">${product.name}</h4>
                <p class="product-desc">${product.description || "Prenda exclusiva Street Vibe."}</p>
                <div class="product-footer">
                    <span class="product-price">$${product.price.toLocaleString()} COP</span>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                        ${product.stock > 0 ? 'Añadir' : 'Agotado'}
                    </button>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

// Cambiar imagen en el carrusel
function changeImage(productId, direction) {
    const product = products.find(p => p.id === productId);
    if (!product || !product.images || product.images.length <= 1) return;

    const container = document.getElementById(`img-container-${productId}`);
    const imgElement = container.querySelector('.carousel-img');
    const dots = container.querySelectorAll('.dot');

    let currentIndex = parseInt(imgElement.getAttribute('data-index'));
    currentIndex += direction;

    if (currentIndex < 0) {
        currentIndex = product.images.length - 1;
    } else if (currentIndex >= product.images.length) {
        currentIndex = 0;
    }

    imgElement.setAttribute('data-index', currentIndex);
    imgElement.src = product.images[currentIndex];

    dots.forEach((dot, idx) => {
        if (idx === currentIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function filterCategory(category, btnElement) {
    currentCategory = category;
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');
    
    const titles = {
        'all': 'Catálogo Completo',
        'sudaderas': 'Sudaderas Exclusivas',
        'camisas': 'Camisas & Tops'
    };
    document.getElementById('category-title').innerText = titles[category] || 'Catálogo';
    renderProducts();
}

function scrollToCatalog() {
    document.getElementById('catalog-section').scrollIntoView({ behavior: 'smooth' });
}

// --- CARRITO DE COMPRAS ---
function toggleCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    drawer.classList.toggle('open');
    overlay.classList.toggle('open');
    renderCartItems();
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock <= 0) return;

    const imgs = product.images && product.images.length > 0 ? product.images : [product.image];
    const itemImage = imgs[0];

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } else {
            showToast('No hay más stock disponible');
            return;
        }
    } else {
        cart.push({ ...product, image: itemImage, quantity: 1 });
    }

    updateCartBadge();
    showToast('¡Producto añadido al carrito!');
}

function updateCartBadge() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-badge').innerText = totalCount;
}

function renderCartItems() {
    const container = document.getElementById('cart-items');
    if (cart.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:40px 0;">Tu carrito está vacío</p>`;
        document.getElementById('cart-subtotal').innerText = '$0 COP';
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">$${item.price.toLocaleString()} COP</div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">Eliminar</button>
                </div>
            </div>
        </div>
    `).join('');

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cart-subtotal').innerText = `$${subtotal.toLocaleString()} COP`;
}

function changeQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    const product = products.find(p => p.id === productId);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty > 0 && newQty <= product.stock) {
        item.quantity = newQty;
    } else if (newQty === 0) {
        removeFromCart(productId);
    } else {
        showToast('Stock máximo alcanzado');
    }
    renderCartItems();
    updateCartBadge();
}

function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    renderCartItems();
    updateCartBadge();
}

// --- CHECKOUT Y PROCESO DE PAGO ---
function openCheckoutModal() {
    if (cart.length === 0) {
        showToast('Agrega productos antes de pagar');
        return;
    }
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('modal-total-price').innerText = `$${subtotal.toLocaleString()} COP`;
    document.getElementById('checkout-modal').classList.remove('hidden');
    toggleCart();
}

function closeCheckoutModal() {
    document.getElementById('checkout-modal').classList.add('hidden');
}

function processCheckout(e) {
    e.preventDefault();
    const name = document.getElementById('cust-name').value;
    const email = document.getElementById('cust-email').value;
    const address = document.getElementById('cust-address').value;
    const payment = document.getElementById('cust-payment').value;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    cart.forEach(cartItem => {
        const prod = products.find(p => p.id === cartItem.id);
        if (prod) prod.stock -= cartItem.quantity;
    });

    const newOrder = {
        id: 'SV-' + Math.floor(1000 + Math.random() * 9000),
        customer: name,
        email: email,
        address: address,
        payment: payment,
        date: new Date().toLocaleDateString(),
        items: [...cart],
        total: subtotal,
        totalItems: totalItemsCount,
        status: 'Completado'
    };

    orders.unshift(newOrder);
    cart = [];
    updateCartBadge();
    closeCheckoutModal();
    document.getElementById('checkout-form').reset();
    
    saveToStorage();
    showToast('¡Compra realizada con éxito!');
    updateAdminDashboard();
}

// --- PANEL DE VENDEDOR / ADMINISTRACIÓN ---
let isAdminAuthenticated = false;
const SELLER_PASSWORD = "2121";

function initAdminPanel() {
    const toggleBtn = document.getElementById('admin-toggle-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (isAdminAuthenticated) {
                switchView('admin');
            } else {
                document.getElementById('admin-login-modal').classList.remove('hidden');
            }
        });
    }
}

function closeLoginModal() {
    document.getElementById('admin-login-modal').classList.add('hidden');
}

function verifySellerLogin(e) {
    e.preventDefault();
    const inputPass = document.getElementById('seller-password').value;
    if (inputPass === SELLER_PASSWORD) {
        isAdminAuthenticated = true;
        closeLoginModal();
        document.getElementById('seller-password').value = '';
        switchView('admin');
        showToast('¡Bienvenido al panel del vendedor!');
    } else {
        showToast('Contraseña incorrecta');
    }
}

function switchView(view) {
    const storeView = document.getElementById('store-view');
    const adminView = document.getElementById('admin-view');

    if (view === 'store') {
        storeView.classList.remove('hidden');
        adminView.classList.add('hidden');
        renderProducts();
    } else if (view === 'admin') {
        storeView.classList.add('hidden');
        adminView.classList.remove('hidden');
        updateAdminDashboard();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchAdminTab(tab, btnElement) {
    document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');

    const ordersSec = document.getElementById('admin-orders-section');
    const inventorySec = document.getElementById('admin-inventory-section');

    if (tab === 'orders') {
        ordersSec.classList.remove('hidden');
        inventorySec.classList.add('hidden');
    } else {
        ordersSec.classList.add('hidden');
        inventorySec.classList.remove('hidden');
        renderAdminInventory();
    }
}

function updateAdminDashboard() {
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const totalItemsSold = orders.reduce((sum, o) => sum + o.totalItems, 0);

    document.getElementById('admin-total-sales').innerText = `$${totalSales.toLocaleString()} COP`;
    document.getElementById('admin-total-orders').innerText = totalOrders;
    document.getElementById('admin-total-items').innerText = totalItemsSold;

    renderAdminOrders();
    renderAdminInventory();
}

function renderAdminOrders() {
    const tbody = document.getElementById('admin-orders-table');
    if (!tbody) return;

    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No hay órdenes registradas aún</td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map(o => `
        <tr>
            <td><strong>${o.id}</strong></td>
            <td>${o.customer}<br><small style="color:var(--text-muted);">${o.email}</small></td>
            <td>${o.date}</td>
            <td>${o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</td>
            <td><strong>$${o.total.toLocaleString()} COP</strong></td>
            <td><span class="status-badge">${o.status}</span></td>
        </tr>
    `).join('');
}

function renderAdminInventory() {
    const tbody = document.getElementById('admin-inventory-table');
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No hay prendas en el inventario</td></tr>`;
        return;
    }

    tbody.innerHTML = products.map(p => {
        const imgs = p.images && p.images.length > 0 ? p.images : [p.image];
        return `
        <tr>
            <td>
                <div style="display:flex; align-items:center; gap:12px;">
                    <img src="${imgs[0]}" style="width:40px; height:40px; object-fit:cover; border-radius:8px;">
                    <strong>${p.name}</strong> <small style="color:var(--text-muted);">(${imgs.length} fotos)</small>
                </div>
            </td>
            <td><span style="text-transform:capitalize;">${p.category}</span></td>
            <td>$${p.price.toLocaleString()} COP</td>
            <td>
                <input type="number" id="stock-${p.id}" class="stock-input" value="${p.stock}" min="0">
                <button class="update-stock-btn" onclick="updateStock(${p.id})">Guardar</button>
            </td>
            <td>
                <button onclick="deleteProduct(${p.id})" style="background-color:#fee2e2; color:#b91c1c; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; font-weight:700; font-size:13px;">Eliminar</button>
            </td>
        </tr>
    `;
    }).join('');
}

function updateStock(productId) {
    const input = document.getElementById(`stock-${productId}`);
    const newStock = parseInt(input.value);
    const product = products.find(p => p.id === productId);
    
    if (product && !isNaN(newStock) && newStock >= 0) {
        product.stock = newStock;
        saveToStorage();
        showToast(`Stock actualizado para ${product.name}`);
        renderProducts();
    } else {
        showToast('Valor de stock inválido');
    }
}

// --- FUNCIÓN OPTIMIZADA PARA COMPRIMIR Y AÑADIR MÚLTIPLES FOTOS ---
function addNewProduct(e) {
    e.preventDefault();
    const name = document.getElementById('new-prod-name').value;
    const category = document.getElementById('new-prod-cat').value; // Lee exactamente la categoría seleccionada (sudaderas o camisas)
    const price = parseFloat(document.getElementById('new-prod-price').value);
    const stock = parseInt(document.getElementById('new-prod-stock').value);
    const fileInput = document.getElementById('new-prod-files');

    if (fileInput.files && fileInput.files.length > 0) {
        const imagePromises = Array.from(fileInput.files).map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    // Comprimir la imagen mediante Canvas para que no sature la memoria
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX_WIDTH = 800;
                        const MAX_HEIGHT = 800;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > MAX_WIDTH) {
                                height *= MAX_WIDTH / width;
                                width = MAX_WIDTH;
                            }
                        } else {
                            if (height > MAX_HEIGHT) {
                                width *= MAX_HEIGHT / height;
                                height = MAX_HEIGHT;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        // Devuelve la imagen comprimida en formato WebP/JPEG optimizado
                        resolve(canvas.toDataURL('image/jpeg', 0.8));
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(imagePromises).then(compressedImages => {
            const newProduct = {
                id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
                name,
                category,
                price,
                stock,
                images: compressedImages,
                description: "Prenda exclusiva de la colección Street Vibe."
            };

            products.push(newProduct);
            saveToStorage();
            renderProducts();
            renderAdminInventory();
            document.getElementById('add-product-form').reset();
            showToast(`¡Prenda añadida a la categoría "${category}" con éxito!`);
        });
    } else {
        showToast('Por favor adjunta al menos una imagen');
    }
}

// --- ELIMINAR PRENDA ---
function deleteProduct(productId) {
    if (confirm("¿Estás segura de que deseas eliminar esta prenda del catálogo?")) {
        products = products.filter(p => p.id !== productId);
        cart = cart.filter(item => item.id !== productId);
        updateCartBadge();
        saveToStorage();
        renderProducts();
        renderAdminInventory();
        showToast('Prenda eliminada del catálogo');
    }
}

// --- TOAST NOTIFICATIONS ---
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}