// ================================================================
// SISTEMA DE FACTURACIÓN AVANZADO - VERSIÓN FINAL MEJORADA (CORREGIDA)
// ================================================================

console.log('🚀 Iniciando sistema de facturación...');

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
        customerNameResults: document.getElementById('customerNameResults'),
        customerLastNameResults: document.getElementById('customerLastNameResults'),
        customerEmailResults: document.getElementById('customerEmailResults'),

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
        // 🛠️ CORRECCIÓN: Agregar el contenedor de resultados para la búsqueda por Nombre del Producto
        productNameResults: document.getElementById('productNameResults'), // Asegúrate de que este ID exista en tu CSHTML

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

    // Se mantiene la lógica de botones de clientes...
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

        // 🛠️ CORRECCIÓN: Ocultar explícitamente todos los dropdowns al deshabilitar
        elements.customerIdResults.style.display = 'none';
        elements.customerNameResults.style.display = 'none';
        elements.customerLastNameResults.style.display = 'none';
        elements.customerEmailResults.style.display = 'none';
    }

    function highlightActiveButton(activeBtn, type) {
        const buttons = type === 'customer'
            ? [elements.btnSearchById, elements.btnSearchByName, elements.btnSearchByLastName, elements.btnSearchByEmail]
            : [elements.btnSearchByCode, elements.btnSearchByProductName];

        const colorClass = type === 'customer' ? 'primary' : 'success';

        buttons.forEach(btn => {
            if (btn) {
                btn.classList.remove('active', `btn-${colorClass}`);
                btn.classList.add(`btn-outline-${colorClass}`);
            }
        });

        if (activeBtn) {
            activeBtn.classList.add('active', `btn-${colorClass}`);
            activeBtn.classList.remove(`btn-outline-${colorClass}`);
        }
    }

    // Búsqueda en tiempo real de clientes - 🔥 CORREGIDA: Lógica para pasar el tipo de búsqueda
    const customerSearchConfig = [
        { input: elements.searchCustomerId, results: elements.customerIdResults, type: 'id' },
        { input: elements.searchCustomerName, results: elements.customerNameResults, type: 'name' },
        { input: elements.searchCustomerLastName, results: elements.customerLastNameResults, type: 'lastname' },
        { input: elements.searchCustomerEmail, results: elements.customerEmailResults, type: 'email' }
    ];

    customerSearchConfig.forEach(({ input, results, type }) => {
        if (input && results) {
            input.addEventListener('input', (e) => {
                clearTimeout(searchTimer);
                const query = e.target.value.trim();

                // 🛠️ CORRECCIÓN: Asegurar que solo el dropdown activo se muestre y los demás se oculten
                hideAllCustomerDropdowns(results); // Oculta todos excepto el que se usará

                if (query.length < 1) {
                    results.style.display = 'none';
                    return;
                }

                searchTimer = setTimeout(() => searchCustomers(query, results, type), 300);
            });
        }
    });

    // Nueva función para ocultar todos los dropdowns de clientes (excepto el activo opcionalmente)
    function hideAllCustomerDropdowns(excludeContainer = null) {
        [elements.customerIdResults, elements.customerNameResults, elements.customerLastNameResults, elements.customerEmailResults].forEach(container => {
            if (container && container !== excludeContainer) {
                container.style.display = 'none';
            }
        });
    }

    async function searchCustomers(query, resultsContainer, searchType) {
        try {
            console.log(`🌐 Buscando clientes por ${searchType}: ${query}`);
            // NOTA: Para una API real, deberías enviar el 'searchType' (e.g., /customers?type=name&q=query)
            // Aquí, tu API solo usa 'q', lo cual no diferencia, pero la clave es el 'resultsContainer'
            const response = await fetch(`${API_BASE}/customers?q=${encodeURIComponent(query)}&pageSize=10`);
            const data = await response.json();

            console.log('📦 Clientes encontrados:', data);

            if (data.items && data.items.length > 0) {
                showCustomerResults(data.items, resultsContainer);
            } else {
                resultsContainer.innerHTML = '<div class="search-result-item text-muted">No se encontraron clientes</div>';
                resultsContainer.style.display = 'block';
            }
        } catch (error) {
            console.error('❌ Error buscando clientes:', error);
            showNotification('Error al buscar clientes', 'error');
        }
    }

    function showCustomerResults(customers, resultsContainer) {
        let html = '';
        customers.forEach(c => {
            const customerId = c.CustomerID || c.customerID;
            const firstName = c.FirstName || c.firstName || '';
            const lastName = c.LastName || c.lastName || '';
            const email = c.Email || c.email || '';

            // Escapando comillas simples para la función onclick
            const safeFirstName = String(firstName).replace(/'/g, "\\'");
            const safeLastName = String(lastName).replace(/'/g, "\\'");
            const safeEmail = String(email).replace(/'/g, "\\'");

            html += `
                <div class="search-result-item" onclick="selectCustomer(${customerId}, '${safeFirstName}', '${safeLastName}', '${safeEmail}')">
                    <strong>ID: ${customerId}</strong> - ${firstName} ${lastName}
                    <br><small class="text-muted">${email}</small>
                </div>
            `;
        });
        resultsContainer.innerHTML = html;
        resultsContainer.style.display = 'block';
    }

    window.selectCustomer = function (id, firstName, lastName, email) {
        console.log('✅ Cliente seleccionado:', { id, firstName, lastName, email });

        selectedCustomer = { id, firstName, lastName, email };

        if (elements.CustomerID) elements.CustomerID.value = id;
        if (elements.FirstName) elements.FirstName.value = firstName;
        if (elements.LastName) elements.LastName.value = lastName;
        if (elements.Email) elements.Email.value = email;

        if (elements.displayCustomerId) elements.displayCustomerId.textContent = id;
        if (elements.displayFirstName) elements.displayFirstName.textContent = firstName;
        if (elements.displayLastName) elements.displayLastName.textContent = lastName;
        if (elements.displayEmail) elements.displayEmail.textContent = email;

        if (elements.selectedCustomerCard) elements.selectedCustomerCard.style.display = 'block';

        // 🛠️ CORRECCIÓN: Usar la función centralizada para cerrar todos los dropdowns
        hideAllCustomerDropdowns();

        disableAllCustomerInputs();
        checkFormCompletion();
        showNotification('Cliente seleccionado correctamente', 'success');
    };

    // ==================== BÚSQUEDA DE PRODUCTOS ====================

    // Se mantiene la lógica de botones de productos...
    elements.btnSearchByCode?.addEventListener('click', () => {
        console.log('🔍 Buscar producto por código');
        disableAllProductInputs();
        if (elements.searchProductCode) elements.searchProductCode.disabled = false;
        if (elements.searchProductCode) elements.searchProductCode.focus();
        highlightActiveButton(elements.btnSearchByCode, 'product');
    });

    elements.btnSearchByProductName?.addEventListener('click', () => {
        console.log('🔍 Buscar producto por nombre');
        disableAllProductInputs();
        if (elements.searchProductName) elements.searchProductName.disabled = false;
        if (elements.searchProductName) elements.searchProductName.focus();
        highlightActiveButton(elements.btnSearchByProductName, 'product');
    });

    function disableAllProductInputs() {
        if (elements.searchProductCode) elements.searchProductCode.disabled = true;
        if (elements.searchProductName) elements.searchProductName.disabled = true;
        if (elements.searchProductCode) elements.searchProductCode.value = '';
        if (elements.searchProductName) elements.searchProductName.value = '';

        // 🛠️ CORRECCIÓN: Ocultar ambos dropdowns de producto
        if (elements.productCodeResults) elements.productCodeResults.style.display = 'none';
        if (elements.productNameResults) elements.productNameResults.style.display = 'none';

        clearProductFields();
    }

    function clearProductFields() {
        selectedProduct = null;
        if (elements.ProductPrice) elements.ProductPrice.value = '';
        if (elements.ProductStock) elements.ProductStock.value = '';
        if (elements.ProductQuantity) elements.ProductQuantity.value = 1;
        if (elements.ProductQuantity) elements.ProductQuantity.disabled = true;
        if (elements.btnAddProduct) elements.btnAddProduct.disabled = true;
    }

    // 🛠️ CORRECCIÓN: Adaptar la lógica de búsqueda para manejar los dos inputs de producto
    const productSearchConfig = [
        { input: elements.searchProductCode, results: elements.productCodeResults, type: 'code' },
        { input: elements.searchProductName, results: elements.productNameResults, type: 'name' }
    ];

    productSearchConfig.forEach(({ input, results, type }) => {
        input?.addEventListener('input', (e) => {
            clearTimeout(searchTimer);
            const query = e.target.value.trim();

            // 🛠️ CORRECCIÓN: Asegurar que solo el dropdown activo se muestre
            hideAllProductDropdowns(results);

            if (query.length < 1) {
                results.style.display = 'none';
                clearProductFields();
                return;
            }

            // Pasamos el contenedor de resultados específico
            searchTimer = setTimeout(() => searchProducts(query, results, type), 300);
        });
    });

    // Nueva función para ocultar todos los dropdowns de productos
    function hideAllProductDropdowns(excludeContainer = null) {
        [elements.productCodeResults, elements.productNameResults].forEach(container => {
            if (container && container !== excludeContainer) {
                container.style.display = 'none';
            }
        });
    }

    // 🛠️ CORRECCIÓN: La función ahora recibe el contenedor de resultados
    async function searchProducts(query, resultsContainer, searchType) {
        try {
            console.log(`🌐 Buscando productos por ${searchType}: ${query}`);
            const response = await fetch(`${API_BASE}/products?q=${encodeURIComponent(query)}&pageSize=10`);
            const data = await response.json();

            console.log('📦 Productos encontrados:', data);

            if (data.items && data.items.length > 0) {
                // Pasamos el contenedor correcto a la función de renderizado
                showProductResults(data.items, resultsContainer);
            } else {
                resultsContainer.innerHTML = '<div class="search-result-item text-muted">No se encontraron productos</div>';
                resultsContainer.style.display = 'block';
            }
        } catch (error) {
            console.error('❌ Error buscando productos:', error);
            showNotification('Error al buscar productos', 'error');
        }
    }

    // 🛠️ CORRECCIÓN: La función ahora recibe el contenedor de resultados
    function showProductResults(productList, resultsContainer) {
        let html = '';
        productList.forEach(p => {
            const productId = p.ProductID || p.productID;
            const productCode = p.ProductCode || p.productCode || '';
            const productName = p.ProductName || p.productName || '';
            const price = parseFloat(p.Price || p.price || 0);
            const stock = parseInt(p.Stock || p.stock || 0);

            // Escapando comillas simples para la función onclick
            const safeCode = String(productCode).replace(/'/g, "\\'");
            const safeName = String(productName).replace(/'/g, "\\'");

            html += `
                <div class="search-result-item" onclick="selectProduct(${productId}, '${safeCode}', '${safeName}', ${price}, ${stock})">
                    <strong>${productCode}</strong> - ${productName}
                    <br><small class="text-muted">Precio: $${price.toFixed(2)} | Stock: ${stock}</small>
                </div>
            `;
        });

        // 🛠️ CORRECCIÓN: Usar el contenedor que se pasó por parámetro
        resultsContainer.innerHTML = html;
        resultsContainer.style.display = 'block';
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

        if (elements.searchProductCode) elements.searchProductCode.value = code;
        if (elements.searchProductName) elements.searchProductName.value = name;
        if (elements.ProductPrice) elements.ProductPrice.value = `$${parseFloat(price).toFixed(2)}`;
        if (elements.ProductStock) elements.ProductStock.value = stock;
        if (elements.ProductQuantity) {
            elements.ProductQuantity.disabled = false;
            elements.ProductQuantity.focus();
        }

        // 🛠️ CORRECCIÓN: Ocultar ambos dropdowns al seleccionar el producto
        hideAllProductDropdowns();

        checkAddButtonState();
        showNotification('Producto seleccionado', 'success');
    };

    elements.ProductQuantity?.addEventListener('input', checkAddButtonState);

    function checkAddButtonState() {
        const qty = parseInt(elements.ProductQuantity?.value) || 0;
        if (elements.btnAddProduct) {
            elements.btnAddProduct.disabled = !selectedProduct || qty < 1;
        }
    }

    // ==================== AGREGAR PRODUCTO (Resto del código se mantiene) ====================

    elements.btnAddProduct?.addEventListener('click', () => {
        const qty = parseInt(elements.ProductQuantity?.value) || 0;

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
                Stock: selectedProduct.Stock // Se mantiene el stock para referencias futuras/validación
            });
        }

        console.log('📋 Productos actuales:', products);
        renderProductsTable();
        disableAllProductInputs();
        showNotification('Producto agregado correctamente', 'success');
    });

    function renderProductsTable() {
        if (!elements.productsTableBody || !elements.emptyRow) return;

        if (products.length === 0) {
            elements.emptyRow.style.display = 'table-row';
            elements.productsTableBody.innerHTML = ''; // Limpiar el cuerpo de la tabla si está vacía
            updateTotals(); // Actualizar totales a cero
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

    // ==================== TOTALES (Resto del código se mantiene) ====================

    function updateTotals() {
        const subtotal = products.reduce((sum, p) => sum + (p.Quantity * p.UnitPrice), 0);
        const taxRate = 0.19; // 19% de impuesto
        const tax = subtotal * taxRate;
        const total = subtotal + tax;

        if (elements.subtotalAmount) elements.subtotalAmount.textContent = `$${subtotal.toFixed(2)}`;
        if (elements.taxAmount) elements.taxAmount.textContent = `$${tax.toFixed(2)}`;
        if (elements.totalAmount) elements.totalAmount.textContent = `$${total.toFixed(2)}`;

        console.log('💰 Totales actualizados:', { subtotal, tax, total });
    }

    // ==================== GENERAR FACTURA (Corregido el envío) ====================

    function checkFormCompletion() {
        const canGenerate = selectedCustomer && products.length > 0;
        if (elements.btnGenerateInvoice) {
            elements.btnGenerateInvoice.disabled = !canGenerate;
        }
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

        if (elements.invoicePreview) {
            elements.invoicePreview.style.display = 'block';
            elements.invoicePreview.scrollIntoView({ behavior: 'smooth' });
        }
        updateTotals();

        console.log('✅ Vista previa mostrada');
    });

    elements.invoiceForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!selectedCustomer || products.length === 0) {
            showNotification('Completa todos los datos antes de confirmar', 'error');
            return;
        }

        // Preparar los datos finales de la factura
        const invoiceDetails = products.map(p => ({
            ProductID: p.ProductID,
            Quantity: p.Quantity,
            UnitPrice: p.UnitPrice,
            Total: p.Quantity * p.UnitPrice
        }));

        const invoiceData = {
            CustomerID: selectedCustomer.id,
            Details: invoiceDetails,
            Subtotal: products.reduce((sum, p) => sum + (p.Quantity * p.UnitPrice), 0),
            TaxRate: 0.19,
            Total: parseFloat(elements.totalAmount.textContent.replace('$', '')) // Obtener el total calculado
        };

        if (elements.detailsJson) {
            // Asigna los detalles serializados al campo oculto para que el servidor los reciba.
            elements.detailsJson.value = JSON.stringify(invoiceDetails);
        }

        console.log('📤 Enviando factura al servidor:', invoiceData);

        // =======================================================================
        // 🚀 CORRECCIÓN CLAVE: Descomentar esta línea para que el formulario POST se ejecute.
        // Se elimina el código de "Simulación: Limpiar después de enviar" para que el servidor
        // tome el control y muestre la factura o redireccione.
        // =======================================================================
        e.target.submit();
    });

    // ==================== NOTIFICACIONES (Resto del código se mantiene) ====================

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

    // Inicialización de estados
    disableAllCustomerInputs();
    disableAllProductInputs();
    checkFormCompletion();
    renderProductsTable();


    console.log('🎉 Sistema de facturación listo');
});