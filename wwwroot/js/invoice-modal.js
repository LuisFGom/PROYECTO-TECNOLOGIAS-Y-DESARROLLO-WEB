// ================================================================
// SISTEMA DE FACTURACIÓN CON MODALES - VERSIÓN CORREGIDA
// ================================================================

console.log('🚀 Iniciando sistema de facturación con modales...');

document.addEventListener('DOMContentLoaded', function () {
    const API_BASE = '/api/lookup';
    let selectedCustomer = null;
    let selectedProductToAdd = null;
    let products = [];
    let searchTimer = null;

    // Instanciar modales de Bootstrap
    const customerModalEl = document.getElementById('customerModal');
    const productModalEl = document.getElementById('productModal');
    const quantityModalEl = document.getElementById('quantityModal');

    const customerModal = new bootstrap.Modal(customerModalEl);
    const productModal = new bootstrap.Modal(productModalEl);
    const quantityModal = new bootstrap.Modal(quantityModalEl);

    // Elementos del DOM
    const elements = {
        customerSearchInput: document.getElementById('customerSearchInput'),
        customerResults: document.getElementById('customerResults'),
        productSearchInput: document.getElementById('productSearchInput'),
        productResults: document.getElementById('productResults'),

        selectedCustomerCard: document.getElementById('selectedCustomerCard'),
        displayCustomerId: document.getElementById('displayCustomerId'),
        displayFirstName: document.getElementById('displayFirstName'),
        displayLastName: document.getElementById('displayLastName'),
        displayEmail: document.getElementById('displayEmail'),
        CustomerID: document.getElementById('CustomerID'),

        modalProductName: document.getElementById('modalProductName'),
        modalProductStock: document.getElementById('modalProductStock'),
        modalQuantityInput: document.getElementById('modalQuantityInput'),
        stockError: document.getElementById('stockError'),
        btnConfirmAdd: document.getElementById('btnConfirmAdd'),

        productsTableBody: document.getElementById('productsTableBody'),
        emptyRow: document.getElementById('emptyRow'),
        subtotalAmount: document.getElementById('subtotalAmount'),
        taxAmount: document.getElementById('taxAmount'),
        totalAmount: document.getElementById('totalAmount'),
        btnGenerateInvoice: document.getElementById('btnGenerateInvoice'),
        detailsJson: document.getElementById('detailsJson'),
        invoiceForm: document.getElementById('invoiceForm')
    };

    // ==================== 🔥 CARGAR TODOS LOS CLIENTES AL ABRIR MODAL ====================
    customerModalEl.addEventListener('shown.bs.modal', function () {
        console.log('📋 Modal de clientes abierto, cargando todos los clientes...');
        elements.customerSearchInput.value = '';
        elements.customerSearchInput.focus();
        loadAllCustomers();
    });

    // 🔥 EVENTO AL CERRAR EL MODAL - LIMPIAR TODO
    customerModalEl.addEventListener('hidden.bs.modal', function () {
        console.log('🔒 Modal de clientes cerrado - limpiando...');
        const allBackdrops = document.querySelectorAll('.modal-backdrop');
        allBackdrops.forEach(backdrop => backdrop.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    });

    async function loadAllCustomers() {
        try {
            const response = await fetch(`${API_BASE}/all-customers`);
            const customers = await response.json();

            if (customers && customers.length > 0) {
                renderCustomerResults(customers);
            } else {
                elements.customerResults.innerHTML = '<p class="text-muted text-center">No hay clientes registrados</p>';
            }
        } catch (error) {
            console.error('Error cargando clientes:', error);
            showNotification('Error al cargar clientes', 'error');
        }
    }

    // ==================== BÚSQUEDA DE CLIENTES (FILTRADO EN TIEMPO REAL) ====================
    elements.customerSearchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimer);
        const query = e.target.value.trim();

        // 🔥 SI NO HAY TEXTO, MOSTRAR TODOS
        if (query.length < 1) {
            loadAllCustomers();
            return;
        }

        // 🔥 FILTRAR CON LA API
        searchTimer = setTimeout(() => searchCustomers(query), 300);
    });

    async function searchCustomers(query) {
        try {
            const response = await fetch(`${API_BASE}/customers?q=${encodeURIComponent(query)}&pageSize=50`);
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                renderCustomerResults(data.items);
            } else {
                elements.customerResults.innerHTML = '<p class="text-muted text-center">No se encontraron clientes</p>';
            }
        } catch (error) {
            console.error('Error buscando clientes:', error);
            showNotification('Error al buscar clientes', 'error');
        }
    }

    function renderCustomerResults(customers) {
        let html = '';
        customers.forEach(c => {
            html += `
                <a href="#" class="list-group-item list-group-item-action" data-customer-id="${c.customerID}" data-customer-firstname="${escapeHtml(c.firstName)}" data-customer-lastname="${escapeHtml(c.lastName)}" data-customer-email="${escapeHtml(c.email)}">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1"><strong>ID: ${c.customerID}</strong> - ${c.firstName} ${c.lastName}</h6>
                    </div>
                    <small class="text-muted">${c.email}</small>
                </a>
            `;
        });
        elements.customerResults.innerHTML = html;

        // 🔥 AGREGAR EVENT LISTENERS A CADA CLIENTE
        elements.customerResults.querySelectorAll('.list-group-item').forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                const id = parseInt(this.dataset.customerId);
                const firstName = this.dataset.customerFirstname;
                const lastName = this.dataset.customerLastname;
                const email = this.dataset.customerEmail;
                selectCustomer(id, firstName, lastName, email);
            });
        });
    }

    function selectCustomer(id, firstName, lastName, email) {
        console.log('✅ Cliente seleccionado:', { id, firstName, lastName, email });

        selectedCustomer = { id, firstName, lastName, email };

        elements.CustomerID.value = id;
        elements.displayCustomerId.textContent = id;
        elements.displayFirstName.textContent = firstName;
        elements.displayLastName.textContent = lastName;
        elements.displayEmail.textContent = email;

        elements.selectedCustomerCard.style.display = 'block';

        // 🔥 CERRAR MODAL CORRECTAMENTE
        customerModal.hide();

        checkFormCompletion();
        showNotification('Cliente seleccionado correctamente', 'success');
    }

    // ==================== 🔥 CARGAR TODOS LOS PRODUCTOS AL ABRIR MODAL ====================
    productModalEl.addEventListener('shown.bs.modal', function () {
        console.log('📦 Modal de productos abierto, cargando todos los productos...');
        elements.productSearchInput.value = '';
        elements.productSearchInput.focus();
        loadAllProducts();
    });

    // 🔥 EVENTO AL CERRAR EL MODAL DE PRODUCTOS - LIMPIAR TODO
    productModalEl.addEventListener('hidden.bs.modal', function () {
        console.log('🔒 Modal de productos cerrado - limpiando...');
        const allBackdrops = document.querySelectorAll('.modal-backdrop');
        allBackdrops.forEach(backdrop => backdrop.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    });

    async function loadAllProducts() {
        try {
            const response = await fetch(`${API_BASE}/all-products`);
            const products = await response.json();

            if (products && products.length > 0) {
                renderProductResults(products);
            } else {
                elements.productResults.innerHTML = '<p class="text-muted text-center col-12">No hay productos registrados</p>';
            }
        } catch (error) {
            console.error('Error cargando productos:', error);
            showNotification('Error al cargar productos', 'error');
        }
    }

    // ==================== BÚSQUEDA DE PRODUCTOS (FILTRADO EN TIEMPO REAL) ====================
    elements.productSearchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimer);
        const query = e.target.value.trim();

        // 🔥 SI NO HAY TEXTO, MOSTRAR TODOS
        if (query.length < 1) {
            loadAllProducts();
            return;
        }

        // 🔥 FILTRAR CON LA API
        searchTimer = setTimeout(() => searchProducts(query), 300);
    });

    async function searchProducts(query) {
        try {
            const response = await fetch(`${API_BASE}/products?q=${encodeURIComponent(query)}&pageSize=50`);
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                renderProductResults(data.items);
            } else {
                elements.productResults.innerHTML = '<p class="text-muted text-center col-12">No se encontraron productos</p>';
            }
        } catch (error) {
            console.error('Error buscando productos:', error);
            showNotification('Error al buscar productos', 'error');
        }
    }

    function renderProductResults(productsList) {
        let html = '';
        productsList.forEach(p => {
            const isOutOfStock = p.stock === 0;
            const cardClass = isOutOfStock ? 'product-card out-of-stock' : 'product-card';

            html += `
                <div class="col-md-4">
                    <div class="${cardClass}" data-product-id="${p.productID}" data-product-code="${escapeHtml(p.productCode)}" data-product-name="${escapeHtml(p.productName)}" data-product-price="${p.price}" data-product-stock="${p.stock}" data-out-of-stock="${isOutOfStock}">
                        <h6 class="fw-bold">${p.productCode}</h6>
                        <p class="mb-1">${p.productName}</p>
                        <p class="text-primary mb-1"><strong>$${p.price.toFixed(2)}</strong></p>
                        <p class="mb-0 ${p.stock > 10 ? 'text-success' : p.stock > 0 ? 'text-warning' : 'text-danger'}">
                            Stock: <strong>${p.stock}</strong>
                        </p>
                        ${isOutOfStock ? '<span class="badge bg-danger">SIN STOCK</span>' : '<span class="badge bg-success">Disponible</span>'}
                    </div>
                </div>
            `;
        });
        elements.productResults.innerHTML = html;

        // 🔥 AGREGAR EVENT LISTENERS A CADA PRODUCTO
        elements.productResults.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', function () {
                const isOutOfStock = this.dataset.outOfStock === 'true';
                if (isOutOfStock) return; // No hacer nada si está sin stock

                const id = parseInt(this.dataset.productId);
                const code = this.dataset.productCode;
                const name = this.dataset.productName;
                const price = parseFloat(this.dataset.productPrice);
                const stock = parseInt(this.dataset.productStock);

                openQuantityModal(id, code, name, price, stock);
            });
        });
    }

    function openQuantityModal(id, code, name, price, stock) {
        selectedProductToAdd = { ProductID: id, ProductCode: code, ProductName: name, Price: price, Stock: stock };

        elements.modalProductName.textContent = `${code} - ${name}`;
        elements.modalProductStock.textContent = stock;
        elements.modalQuantityInput.value = 1;
        elements.modalQuantityInput.max = stock;
        elements.stockError.classList.add('d-none');
        elements.btnConfirmAdd.disabled = false;

        // 🔥 Habilitar escritura y remover atributo readonly si existe
        elements.modalQuantityInput.removeAttribute('readonly');
        elements.modalQuantityInput.removeAttribute('disabled');

        quantityModal.show();

        // 🔥 Enfocar el input después de que el modal se abra
        setTimeout(() => {
            elements.modalQuantityInput.focus();
            elements.modalQuantityInput.select();
        }, 300);
    }

    // Validar cantidad en tiempo real
    elements.modalQuantityInput.addEventListener('input', () => {
        validateQuantityInput();
    });

    // 🔥 NUEVO: También validar cuando se usan las flechitas
    elements.modalQuantityInput.addEventListener('change', () => {
        validateQuantityInput();
    });

    // 🔥 NUEVO: Permitir presionar Enter para agregar
    elements.modalQuantityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!elements.btnConfirmAdd.disabled) {
                elements.btnConfirmAdd.click();
            }
        }
    });

    function validateQuantityInput() {
        const inputValue = elements.modalQuantityInput.value;
        const qty = parseInt(inputValue) || 0;
        const stock = selectedProductToAdd ? selectedProductToAdd.Stock : 0;

        // 🔥 Validar que solo sean números
        if (inputValue && !/^\d+$/.test(inputValue)) {
            elements.modalQuantityInput.value = inputValue.replace(/\D/g, '');
            return;
        }

        if (qty > stock) {
            elements.stockError.textContent = `Stock insuficiente. Disponible: ${stock}`;
            elements.stockError.classList.remove('d-none');
            elements.btnConfirmAdd.disabled = true;
            elements.modalQuantityInput.classList.add('border-danger');
        } else if (qty < 1) {
            elements.stockError.textContent = 'La cantidad debe ser mayor a 0';
            elements.stockError.classList.remove('d-none');
            elements.btnConfirmAdd.disabled = true;
            elements.modalQuantityInput.classList.add('border-danger');
        } else {
            elements.stockError.classList.add('d-none');
            elements.btnConfirmAdd.disabled = false;
            elements.modalQuantityInput.classList.remove('border-danger');
        }
    }

    // Confirmar agregar producto
    elements.btnConfirmAdd.addEventListener('click', () => {
        const qty = parseInt(elements.modalQuantityInput.value) || 0;

        if (!selectedProductToAdd || qty < 1 || qty > selectedProductToAdd.Stock) {
            showNotification('Cantidad inválida', 'error');
            return;
        }

        // Verificar si el producto ya está en la tabla
        const existing = products.find(p => p.ProductID === selectedProductToAdd.ProductID);
        if (existing) {
            const newQty = existing.Quantity + qty;
            if (newQty > selectedProductToAdd.Stock) {
                showNotification('La cantidad total supera el stock disponible', 'error');
                return;
            }
            existing.Quantity = newQty;
        } else {
            products.push({
                ProductID: selectedProductToAdd.ProductID,
                ProductCode: selectedProductToAdd.ProductCode,
                ProductName: selectedProductToAdd.ProductName,
                Quantity: qty,
                UnitPrice: selectedProductToAdd.Price,
                Stock: selectedProductToAdd.Stock
            });
        }

        renderProductsTable();
        quantityModal.hide();
        showNotification('Producto agregado correctamente', 'success');

        // Limpiar y recargar productos
        elements.productSearchInput.value = '';
        loadAllProducts();
        elements.productSearchInput.focus();
    });

    // ==================== TABLA DE PRODUCTOS ====================
    function renderProductsTable() {
        if (products.length === 0) {
            elements.emptyRow.style.display = 'table-row';
            elements.productsTableBody.innerHTML = '';
            updateTotals();
            checkFormCompletion();
            return;
        }

        elements.emptyRow.style.display = 'none';
        let html = '';

        products.forEach((p, index) => {
            const total = p.Quantity * p.UnitPrice;
            html += `
                <tr>
                    <td><strong>${p.ProductCode}</strong></td>
                    <td>${p.ProductName}</td>
                    <td class="text-end">
                        <input type="number" class="form-control text-end d-inline-block quantity-input" style="width: 80px;" 
                               value="${p.Quantity}" min="1" max="${p.Stock}" data-index="${index}">
                    </td>
                    <td class="text-end">$${p.UnitPrice.toFixed(2)}</td>
                    <td class="text-end"><strong>$${total.toFixed(2)}</strong></td>
                    <td class="text-center">
                        <button type="button" class="btn btn-sm btn-danger remove-product-btn" data-index="${index}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        elements.productsTableBody.innerHTML = html;

        // Event listeners para cantidad (🔥 CORREGIDO: No re-renderizar en cada tecla)
        document.querySelectorAll('.quantity-input').forEach(input => {
            // 🔥 Solo validar mientras escribes, NO re-renderizar
            input.addEventListener('input', function () {
                const qty = parseInt(this.value) || 0;
                const index = parseInt(this.dataset.index);
                const product = products[index];

                // Validar y mostrar error si es necesario
                if (qty > product.Stock) {
                    this.classList.add('border-danger');
                } else {
                    this.classList.remove('border-danger');
                }
            });

            // 🔥 Solo actualizar cuando termine de escribir (pierde el foco o presiona Enter)
            input.addEventListener('change', function () {
                const index = parseInt(this.dataset.index);
                updateQuantity(index, this.value);
            });

            input.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    const index = parseInt(this.dataset.index);
                    updateQuantity(index, this.value);
                    this.blur();
                }
            });
        });

        // Event listeners para eliminar
        document.querySelectorAll('.remove-product-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const index = parseInt(this.dataset.index);
                removeProduct(index);
            });
        });

        updateTotals();
        checkFormCompletion();
    }

    function updateQuantity(index, newQty) {
        const qty = parseInt(newQty) || 0;
        const product = products[index];

        if (qty < 1) {
            showNotification('La cantidad debe ser mayor a 0', 'error');
            renderProductsTable();
            return;
        }

        if (qty > product.Stock) {
            showNotification(`Stock insuficiente. Disponible: ${product.Stock}`, 'error');
            renderProductsTable();
            return;
        }

        product.Quantity = qty;
        renderProductsTable();
    }

    function removeProduct(index) {
        products.splice(index, 1);
        renderProductsTable();
        showNotification('Producto eliminado', 'info');
    }

    // ==================== TOTALES ====================
    function updateTotals() {
        const subtotal = products.reduce((sum, p) => sum + (p.Quantity * p.UnitPrice), 0);
        const tax = subtotal * 0.19;
        const total = subtotal + tax;

        elements.subtotalAmount.textContent = `$${subtotal.toFixed(2)}`;
        elements.taxAmount.textContent = `$${tax.toFixed(2)}`;
        elements.totalAmount.textContent = `$${total.toFixed(2)}`;
    }

    // ==================== GENERAR FACTURA ====================
    function checkFormCompletion() {
        const canGenerate = selectedCustomer && products.length > 0;
        elements.btnGenerateInvoice.disabled = !canGenerate;
    }

    elements.invoiceForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!selectedCustomer || products.length === 0) {
            showNotification('Completa todos los datos antes de generar la factura', 'error');
            return;
        }

        const invoiceDetails = products.map(p => ({
            ProductID: p.ProductID,
            ProductCode: p.ProductCode,
            ProductName: p.ProductName,
            Quantity: p.Quantity,
            UnitPrice: p.UnitPrice,
            Stock: p.Stock
        }));

        elements.detailsJson.value = JSON.stringify(invoiceDetails);
        e.target.submit();
    });

    // ==================== UTILIDADES ====================
    function escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    function showNotification(message, type) {
        const colors = { success: 'success', error: 'danger', warning: 'warning', info: 'info' };
        const alert = document.createElement('div');
        alert.className = `alert alert-${colors[type]} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
        alert.style.zIndex = '9999';
        alert.style.minWidth = '300px';
        alert.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 3000);
    }

    console.log('🎉 Sistema de facturación con modales listo');
});