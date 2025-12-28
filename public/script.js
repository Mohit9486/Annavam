let cart = [];
let db = null;
let auth = null;

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWytx4Xb6gxKJ4K9JnVnjokdeWNkbKGK8",
  authDomain: "annavam-orders.firebaseapp.com",
  projectId: "annavam-orders",
  storageBucket: "annavam-orders.firebasestorage.app",
  messagingSenderId: "540890919012",
  appId: "1:540890919012:web:a99b732ca30fa8f6e46f71",
  measurementId: "G-XQMWZJ4ZJL"
};

// Initialize Firebase
function initializeFirebase() {
    try {
        // Check if Firebase config is provided
        if (!firebaseConfig.apiKey) {
            console.log('Firebase not configured yet - using localStorage as fallback');
            return;
        }
        
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        
        // Initialize Firestore
        db = firebase.firestore();
        
        // Initialize Auth
        auth = firebase.auth();
        
        console.log('Firebase initialized successfully');
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        showErrorMessage('Firebase initialization failed - using local storage');
    }
}

function addToCart(name, price, qtyId) {
    const qtyInput = document.getElementById(qtyId);
    const qty = parseFloat(qtyInput.value);
    
    if (!qty || qty <= 0) {
        alert('Please enter a valid quantity in kg (minimum 0.5 kg)');
        return;
    }
    
    // Check if item already exists in cart
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.qty += qty;
    } else {
        cart.push({ name, price, qty });
    }
    
    // Clear the input field
    qtyInput.value = '';
    
    // Show success feedback
    showSuccessMessage(`Added ${qty}kg of ${name} to cart!`);
    
    renderCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

function updateQuantity(index, newQty) {
    if (newQty <= 0) {
        removeFromCart(index);
        return;
    }
    cart[index].qty = parseFloat(newQty);
    renderCart();
}

