// ================================================================
// SISTEMA DE FACTURACIÓN - BÚSQUEDA INTELIGENTE Y DINÁMICA
// ================================================================

document.addEventListener('DOMContentLoaded', () => {
    const apiBase = '/api/lookup';

    // ============ ELEMENTOS DEL DOM ============
    const prodSearch = document.getElementById('prodSearch');
    const prodName = document.getElementById('prodName');
    const prodPrice = document.getElementById('prodPrice');
    const prodStock = document.getElementById('prodStock');
    const prodQty = document.getElementById('prodQty');
    const btnAdd = document.getElementById('btnAdd');
    const tbody = document.querySelector('#detailsTable tbody');
    const spanSubtotal = document.getElementById('spanSubtotal');
    const spanTax = document.getElementById('spanTax');
    const spanTotal = document.getElementById('spanTotal');
    const detailsJson = document.getElementById('detailsJson');
    const form = document.getElementById('invoiceForm');

    // Elementos del modal de clientes
    const custQ = document.getElementById('custQ');
    const custResults = document.getElementById('custResults');
    const CustomerID = document.getElementById('CustomerID');
    const FirstName = document.getElementById('FirstName');
    const LastName = document.getElementById('LastName');
    const Email = document.getElementById('Email');

    let details = []; // Array de productos agregados
    let selectedProduct = null; // Producto actualmente seleccionado
    let searchTimer; // Timer para debounce
    let custTimer; // Timer para búsqueda de clientes

    // ============ BÚSQUEDA DE PRODUCTOS ============

    prodSearch?.addEventListener('input', (e) => {
        clearTimeout(searchTimer);
        const q = e.target.value.trim();

        if (!q) {
            clearProductFields();
            return;
        }

        searchTimer = setTimeout(async () => {
            try {
                const res = await fetch(`${apiBase}/products?q=${encodeURIComponent(q)}&pageSize=10`);
                const data = await res.json();

                if (data.items && data.items.length > 0) {
                    if (data.items.length === 1) {
                        // Si solo hay un resultado, seleccionarlo automáticamente
                        setSelectedProduct(data.items[0]);
                    } else {
                        // Si hay múltiples resultados, mostrar modal de selección
                        showProductSelectionModal(data.items);
                    }
                } else {
                    clearProductFields();
                    showNotification('No se encontraron productos', 'warning');
                }
            } catch (error) {
                console.error('Error buscando productos:', error);
                showNotification('Error al buscar productos', 'error');
            }
        }, 300);
    });

    function setSelectedProduct(product) {
        selectedProduct = {
            ProductID: product.ProductID,
            ProductCode: product.ProductCode,
            ProductName: product.ProductName,
            Price: product.Price,
            Stock: product.Stock
        };

        prodSearch.value = product.ProductCode;
        prodName.value = product.ProductName;
        prodPrice.value = `$${Number(product.Price).toFixed(2)}`;
        prodStock.value = product.Stock;
        prodQty.value = 1;
        prodQty.max = product.Stock;
        prodQty.focus();
    }

    function clearProductFields() {
        selectedProduct = null;
        prodName.value = '';
        prodPrice.value = '';
        prodStock.value = '';
        prodQty.value = 1;
    }

    function showProductSelectionModal(products) {
        let html = '<div class="list-group">';
        products.forEach(p => {
            html += `
                <button type="button" class="list-group-item list-group-item-action" onclick="selectProductFromList(${p.ProductID})">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">${p.ProductName}</h6>
                        <span class="badge bg-primary rounded-pill">${p.ProductCode}</span>
                    </div>
                    <div class="d-flex justify-content-between mt-2">
                        <small class="text-muted">Precio: $${p.Price.toFixed(2)}</small>
                        <small class="text-muted">Stock: ${p.Stock}</small>
                    </div>
                </button>
            `;
        });
        html += '</div>';

        // Crear modal dinámico
        const modalHtml = `
            <div class="modal fade" id="productModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">Seleccionar Producto</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">${html}</div>
                    </div>
                </div>
            </div>
        `;

        // Eliminar modal anterior si existe
        document.getElementById('productModal')?.remove();

        // Agregar y mostrar nuevo modal
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
    }

    // Función global para seleccionar producto desde el modal
    window.selectProductFromList = async function (productId) {
        try {
            const res = await fetch(`${apiBase}/product/${productId}`);
            const product = await res.json();
            setSelectedProduct(product);

            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
            modal?.hide();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // ============ AGREGAR PRODUCTO A LA FACTURA ============

    btnAdd?.addEventListener('click', () => {
        if (!selectedProduct) {
            showNotification('Selecciona un producto válido', 'warning');
            return;
        }

        const qty = parseInt(prodQty.value) || 0;

        if (qty <= 0) {
            showNotification('La cantidad debe ser mayor que 0', 'warning');
            return;
        }

        if (qty > selectedProduct.Stock) {
            showNotification(`Stock insuficiente. Disponible: ${selectedProduct.Stock}`, 'error');
            return;
        }

        // Verificar si el producto ya existe en la tabla
        const existing = details.find(d => d.ProductID === selectedProduct.ProductID);

        if (existing) {
            const newQty = existing.Quantity + qty;
            if (newQty > selectedProduct.Stock) {
                showNotification('La cantidad total supera el stock disponible', 'error');
                return;
            }
            existing.Quantity = newQty;
        } else {
            details.push({
                ProductID: selectedProduct.ProductID,
                ProductCode: selectedProduct.ProductCode,
                ProductName: selectedProduct.ProductName,
                Quantity: qty,
                UnitPrice: selectedProduct.Price,
                Stock: selectedProduct.Stock
            });
        }

        renderDetails();
        clearProductFields();
        prodSearch.value = '';
        prodSearch.focus();
        showNotification('Producto agregado correctamente', 'success');
    });

    // ============ RENDERIZAR TABLA DE DETALLES ============

    function renderDetails() {
        tbody.innerHTML = '';

        details.forEach((d, index) => {
            const total = d.Quantity * d.UnitPrice;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${d.ProductCode}</strong></td>
                <td>${d.ProductName}</td>
                <td class="text-center">${d.Quantity}</td>
                <td class="text-end">$${d.UnitPrice.toFixed(2)}</td>
                <td class="text-end"><strong>$${total.toFixed(2)}</strong></td>
                <td class="text-center">
                    <button type="button" class="btn btn-sm btn-danger btn-remove" data-index="${index}">
                        <i class="bi bi-trash"></i> Quitar
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Agregar eventos a botones de eliminar
        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                removeDetail(index);
            });
        });

        updateTotals();
        detailsJson.value = JSON.stringify(details);
    }

    function removeDetail(index) {
        const product = details[index];
        details.splice(index, 1);
        renderDetails();
        showNotification(`${product.ProductName} eliminado`, 'info');
    }

    // ============ CALCULAR TOTALES ============

    function updateTotals() {
        const subtotal = details.reduce((sum, d) => sum + (d.Quantity * d.UnitPrice), 0);
        const tax = subtotal * 0.19;
        const total = subtotal + tax;

        spanSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        spanTax.textContent = `$${tax.toFixed(2)}`;
        spanTotal.textContent = `$${total.toFixed(2)}`;
    }

    // ============ BÚSQUEDA DE CLIENTES ============

    custQ?.addEventListener('input', (e) => {
        clearTimeout(custTimer);
        const q = e.target.value.trim();

        if (!q) {
            custResults.innerHTML = '<p class="text-muted">Escribe para buscar clientes...</p>';
            return;
        }

        custTimer = setTimeout(async () => {
            try {
                const res = await fetch(`${apiBase}/customers?q=${encodeURIComponent(q)}&pageSize=10`);
                const data = await res.json();
                renderCustomerResults(data.items || []);
            } catch (error) {
                console.error('Error:', error);
                custResults.innerHTML = '<p class="text-danger">Error al buscar clientes</p>';
            }
        }, 300);
    });

    function renderCustomerResults(customers) {
        custResults.innerHTML = '';

        if (!customers.length) {
            custResults.innerHTML = '<p class="text-warning">No se encontraron clientes</p>';
            return;
        }

        const list = document.createElement('div');
        list.className = 'list-group';

        customers.forEach(c => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'list-group-item list-group-item-action';
            button.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${c.FirstName} ${c.LastName}</h6>
                    <small class="text-muted">ID: ${c.CustomerID}</small>
                </div>
                <small class="text-muted">${c.Email}</small>
            `;

            button.addEventListener('click', () => selectCustomer(c));
            list.appendChild(button);
        });

        custResults.appendChild(list);
    }

    function selectCustomer(customer) {
        CustomerID.value = customer.CustomerID;
        FirstName.value = customer.FirstName;
        LastName.value = customer.LastName;
        Email.value = customer.Email;

        // Cerrar modal
        const modalEl = document.getElementById('customerModal');
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        bsModal?.hide();

        // Limpiar búsqueda
        custQ.value = '';
        custResults.innerHTML = '';

        showNotification('Cliente seleccionado correctamente', 'success');
    }

    // ============ VALIDACIÓN Y ENVÍO DEL FORMULARIO ============

    form?.addEventListener('submit', (e) => {
        if (!CustomerID.value) {
            e.preventDefault();
            showNotification('Debes seleccionar un cliente', 'error');
            return;
        }

        if (details.length === 0) {
            e.preventDefault();
            showNotification('Debes agregar al menos un producto', 'error');
            return;
        }

        // El formulario se enviará normalmente con los datos
        console.log('Factura enviada:', { customer: CustomerID.value, details });
    });

    // ============ NOTIFICACIONES ============

    function showNotification(message, type = 'info') {
        const alertTypes = {
            'success': 'alert-success',
            'error': 'alert-danger',
            'warning': 'alert-warning',
            'info': 'alert-info'
        };

        const alert = document.createElement('div');
        alert.className = `alert ${alertTypes[type]} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
        alert.style.zIndex = '9999';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alert);

        setTimeout(() => {
            alert.remove();
        }, 3000);
    }
});