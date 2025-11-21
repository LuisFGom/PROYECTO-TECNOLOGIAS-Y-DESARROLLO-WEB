// ================================================================
// SISTEMA DE FACTURACIÓN AVANZADO - VERSIÓN FINAL
// ================================================================

console.log('🚀 Iniciando sistema de facturación...');

// ==================== ESPERAR A QUE EL DOM ESTÉ LISTO ====================
document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ DOM cargado, iniciando sistema...');

    const API_BASE = '/api/lookup';
    let selectedCustomer = null;
    let selectedProduct = null;
    let products = [];
    let searchTimer = null;

    // ==================== ELEMENTOS DEL DOM ====================
    const elements = {
        // Clientes
        btnSearchById: document.getElementById('btnSearchById'),
        btnSearchByName: document.getElementById('btnSearchByName'),
        btnSearchByLastName: document.getElementById('btnSearchByLastName'),
        btnSearchByEmail: document.getElementById('btnSearchByEmail'),

        searchCustomerId: document.getElementById('searchCustomerId'),
        searchCustomerName: document.getElementById('searchCustomerName'),
        searchCustomerLastName: document.getElementById('searchCustomerLastName'),
        searchCustomerEmail: document.getElementById('searchCustomerEmail'),

        customerIdResults: document.getElementById('customerIdResults'),
        selectedCustomerCard: document.getElementById('selectedCustomerCard'),

        displayCustomerId: document.getElementById('displayCustomerId'),
        displayFirstName: document.getElementById('displayFirstName'),
        displayLastName: document.getElementById('displayLastName'),
        displayEmail: document.getElementById('displayEmail'),

        CustomerID: document.getElementById('CustomerID'),
        FirstName: document.getElementById('FirstName'),
        LastName: document.getElementById('LastName'),
        Email: document.getElementById('Email'),

        // Productos
        btnSearchByCode: document.getElementById('btnSearchByCode'),
        btnSearchByProductName: document.getElementById('btnSearchByProductName'),

        searchProductCode: document.getElementById('searchProductCode'),
        searchProductName: document.getElementById('searchProductName'),
        productCodeResults: document.getElementById('productCodeResults'),

        ProductPrice: document.getElementById('ProductPrice'),
        ProductStock: document.getElementById('ProductStock'),
        ProductQuantity: document.getElementById('ProductQuantity'),

        btnAddProduct: document.getElementById('btnAddProduct'),
        productsTableBody: document.getElementById('productsTableBody'),
        emptyRow: document.getElementById('emptyRow'),

        // Factura
        subtotalAmount: document.getElementById('subtotalAmount'),
        taxAmount: document.getElementById('taxAmount'),
        totalAmount: document.getElementById('totalAmount'),
        invoicePreview: document.getElementById('invoicePreview'),

        btnGenerateInvoice: document.getElementById('btnGenerateInvoice'),
        detailsJson: document.getElementById('detailsJson'),
        invoiceForm: document.getElementById('invoiceForm')
    };

    console.log('📋 Elementos del DOM cargados');

    // ==================== BÚSQUEDA DE CLIENTES ====================

    elements.btnSearchById?.addEventListener('click', () => {
        console.log('🔍 Buscar por ID activado');
        disableAllCustomerInputs();
        elements.searchCustomerId.disabled = false;
        elements.searchCustomerId.focus();
        highlightActiveButton(elements.btnSearchById, 'customer');
    });

    elements.btnSearchByName?.addEventListener('click', () => {
        console.log('🔍 Buscar por Nombre activado');
        disableAllCustomerInputs();
        elements.searchCustomerName.disabled = false;
        elements.searchCustomerName.focus();
        highlightActiveButton(elements.btnSearchByName, 'customer');
    });

    elements.btnSearchByLastName?.addEventListener('click', () => {
        console.log('🔍 Buscar por Apellido activado');
        disableAllCustomerInputs();
        elements.searchCustomerLastName.disabled = false;
        elements.searchCustomerLastName.focus();
        highlightActiveButton(elements.btnSearchByLastName, 'customer');
    });

    elements.btnSearchByEmail?.addEventListener('click', () => {
        console.log('🔍 Buscar por Email activado');
        disableAllCustomerInputs();
        elements.searchCustomerEmail.disabled = false;
        elements.searchCustomerEmail.focus();
        highlightActiveButton(elements.btnSearchByEmail, 'customer');
    });

    function disableAllCustomerInputs() {
        elements.searchCustomerId.disabled = true;
        elements.searchCustomerName.disabled = true;
        elements.searchCustomerLastName.disabled = true;
        elements.searchCustomerEmail.disabled = true;

        elements.searchCustomerId.value = '';
        elements.searchCustomerName.value = '';
        elements.searchCustomerLastName.value = '';
        elements.searchCustomerEmail.value = '';

        elements.customerIdResults.style.display = 'none';
    }

    function highlightActiveButton(activeBtn, type) {
        const buttons = type === 'customer'
            ? [elements.btnSearchById, elements.btnSearchByName, elements.btnSearchByLastName, elements.btnSearchByEmail]
            : [elements.btnSearchByCode, elements.btnSearchByProductName];

        const colorClass = type === 'customer' ? 'primary' : 'success';

        buttons.forEach(btn => {
            btn.classList.remove('active', `btn-${colorClass}`);
            btn.classList.add(`btn-outline-${colorClass}`);
        });

        activeBtn.classList.add('active', `btn-${colorClass}`);
        activeBtn.classList.remove(`btn-outline-${colorClass}`);
    }

    // Búsqueda en tiempo real de clientes
    [elements.searchCustomerId, elements.searchCustomerName,
    elements.searchCustomerLastName, elements.searchCustomerEmail].forEach(input => {
        input?.addEventListener('input', (e) => {
            clearTimeout(searchTimer);
            const query = e.target.value.trim();

            if (query.length < 1) {
                elements.customerIdResults.style.display = 'none';
                return;
            }

            searchTimer = setTimeout(() => searchCustomers(query), 300);
        });
    });

    async function searchCustomers(query) {
        try {
            console.log('🌐 Buscando clientes:', query);
            const response = await fetch(`${API_BASE}/customers?q=${encodeURIComponent(query)}&pageSize=10`);
            const data = await response.json();

            console.log('📦 Clientes encontrados:', data);

            if (data.items && data.items.length > 0) {
                showCustomerResults(data.items);
            } else {
                elements.customerIdResults.innerHTML = '<div class="search-result-item text-muted">No se encontraron clientes</div>';
                elements.customerIdResults.style.display = 'block';
            }
        } catch (error) {
            console.error('❌ Error buscando clientes:', error);
            showNotification('Error al buscar clientes', 'error');
        }
    }

    function showCustomerResults(customers) {
        let html = '';
        customers.forEach(c => {
            const customerId = c.CustomerID || c.customerID;
            const firstName = c.FirstName || c.firstName || '';
            const lastName = c.LastName || c.lastName || '';
            const email = c.Email || c.email || '';

            const safeFirstName = firstName.replace(/'/g, "\\'");
            const safeLastName = lastName.replace(/'/g, "\\'");
            const safeEmail = email.replace(/'/g, "\\'");

            html += `
                <div class="search-result-item" onclick="selectCustomer(${customerId}, '${safeFirstName}', '${safeLastName}', '${safeEmail}')">
                    <strong>ID: ${customerId}</strong> - ${firstName} ${lastName}
                    <br><small class="text-muted">${email}</small>
                </div>
            `;
        });
        elements.customerIdResults.innerHTML = html;
        elements.customerIdResults.style.display = 'block';
    }

    window.selectCustomer = function (id, firstName, lastName, email) {
        console.log('✅ Cliente seleccionado:', { id, firstName, lastName, email });

        selectedCustomer = { id, firstName, lastName, email };

        elements.CustomerID.value = id;
        elements.FirstName.value = firstName;
        elements.LastName.value = lastName;
        elements.Email.value = email;

        elements.displayCustomerId.textContent = id;
        elements.displayFirstName.textContent = firstName;
        elements.displayLastName.textContent = lastName;
        elements.displayEmail.textContent = email;

        elements.selectedCustomerCard.style.display = 'block';
        elements.customerIdResults.style.display = 'none';

        disableAllCustomerInputs();
        checkFormCompletion();
        showNotification('Cliente seleccionado correctamente', 'success');
    };

    // ==================== BÚSQUEDA DE PRODUCTOS ====================

    elements.btnSearchByCode?.addEventListener('click', () => {
        console.log('🔍 Buscar producto por código');
        disableAllProductInputs();
        elements.searchProductCode.disabled = false;
        elements.searchProductCode.focus();
        highlightActiveButton(elements.btnSearchByCode, 'product');
    });

    elements.btnSearchByProductName?.addEventListener('click', () => {
        console.log('🔍 Buscar producto por nombre');
        disableAllProductInputs();
        elements.searchProductName.disabled = false;
        elements.searchProductName.focus();
        highlightActiveButton(elements.btnSearchByProductName, 'product');
    });

    function disableAllProductInputs() {
        elements.searchProductCode.disabled = true;
        elements.searchProductName.disabled = true;
        elements.searchProductCode.value = '';
        elements.searchProductName.value = '';
        elements.productCodeResults.style.display = 'none';
        clearProductFields();
    }

    function clearProductFields() {
        selectedProduct = null;
        elements.ProductPrice.value = '';
        elements.ProductStock.value = '';
        elements.ProductQuantity.value = 1;
        elements.ProductQuantity.disabled = true;
        elements.btnAddProduct.disabled = true;
    }

    [elements.searchProductCode, elements.searchProductName].forEach(input => {
        input?.addEventListener('input', (e) => {
            clearTimeout(searchTimer);
            const query = e.target.value.trim();

            if (query.length < 1) {
                elements.productCodeResults.style.display = 'none';
                clearProductFields();
                return;
            }

            searchTimer = setTimeout(() => searchProducts(query), 300);
        });
    });

    async function searchProducts(query) {
        try {
            console.log('🌐 Buscando productos:', query);
            const response = await fetch(`${API_BASE}/products?q=${encodeURIComponent(query)}&pageSize=10`);
            const data = await response.json();

            console.log('📦 Productos encontrados:', data);

            if (data.items && data.items.length > 0) {
                showProductResults(data.items);
            } else {
                elements.productCodeResults.innerHTML = '<div class="search-result-item text-muted">No se encontraron productos</div>';
                elements.productCodeResults.style.display = 'block';
            }
        } catch (error) {
            console.error('❌ Error buscando productos:', error);
            showNotification('Error al buscar productos', 'error');
        }
    }

    function showProductResults(productList) {
        let html = '';
        productList.forEach(p => {
            const productId = p.ProductID || p.productID;
            const productCode = p.ProductCode || p.productCode || '';
            const productName = p.ProductName || p.productName || '';
            const price = p.Price || p.price || 0;
            const stock = p.Stock || p.stock || 0;

            const safeCode = productCode.replace(/'/g, "\\'");
            const safeName = productName.replace(/'/g, "\\'");

            html += `
                <div class="search-result-item" onclick="selectProduct(${productId}, '${safeCode}', '${safeName}', ${price}, ${stock})">
                    <strong>${productCode}</strong> - ${productName}
                    <br><small class="text-muted">Precio: $${price.toFixed(2)} | Stock: ${stock}</small>
                </div>
            `;
        });
        elements.productCodeResults.innerHTML = html;
        elements.productCodeResults.style.display = 'block';
    }

    window.selectProduct = function (id, code, name, price, stock) {
        console.log('✅ Producto seleccionado:', { id, code, name, price, stock });

        selectedProduct = {
            ProductID: id,
            ProductCode: code,
            ProductName: name,
            Price: parseFloat(price),
            Stock: parseInt(stock)
        };

        elements.searchProductCode.value = code;
        elements.searchProductName.value = name;
        elements.ProductPrice.value = `$${parseFloat(price).toFixed(2)}`;
        elements.ProductStock.value = stock;
        elements.ProductQuantity.disabled = false;
        elements.ProductQuantity.focus();
        elements.productCodeResults.style.display = 'none';

        checkAddButtonState();
        showNotification('Producto seleccionado', 'success');
    };

    elements.ProductQuantity?.addEventListener('input', checkAddButtonState);

    function checkAddButtonState() {
        const qty = parseInt(elements.ProductQuantity.value) || 0;
        elements.btnAddProduct.disabled = !selectedProduct || qty < 1;
    }

    // ==================== AGREGAR PRODUCTO ====================

    elements.btnAddProduct?.addEventListener('click', () => {
        const qty = parseInt(elements.ProductQuantity.value) || 0;

        if (!selectedProduct) {
            showNotification('Selecciona un producto primero', 'warning');
            return;
        }

        if (qty < 1) {
            showNotification('La cantidad debe ser mayor a 0', 'warning');
            return;
        }

        if (qty > selectedProduct.Stock) {
            showNotification(`Stock insuficiente. Disponible: ${selectedProduct.Stock}`, 'error');
            return;
        }

        const existing = products.find(p => p.ProductID === selectedProduct.ProductID);
        if (existing) {
            const newQty = existing.Quantity + qty;
            if (newQty > selectedProduct.Stock) {
                showNotification('La cantidad total supera el stock disponible', 'error');
                return;
            }
            existing.Quantity = newQty;
        } else {
            products.push({
                ProductID: selectedProduct.ProductID,
                ProductCode: selectedProduct.ProductCode,
                ProductName: selectedProduct.ProductName,
                Quantity: qty,
                UnitPrice: selectedProduct.Price,
                Stock: selectedProduct.Stock
            });
        }

        console.log('📋 Productos actuales:', products);
        renderProductsTable();
        disableAllProductInputs();
        showNotification('Producto agregado correctamente', 'success');
    });

    function renderProductsTable() {
        if (products.length === 0) {
            elements.emptyRow.style.display = 'table-row';
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
                    <td class="text-center">${p.Quantity}</td>
                    <td class="text-end">$${p.UnitPrice.toFixed(2)}</td>
                    <td class="text-end"><strong>$${total.toFixed(2)}</strong></td>
                    <td class="text-center">
                        <button type="button" class="btn btn-sm btn-danger" onclick="removeProduct(${index})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        elements.productsTableBody.innerHTML = html;
        updateTotals();
        checkFormCompletion();
    }

    window.removeProduct = function (index) {
        console.log('🗑️ Eliminando producto:', index);
        products.splice(index, 1);
        renderProductsTable();
        showNotification('Producto eliminado', 'info');
    };

    // ==================== TOTALES ====================

    function updateTotals() {
        const subtotal = products.reduce((sum, p) => sum + (p.Quantity * p.UnitPrice), 0);
        const tax = subtotal * 0.19;
        const total = subtotal + tax;

        elements.subtotalAmount.textContent = `$${subtotal.toFixed(2)}`;
        elements.taxAmount.textContent = `$${tax.toFixed(2)}`;
        elements.totalAmount.textContent = `$${total.toFixed(2)}`;

        console.log('💰 Totales actualizados:', { subtotal, tax, total });
    }

    // ==================== GENERAR FACTURA ====================

    function checkFormCompletion() {
        const canGenerate = selectedCustomer && products.length > 0;
        elements.btnGenerateInvoice.disabled = !canGenerate;
    }

    elements.btnGenerateInvoice?.addEventListener('click', () => {
        console.log('📄 Generando factura...');

        if (!selectedCustomer) {
            showNotification('Debes seleccionar un cliente', 'error');
            return;
        }

        if (products.length === 0) {
            showNotification('Debes agregar al menos un producto', 'error');
            return;
        }

        elements.invoicePreview.style.display = 'block';
        elements.invoicePreview.scrollIntoView({ behavior: 'smooth' });
        updateTotals();

        console.log('✅ Vista previa mostrada');
    });

    elements.invoiceForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!selectedCustomer || products.length === 0) {
            showNotification('Completa todos los datos antes de confirmar', 'error');
            return;
        }

        elements.detailsJson.value = JSON.stringify(products);
        console.log('📤 Enviando factura:', { customer: selectedCustomer, products });

        e.target.submit();
    });

    // ==================== NOTIFICACIONES ====================

    function showNotification(message, type) {
        const colors = {
            success: 'success',
            error: 'danger',
            warning: 'warning',
            info: 'info'
        };

        const alert = document.createElement('div');
        alert.className = `alert alert-${colors[type]} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
        alert.style.zIndex = '9999';
        alert.style.minWidth = '300px';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 3000);
    }

    console.log('🎉 Sistema de facturación listo');
});