// YOUR APPS SCRIPT URL HERE
    const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbweNbE_UnRStY4bKt7UodsbrBkFYzKADdw69PnqSVAS61JXJPaIMTPf8y7y1g4HM-1d/exec';
    
    let carInventory = [];

    window.onload = function() {
    // Initialize dark mode
    initializeDarkMode();
    
    loadCarInventory(function() {
        loadDeliveries();
    });
    document.getElementById('filterSelect').addEventListener('change', loadDeliveries);
    };

    function loadCarInventory(callback) {
    fetch(`${BACKEND_URL}?action=getCarInventory`)
        .then(response => response.json())
        .then(cars => {
        carInventory = cars;
        console.log('Car inventory loaded:', carInventory);
        if (callback) callback();
        })
        .catch(error => {
        console.error('Error loading car inventory:', error);
        if (callback) callback();
        });
    }

    function loadDeliveries() {
    const filter = document.getElementById('filterSelect').value;

    document.getElementById('deliveries-container').innerHTML = `
        <div class="loading">
        <div class="spinner"></div>
        <div>Cargando entregas...</div>
        </div>
    `;
    
    fetch(`${BACKEND_URL}?action=getDeliveries&filter=${filter}`)
        .then(response => response.json())
        .then(deliveries => displayDeliveries(deliveries))
        .catch(error => showError(error));
    }

    function displayDeliveries(deliveries) {
    const container = document.getElementById('deliveries-container');
    
    if (!deliveries || deliveries.length === 0) {
        container.innerHTML = `
        <div class="empty-state">
            <div class="icon">📭</div>
            <h2>No hay entregas</h2>
            <p>Disfruta tu día libre!</p>
        </div>
        `;
        return;
    }
    
    container.innerHTML = deliveries.map(delivery => `
        <div class="delivery-card">
        <div class="main-label">
            <span class="icon">🚗</span>
            <span class="label">Vehículo:</span>
            <span>
            <select class="car-dropdown" 
                data-row-index="${delivery.rowIndex}" 
                onchange="handleCarChange(this)">
                <option value="">Sin asignar</option>
                ${carInventory.map(car => 
                `<option value="${car}" ${delivery.car === car ? 'selected' : ''}>${car}</option>`
                ).join('')}
            </select>
            </span>
        </div>

        <div class="info-row">
            <span class="icon">🗓️</span>
            <span class="label">Entrega:</span>
            <span>${delivery.deliveryDate}</span>
        </div>
        
        <div class="info-row">
            <span class="icon">👤</span>
            <span class="label">Cliente:</span>
            <span>${delivery.customer || 'N/A'}</span>
        </div>

        <div class="info-row">
            <span class="icon">☎️</span>
            <span class="label">Número:</span>
            <span>
            ${delivery.phone ? 
                `<a href="https://wa.me/${delivery.phone.replace(/\D/g, '')}" 
                target="_blank" 
                class="whatsapp-link">
                ${delivery.phone}
                </a>` 
                : 'N/A'}
            </span>
        </div>
        ${delivery.flight ? `
        <div class="info-row">
            <span class="icon">✈️</span>
            <span class="label">Vuelo:</span>
            <span>${delivery.flight}</span>
        </div>` : ''}
        
        <div class="info-row">
            <span class="icon">🕐</span>
            <span class="label">Entrega:</span>
            <span>${delivery.arrivalTime} en <strong>${delivery.arrivalPlace}</strong></span>
        </div>

        <div class="info-row">
            <span class="icon">↩️</span>
            <span class="label">Devolución:</span>
            <span>${delivery.returnTime} en <strong>${delivery.returnPlace}</strong></span>
        </div>
        
        ${delivery.notes ? `
        <div class="info-row">
            <span class="icon">📝</span>
            <span class="label">Notas:</span>
            <span>${delivery.notes}</span>
        </div>
        ` : ''}
        </div>
    `).join('');
    }

    function handleCarChange(selectElement) {
    const rowIndex = parseInt(selectElement.getAttribute('data-row-index'));
    const newCar = selectElement.value;
    
    selectElement.disabled = true;
    
    fetch(`${BACKEND_URL}?action=updateCarAssignment&rowIndex=${rowIndex}&newCar=${encodeURIComponent(newCar)}`)
        .then(response => response.json())
        .then(result => {
        selectElement.disabled = false;
        if (result.success) {
            showToast('✅ Vehículo actualizado');
        } else {
            showToast('❌ Error al actualizar');
        }
        })
        .catch(error => {
        selectElement.disabled = false;
        showToast('❌ Error al actualizar');
        });
    }

    function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
    }
    
    function getStatusClass(status) {
    if (status.toLowerCase().includes('landed') || status.toLowerCase().includes('arrived')) {
        return 'status-landed';
    } else if (status.toLowerCase().includes('delayed') || status.toLowerCase().includes('late')) {
        return 'status-delayed';
    } else {
        return 'status-active';
    }
    }
    
    function showError(error) {
    document.getElementById('deliveries-container').innerHTML = `
        <div class="empty-state">
        <div class="icon">⚠️</div>
        <h2>Error al cargar</h2>
        <p>${error.message || 'Error desconocido'}</p>
        </div>
    `;
    }
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
        .then(registration => {
            console.log('Service Worker registered successfully:', registration.scope);
        })
        .catch(error => {
            console.log('Service Worker registration failed:', error);
        });
    });

    // Dark Mode functionality
    function initializeDarkMode() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        const body = document.body;
        
        // Check for saved dark mode preference
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        
        if (isDarkMode) {
            body.classList.add('dark-mode');
            darkModeToggle.textContent = '☀️';
        }
        
        // Toggle dark mode on button click
        darkModeToggle.addEventListener('click', function() {
            body.classList.toggle('dark-mode');
            const isNowDark = body.classList.contains('dark-mode');
            
            // Save preference
            localStorage.setItem('darkMode', isNowDark);
            
            // Update button icon
            darkModeToggle.textContent = isNowDark ? '☀️' : '🌙';
            
            // Add a subtle animation feedback
            darkModeToggle.style.transform = 'rotate(360deg) scale(1.1)';
            setTimeout(() => {
                darkModeToggle.style.transform = '';
            }, 300);
        });
    }
}