function renderCart() {
    const cartElement = document.getElementById('cart');
    
    if (cart.length === 0) {
        cartElement.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty</p>
                <p>Add some delicious pedas to get started!</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="cart-items">';
    let total = 0;
    
    cart.forEach((item, index) => {
        const cost = item.price * item.qty;
        total += cost;
        html += `
            <div class="cart-item">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p class="item-price">₹${item.price} per kg</p>
                </div>
                <div class="quantity-controls">
                    <label>Quantity (kg):</label>
                    <div class="qty-input-group">
                        <button onclick="updateQuantity(${index}, ${item.qty - 0.5})" class="qty-btn">-</button>
                        <input type="number" value="${item.qty}" min="0.5" step="0.5" 
                               onchange="updateQuantity(${index}, this.value)" class="qty-input">
                        <button onclick="updateQuantity(${index}, ${item.qty + 0.5})" class="qty-btn">+</button>
                    </div>
                </div>
                <div class="item-total">
                    <strong>₹${cost.toLocaleString()}</strong>
                </div>
                <button onclick="removeFromCart(${index})" class="remove-btn">×</button>
            </div>
        `;
    });
    
    html += `</div>
    <div class="cart-summary">
        <div class="total-amount">
            <h3>Total: ₹${total.toLocaleString()}</h3>
        </div>
        <button onclick="showOrderForm()" class="place-order-btn">Place Order</button>
    </div>`;
    
    cartElement.innerHTML = html;
}

function showOrderForm() {
    const orderFormHtml = `
        <div class="order-form-overlay" id="orderFormOverlay">
            <div class="order-form">
                <h3>Complete Your Order</h3>
                <form id="orderDetailsForm">
                    <div class="form-group">
                        <label for="customerName">Full Name *</label>
                        <input type="text" id="customerName" required>
                    </div>
                    <div class="form-group">
                        <label for="customerWhatsapp">WhatsApp Number *</label>
                        <input type="tel" id="customerWhatsapp" required pattern="[0-9]{10}" placeholder="10-digit WhatsApp number">
                    </div>
                    <div class="form-group">
                        <label for="customerAddress">Delivery Address *</label>
                        <textarea id="customerAddress" required rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="deliveryDate">Preferred Delivery Date (minimum 3 days from today)</label>
                        <input type="date" id="deliveryDate" min="${getMinDeliveryDate()}" required>
                    </div>
                    <div class="form-group">
                        <label for="specialInstructions">Special Instructions</label>
                        <textarea id="specialInstructions" rows="2" placeholder="Any special requests..."></textarea>
                    </div>
                    <div class="order-summary-form">
                        <h4>Order Summary</h4>
                        ${getOrderSummaryHtml()}
                    </div>
                    <div class="form-buttons">
                        <button type="button" onclick="closeOrderForm()" class="cancel-btn">Cancel</button>
                        <button type="submit" class="pay-btn">Place Order</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', orderFormHtml);
    
    // Add form submit handler
    document.getElementById('orderDetailsForm').addEventListener('submit', handleOrderSubmit);
}

function closeOrderForm() {
    const overlay = document.getElementById('orderFormOverlay');
    if (overlay) {
        overlay.remove();
    }
}

function getOrderSummaryHtml() {
    let html = '<div class="summary-items">';
    let total = 0;
    
    cart.forEach(item => {
        const cost = item.price * item.qty;
        total += cost;
        html += `<div class="summary-item">${item.name} - ${item.qty}kg = ₹${cost.toLocaleString()}</div>`;
    });
    
    html += `</div><div class="summary-total"><strong>Total: ₹${total.toLocaleString()}</strong></div>`;
    return html;
}

function getMinDeliveryDate() {
    const today = new Date();
    today.setDate(today.getDate() + 3); // Add 3 days
    return today.toISOString().split('T')[0];
}

function handleOrderSubmit(e) {
    e.preventDefault();
    
    const orderData = {
        id: 'ORDER_' + Date.now(),
        name: document.getElementById('customerName').value,
        whatsapp: document.getElementById('customerWhatsapp').value,
        address: document.getElementById('customerAddress').value,
        deliveryDate: document.getElementById('deliveryDate').value,
        instructions: document.getElementById('specialInstructions').value,
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.qty), 0),
        orderDate: new Date().toISOString(),
        status: 'pending'
    };
    
    // Store order locally
    storeOrder(orderData);
    
    // Process order without payment
    handleOrderSuccess(orderData);
}

async function storeOrder(orderData) {
    try {
        if (db) {
            // Save to Firebase Firestore
            await saveOrderToFirestore(orderData);
            console.log('Order saved to Firebase successfully');
        } else {
            throw new Error('Firebase not initialized');
        }
        
        // Also keep in localStorage as backup
        let orders = JSON.parse(localStorage.getItem('annavamOrders') || '[]');
        orders.push(orderData);
        localStorage.setItem('annavamOrders', JSON.stringify(orders));
        
    } catch (error) {
        console.error('Error saving to Firebase:', error);
        showErrorMessage('Order saved locally, but failed to sync with Firebase');
        
        // Fallback to localStorage only
        let orders = JSON.parse(localStorage.getItem('annavamOrders') || '[]');
        orders.push(orderData);
        localStorage.setItem('annavamOrders', JSON.stringify(orders));
    }
}

async function saveOrderToFirestore(orderData) {
    if (!db) {
        throw new Error('Firebase not initialized');
    }
    
    try {
        // Save order to Firestore
        await db.collection('orders').doc(orderData.id).set({
            id: orderData.id,
            name: orderData.name,
            whatsapp: orderData.whatsapp,
            address: orderData.address,
            deliveryDate: orderData.deliveryDate,
            orderDate: orderData.orderDate,
            status: orderData.status,
            instructions: orderData.instructions || '',
            items: orderData.items,
            total: orderData.total,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return true;
    } catch (error) {
        console.error('Firestore save error:', error);
        throw error;
    }
}

function saveOrderToExcel(orderData) {
    // Create CSV content for the single order
    const csvContent = formatOrderForCSV(orderData);
    
    // Create filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `ANNAVAM_Order_${orderData.id}_${timestamp}.csv`;
    
    // Download the file
    downloadCSV(csvContent, filename);
}

function formatOrderForCSV(order) {
    // CSV headers
    let csv = 'Order ID,Customer Name,WhatsApp,Address,Delivery Date,Order Date,Status,Item Name,Quantity (kg),Price per kg,Item Total,Order Total,Instructions\n';
    
    // Add each item as a separate row
    order.items.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        csv += `"${order.id}","${order.name}","${order.whatsapp}","${order.address}","${order.deliveryDate}","${new Date(order.orderDate).toLocaleString()}","${order.status}","${item.name}","${item.qty}","${item.price}","${itemTotal}","${order.total}","${order.instructions || ''}"\n`;
    });
    
    return csv;
}

function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function handleOrderSuccess(orderData) {
    closeOrderForm();
    
    // Clear cart
    cart = [];
    renderCart();
    
    // Show success message
    showSuccessMessage('Order placed successfully! We will contact you on WhatsApp for payment confirmation.');
    
    // Show order confirmation
    showOrderConfirmation(orderData);
}

function showOrderConfirmation(orderData) {
    const confirmationHtml = `
        <div class="order-confirmation-overlay" id="orderConfirmation">
            <div class="order-confirmation">
                <div class="success-icon">✅</div>
                <h2>Order Confirmed!</h2>
                <p>Thank you for your order, ${orderData.name}!</p>
                <div class="order-details">
                    <h4>Order Details:</h4>
                    <p><strong>Order ID:</strong> ${orderData.id}</p>
                    <p><strong>Total Amount:</strong> ₹${orderData.total.toLocaleString()}</p>
                    <p><strong>Delivery Address:</strong> ${orderData.address}</p>
                    <p><strong>Delivery Date:</strong> ${orderData.deliveryDate}</p>
                    <p><strong>WhatsApp:</strong> ${orderData.whatsapp}</p>
                </div>
                <p>We'll contact you on WhatsApp at ${orderData.whatsapp} for payment and order confirmation.</p>
                <div class="whatsapp-info">
                    <p><strong>Next Steps:</strong></p>
                    <p>• We'll send you a WhatsApp message within 2 hours</p>
                    <p>• Payment can be made via UPI/Bank Transfer</p>
                    <p>• Order will be prepared after payment confirmation</p>
                </div>
                <button onclick="closeOrderConfirmation()" class="close-confirmation-btn">Continue Shopping</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', confirmationHtml);
}

function closeOrderConfirmation() {
    const confirmation = document.getElementById('orderConfirmation');
    if (confirmation) {
        confirmation.remove();
    }
}

function showSuccessMessage(message) {
    // Create a temporary success message
    const successDiv = document.createElement('div');
    successDiv.textContent = message;
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-weight: 500;
    `;
    
    document.body.appendChild(successDiv);
    
    // Remove the message after 3 seconds
    setTimeout(() => {
        if (document.body.contains(successDiv)) {
            document.body.removeChild(successDiv);
        }
    }, 3000);
}

function showErrorMessage(message) {
    // Create a temporary error message
    const errorDiv = document.createElement('div');
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-weight: 500;
    `;
    
    document.body.appendChild(errorDiv);
    
    // Remove the message after 4 seconds
    setTimeout(() => {
        if (document.body.contains(errorDiv)) {
            document.body.removeChild(errorDiv);
        }
    }, 4000);
}

// Admin functionality
function checkAdminAccess() {
    // Check if current URL contains admin path
    if (window.location.pathname.includes('/admin') || window.location.hash === '#admin') {
        showAdminLogin();
    }
}

function showAdminLogin() {
    const loginHtml = `
        <div class="admin-login-overlay" id="adminLoginOverlay">
            <div class="admin-login">
                <h2>Admin Login</h2>
                <form id="adminLoginForm">
                    <div class="form-group">
                        <label for="adminPassword">Password:</label>
                        <input type="password" id="adminPassword" required>
                    </div>
                    <div class="form-buttons">
                        <button type="button" onclick="closeAdminLogin()">Cancel</button>
                        <button type="submit">Login</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', loginHtml);
    
    document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const password = document.getElementById('adminPassword').value;
        
        // Simple password check for now
        // TODO: Replace with Firebase Authentication for better security
        if (password === 'annavam123') {
            closeAdminLogin();
            showAdminDashboard();
        } else {
            showErrorMessage('Invalid password!');
        }
    });
}

function closeAdminLogin() {
    const overlay = document.getElementById('adminLoginOverlay');
    if (overlay) {
        overlay.remove();
    }
}

async function showAdminDashboard() {
    // Show loading state
    showLoadingDashboard();
    
    try {
        if (db) {
            // Get orders from Firebase
            const orders = await loadOrdersFromFirestore();
            renderDashboard(orders);
        } else {
            throw new Error('Firebase not initialized');
        }
    } catch (error) {
        console.error('Error loading from Firebase:', error);
        showErrorMessage('Failed to load from Firebase, showing local data');
        
        // Fallback to localStorage
        const orders = JSON.parse(localStorage.getItem('annavamOrders') || '[]');
        renderDashboard(orders);
    }
}

async function loadOrdersFromFirestore() {
    if (!db) {
        throw new Error('Firebase not initialized');
    }
    
    try {
        // Get all orders from Firestore, ordered by creation date
        const snapshot = await db.collection('orders')
            .orderBy('createdAt', 'desc')
            .get();
        
        const orders = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            orders.push({
                id: data.id,
                name: data.name,
                whatsapp: data.whatsapp,
                address: data.address,
                deliveryDate: data.deliveryDate,
                orderDate: data.orderDate,
                status: data.status,
                instructions: data.instructions || '',
                items: data.items,
                total: data.total
            });
        });
        
        return orders;
    } catch (error) {
        console.error('Firestore load error:', error);
        throw error;
    }
}

function showLoadingDashboard() {
    const loadingHtml = `
        <div class="admin-dashboard-overlay" id="adminDashboard">
            <div class="admin-dashboard">
                <div class="dashboard-header">
                    <h2>Admin Dashboard</h2>
                    <button onclick="closeAdminDashboard()" class="close-btn">×</button>
                </div>
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Loading orders from Google Sheets...</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', loadingHtml);
}

function renderDashboard(orders) {
    // Close any existing dashboard
    closeAdminDashboard();
    
    let ordersHtml = '';
    if (orders.length === 0) {
        ordersHtml = '<p class="no-orders">No orders found.</p>';
    } else {
        ordersHtml = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <h4>Order ID: ${order.id}</h4>
                    <span class="order-status status-${order.status}">${order.status.toUpperCase()}</span>
                </div>
                <div class="order-info">
                    <p><strong>Customer:</strong> ${order.name}</p>
                    <p><strong>WhatsApp:</strong> ${order.whatsapp}</p>
                    <p><strong>Address:</strong> ${order.address}</p>
                    <p><strong>Delivery Date:</strong> ${order.deliveryDate}</p>
                    <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
                    ${order.instructions ? `<p><strong>Instructions:</strong> ${order.instructions}</p>` : ''}
                </div>
                <div class="order-items">
                    <h5>Items:</h5>
                    ${order.items.map(item => `
                        <div class="order-item">
                            ${item.name} - ${item.qty}kg = ₹${(item.price * item.qty).toLocaleString()}
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">
                    <strong>Total: ₹${order.total.toLocaleString()}</strong>
                </div>
                <div class="order-actions">
                    <button onclick="updateOrderStatus('${order.id}', 'confirmed')" class="btn-confirm">Mark Confirmed</button>
                    <button onclick="updateOrderStatus('${order.id}', 'delivered')" class="btn-delivered">Mark Delivered</button>
                    <button onclick="deleteOrder('${order.id}')" class="btn-delete">Delete</button>
                </div>
            </div>
        `).join('');
    }
    
    const dashboardHtml = `
        <div class="admin-dashboard-overlay" id="adminDashboard">
            <div class="admin-dashboard">
                <div class="dashboard-header">
                    <h2>Admin Dashboard</h2>
                    <button onclick="closeAdminDashboard()" class="close-btn">×</button>
                </div>
                <div class="dashboard-stats">
                    <div class="stat-card">
                        <h3>${orders.length}</h3>
                        <p>Total Orders</p>
                    </div>
                    <div class="stat-card">
                        <h3>${orders.filter(o => o.status === 'pending').length}</h3>
                        <p>Pending Orders</p>
                    </div>
                    <div class="stat-card">
                        <h3>₹${orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}</h3>
                        <p>Total Revenue</p>
                    </div>
                </div>
                <div class="orders-section">
                    <div class="orders-header">
                        <h3>All Orders</h3>
                        <button onclick="exportAllOrdersToExcel()" class="export-btn">📊 Export to Excel</button>
                    </div>
                    <div class="orders-list">
                        ${ordersHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', dashboardHtml);
}

function closeAdminDashboard() {
    const dashboard = document.getElementById('adminDashboard');
    if (dashboard) {
        dashboard.remove();
    }
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        if (db) {
            // Update in Firebase
            await updateOrderStatusInFirestore(orderId, newStatus);
        } else {
            throw new Error('Firebase not initialized');
        }
        
        // Also update localStorage as backup
        let orders = JSON.parse(localStorage.getItem('annavamOrders') || '[]');
        const orderIndex = orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
            orders[orderIndex].status = newStatus;
            localStorage.setItem('annavamOrders', JSON.stringify(orders));
        }
        
        // Refresh dashboard
        closeAdminDashboard();
        showAdminDashboard();
        
        showSuccessMessage(`Order ${orderId} marked as ${newStatus}`);
    } catch (error) {
        console.error('Error updating status in Firebase:', error);
        showErrorMessage('Failed to update status in Firebase');
    }
}

async function updateOrderStatusInFirestore(orderId, newStatus) {
    if (!db) {
        throw new Error('Firebase not initialized');
    }
    
    try {
        // Update the order status in Firestore
        await db.collection('orders').doc(orderId).update({
            status: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return true;
    } catch (error) {
        console.error('Firestore update error:', error);
        throw error;
    }
}

async function deleteOrder(orderId) {
    // Enhanced confirmation dialog
    const confirmDelete = confirm(
        `⚠️ PERMANENT DELETE WARNING ⚠️\n\n` +
        `Are you sure you want to PERMANENTLY delete order ${orderId}?\n\n` +
        `This will:\n` +
        `• Remove the order from Firebase database\n` +
        `• Delete all order data permanently\n` +
        `• This action CANNOT be undone\n\n` +
        `Type "DELETE" in the next prompt to confirm.`
    );
    
    if (!confirmDelete) {
        return;
    }
    
    // Second confirmation requiring typing "DELETE"
    const confirmText = prompt(
        `To confirm permanent deletion of order ${orderId}, please type "DELETE" (in capital letters):`
    );
    
    if (confirmText !== 'DELETE') {
        showErrorMessage('Deletion cancelled. You must type "DELETE" exactly to confirm.');
        return;
    }
    
    try {
        // Show loading message
        showSuccessMessage('Deleting order from Firebase...');
        
        if (db) {
            // Delete from Firebase
            await deleteOrderFromFirestore(orderId);
        } else {
            throw new Error('Firebase not initialized');
        }
        
        // Also delete from localStorage
        let orders = JSON.parse(localStorage.getItem('annavamOrders') || '[]');
        orders = orders.filter(order => order.id !== orderId);
        localStorage.setItem('annavamOrders', JSON.stringify(orders));
        
        // Refresh dashboard
        closeAdminDashboard();
        showAdminDashboard();
        
        showSuccessMessage(`Order ${orderId} permanently deleted from Firebase and local storage`);
    } catch (error) {
        console.error('Error deleting from Firebase:', error);
        showErrorMessage('Failed to delete from Firebase. Order may still exist in the database.');
    }
}

async function deleteOrderFromFirestore(orderId) {
    if (!db) {
        throw new Error('Firebase not initialized');
    }
    
    try {
        // Delete the order document from Firestore
        await db.collection('orders').doc(orderId).delete();
        return true;
    } catch (error) {
        console.error('Firestore delete error:', error);
        throw error;
    }
}

function exportAllOrdersToExcel() {
    const orders = JSON.parse(localStorage.getItem('annavamOrders') || '[]');
    
    if (orders.length === 0) {
        showErrorMessage('No orders to export!');
        return;
    }
    
    // Create CSV content for all orders
    let csv = 'Order ID,Customer Name,WhatsApp,Address,Delivery Date,Order Date,Status,Item Name,Quantity (kg),Price per kg,Item Total,Order Total,Instructions\n';
    
    orders.forEach(order => {
        order.items.forEach(item => {
            const itemTotal = item.price * item.qty;
            csv += `"${order.id}","${order.name}","${order.whatsapp}","${order.address}","${order.deliveryDate}","${new Date(order.orderDate).toLocaleString()}","${order.status}","${item.name}","${item.qty}","${item.price}","${itemTotal}","${order.total}","${order.instructions || ''}"\n`;
        });
    });
    
    // Create filename with current date
    const today = new Date().toISOString().slice(0, 10);
    const filename = `ANNAVAM_All_Orders_${today}.csv`;
    
    // Download the file
    downloadCSV(csv, filename);
    
    showSuccessMessage(`Exported ${orders.length} orders to Excel!`);
}

// Initialize cart display and check for admin access
document.addEventListener('DOMContentLoaded', function() {
    renderCart();
    checkAdminAccess();
    initializeFirebase();
    initializeFAQs();
});

// Initialize FAQs as collapsed
function initializeFAQs() {
    const faqAnswers = document.querySelectorAll('.faq-answer');
    faqAnswers.forEach(answer => {
        answer.style.display = 'none';
    });
}

// Add admin access via URL hash
window.addEventListener('hashchange', function() {
    if (window.location.hash === '#admin') {
        showAdminLogin();
    }
});

// FAQ Toggle Functionality
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const faqAnswer = faqItem.querySelector('.faq-answer');
    const faqToggle = element.querySelector('.faq-toggle');
    
    if (faqAnswer.style.display === 'none' || faqAnswer.style.display === '') {
        faqAnswer.style.display = 'block';
        faqToggle.textContent = '−';
        faqItem.classList.add('active');
    } else {
        faqAnswer.style.display = 'none';
        faqToggle.textContent = '+';
        faqItem.classList.remove('active');
    }
}

// Price Info Popup
function showPriceInfo() {
    alert('*Preparation and craft fee - An enabling fee that covers preparation, craftsmanship and ingredients of our handcrafted Pedas.');
}

// Buy Now Functionality
function buyNow(name, price, qtyId) {
    const qty = parseFloat(document.getElementById(qtyId).value);
    
    if (!qty || qty < 0.5) {
        showErrorMessage('Please enter a valid quantity (minimum 0.5 kg)');
        return;
    }
    
    // Clear cart and add this item
    cart = [];
    addToCart(name, price, qtyId);
    
    // Scroll to order section
    document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
    
    showSuccessMessage(`${name} added to cart! Complete your order below.`);
}