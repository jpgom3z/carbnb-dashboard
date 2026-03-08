    const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbweNbE_UnRStY4bKt7UodsbrBkFYzKADdw69PnqSVAS61JXJPaIMTPf8y7y1g4HM-1d/exec';
    
    let carInventory = [];
    let activeTab = 'deliveries';

    window.onload = function() {
    if (!auth.isAuthenticated()) {
        auth.showLoginScreen();
        return;
    }

    // Initialize dark mode only for authenticated users
    initializeDarkMode();

    loadCarInventory(function() {
        loadData();
    });
    document.getElementById('filterSelect').addEventListener('change', loadData);
    };

    function switchTab(tab) {
    activeTab = tab;
    document.getElementById('tab-deliveries').classList.toggle('active', tab === 'deliveries');
    document.getElementById('tab-returns').classList.toggle('active', tab === 'returns');
    loadData();
    }

    function loadCarInventory(callback) {
    fetch(`${BACKEND_URL}?action=getCarInventory&apiKey=${encodeURIComponent(auth.getApiKey())}`)
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

    function loadData() {
    const filter = document.getElementById('filterSelect').value;
    const action = activeTab === 'deliveries' ? 'getDeliveries' : 'getReturns';
    const loadingText = activeTab === 'deliveries' ? 'Cargando entregas...' : 'Cargando devoluciones...';

    document.getElementById('deliveries-container').innerHTML = `
        <div class="loading">
        <div class="spinner"></div>
        <div>${loadingText}</div>
        </div>
    `;

    fetch(`${BACKEND_URL}?action=${action}&filter=${filter}&apiKey=${encodeURIComponent(auth.getApiKey())}`)
        .then(response => response.json())
        .then(data => activeTab === 'deliveries' ? displayDeliveries(data) : displayReturns(data))
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
            <span class="label">Día Entrega:</span>
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
            <span class="label">Hora Entrega:</span>
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

    function displayReturns(returns) {
    const container = document.getElementById('deliveries-container');

    if (!returns || returns.length === 0) {
        container.innerHTML = `
        <div class="empty-state">
            <div class="icon">📭</div>
            <h2>No hay devoluciones</h2>
            <p>Disfruta tu día libre!</p>
        </div>
        `;
        return;
    }

    container.innerHTML = returns.map(r => `
        <div class="delivery-card return-card">
        <div class="main-label">
            <span class="icon">🚗</span>
            <span class="label">Vehículo:</span>
            <span>${r.car || 'Sin asignar'}</span>
        </div>

        <div class="info-row">
            <span class="icon">↩️</span>
            <span class="label">Devolución:</span>
            <span>${r.returnDateTime} en <strong>${r.returnPlace}</strong></span>
        </div>

        <div class="info-row">
            <span class="icon">👤</span>
            <span class="label">Cliente:</span>
            <span>${r.customer || 'N/A'}</span>
        </div>

        <div class="info-row">
            <span class="icon">☎️</span>
            <span class="label">Número:</span>
            <span>
            ${r.phone ?
                `<a href="https://wa.me/${r.phone.replace(/\D/g, '')}"
                target="_blank"
                class="whatsapp-link">
                ${r.phone}
                </a>`
                : 'N/A'}
            </span>
        </div>

        ${r.notes ? `
        <div class="info-row">
            <span class="icon">📝</span>
            <span class="label">Notas:</span>
            <span>${r.notes}</span>
        </div>
        ` : ''}
        </div>
    `).join('');
    }

    function handleCarChange(selectElement) {
    const rowIndex = parseInt(selectElement.getAttribute('data-row-index'));
    const newCar = selectElement.value;
    
    selectElement.disabled = true;
    
    fetch(`${BACKEND_URL}?action=updateCarAssignment&rowIndex=${rowIndex}&newCar=${encodeURIComponent(newCar)}&apiKey=${encodeURIComponent(auth.getApiKey())}`)
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