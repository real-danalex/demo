/* ============================================
   COUNTRYFRESH BAKERY - CART FUNCTIONALITY
   ============================================ */

'use strict';

// ============================================
// 1. CART CLASS
// ============================================

class ShoppingCart {
    constructor() {
        this.items = [];
        this.total = 0;
        this.deliveryFee = 500;
        this.freeDeliveryThreshold = 5000;
        
        this.init();
    }
    
    init() {
        console.log('Shopping Cart initialized');
        
        // Initialize quantity controls
        this.initQuantityControls();
        
        // Initialize add to cart forms
        this.initAddToCartForms();
        
        // Initialize remove buttons
        this.initRemoveButtons();
        
        // Update cart display
        this.updateCartDisplay();
        
        // Update cart count
        this.updateCartCount();
    }
    
    // ============================================
    // 2. QUANTITY CONTROLS
    // ============================================
    
    initQuantityControls() {
        // Plus buttons
        document.querySelectorAll('.qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', function() {
                const input = this.closest('.quantity-control, .quantity-selector')
                    .querySelector('.qty-input, input[name="quantity"]');
                let value = parseInt(input.value) || 1;
                if (value < 99) {
                    input.value = value + 1;
                    input.dispatchEvent(new Event('change'));
                }
            });
        });
        
        // Minus buttons
        document.querySelectorAll('.qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', function() {
                const input = this.closest('.quantity-control, .quantity-selector')
                    .querySelector('.qty-input, input[name="quantity"]');
                let value = parseInt(input.value) || 1;
                if (value > 1) {
                    input.value = value - 1;
                    input.dispatchEvent(new Event('change'));
                }
            });
        });
        
        // Direct input validation
        document.querySelectorAll('.qty-input, input[name="quantity"]').forEach(input => {
            input.addEventListener('change', function() {
                let value = parseInt(this.value) || 1;
                if (value < 1) value = 1;
                if (value > 99) value = 99;
                this.value = value;
            });
            
            // Prevent non-numeric input
            input.addEventListener('keypress', function(e) {
                if (e.key && !/[0-9]/.test(e.key)) {
                    e.preventDefault();
                }
            });
        });
    }
    
    // ============================================
    // 3. ADD TO CART
    // ============================================
    
    initAddToCartForms() {
        document.querySelectorAll('.add-to-cart-form').forEach(form => {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const btn = this.querySelector('.btn-cart');
                const originalHtml = btn.innerHTML;
                
                // Show loading state
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
                btn.disabled = true;
                
                try {
                    // Submit form
                    const formData = new FormData(this);
                    const response = await fetch(this.action, {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (response.ok) {
                        // Show success
                        btn.innerHTML = '<i class="fas fa-check"></i> Added!';
                        btn.style.backgroundColor = '#28a745';
                        
                        // Update cart count
                        updateCartCount();
                        
                        // Show notification
                        const productName = this.closest('.product-card, .product-info-section')
                            ?.querySelector('.product-name')?.textContent || 'Product';
                        showNotification(`${productName} added to cart!`, 'success');
                        
                        // Reset button after 2 seconds
                        setTimeout(() => {
                            btn.innerHTML = originalHtml;
                            btn.style.backgroundColor = '';
                            btn.disabled = false;
                        }, 2000);
                    } else {
                        throw new Error('Failed to add to cart');
                    }
                } catch (error) {
                    console.error('Add to cart error:', error);
                    btn.innerHTML = '<i class="fas fa-times"></i> Error';
                    btn.style.backgroundColor = '#dc3545';
                    
                    showNotification('Failed to add to cart. Please try again.', 'error');
                    
                    setTimeout(() => {
                        btn.innerHTML = originalHtml;
                        btn.style.backgroundColor = '';
                        btn.disabled = false;
                    }, 2000);
                }
            });
        });
    }
    
    // ============================================
    // 4. REMOVE FROM CART
    // ============================================
    
    initRemoveButtons() {
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const cartItem = this.closest('.cart-item');
                const productName = cartItem.querySelector('.item-name')?.textContent || 'item';
                
                if (confirm(`Remove ${productName} from cart?`)) {
                    // Show loading
                    cartItem.style.opacity = '0.5';
                    
                    // Navigate to remove URL
                    window.location.href = this.href;
                }
            });
        });
    }
    
    // ============================================
    // 5. UPDATE CART DISPLAY
    // ============================================
    
    updateCartDisplay() {
        // Update subtotals
        const cartItems = document.querySelectorAll('.cart-item');
        let subtotal = 0;
        
        cartItems.forEach(item => {
            const priceText = item.querySelector('.item-price')?.textContent;
            const quantityInput = item.querySelector('.qty-input');
            const subtotalElement = item.querySelector('.subtotal-amount');
            
            if (priceText && quantityInput && subtotalElement) {
                const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
                const quantity = parseInt(quantityInput.value) || 1;
                const itemSubtotal = price * quantity;
                
                subtotalElement.textContent = `₦${itemSubtotal.toFixed(2)}`;
                subtotal += itemSubtotal;
            }
        });
        
        // Update order summary
        this.updateOrderSummary(subtotal);
    }
    
    updateOrderSummary(subtotal) {
        const subtotalElement = document.querySelector('.summary-row:first-child span:last-child');
        const deliveryElement = document.querySelector('.summary-row:nth-child(2) span:last-child');
        const totalElement = document.querySelector('.total-amount');
        
        if (subtotalElement) {
            subtotalElement.textContent = `₦${subtotal.toFixed(2)}`;
        }
        
        // Calculate delivery fee
        let delivery = subtotal >= this.freeDeliveryThreshold ? 0 : this.deliveryFee;
        
        if (deliveryElement) {
            if (delivery === 0) {
                deliveryElement.innerHTML = '<span class="free-delivery">FREE</span>';
            } else {
                deliveryElement.textContent = `₦${delivery.toFixed(2)}`;
            }
        }
        
        // Calculate total
        const total = subtotal + delivery;
        if (totalElement) {
            totalElement.textContent = `₦${total.toFixed(2)}`;
        }
        
        // Update free delivery notice
        if (subtotal < this.freeDeliveryThreshold) {
            const remaining = this.freeDeliveryThreshold - subtotal;
            const noticeElement = document.querySelector('.delivery-notice');
            if (noticeElement) {
                noticeElement.innerHTML = `
                    <i class="fas fa-info-circle"></i>
                    Add ₦${remaining.toFixed(2)} more for free delivery!
                `;
            }
        }
    }
    
    // ============================================
    // 6. UPDATE CART COUNT
    // ============================================
    
    updateCartCount() {
        fetch('/api/cart-count')
            .then(response => response.json())
            .then(data => {
                const cartCountElement = document.getElementById('cartCount');
                if (cartCountElement) {
                    cartCountElement.textContent = data.count;
                    
                    if (data.count > 0) {
                        cartCountElement.style.display = 'flex';
                        
                        // Animate count update
                        cartCountElement.style.animation = 'pulse 0.3s ease';
                        setTimeout(() => {
                            cartCountElement.style.animation = '';
                        }, 300);
                    } else {
                        cartCountElement.style.display = 'none';
                    }
                }
            })
            .catch(error => {
                console.error('Error updating cart count:', error);
            });
    }
    
    // ============================================
    // 7. QUICK ADD TO CART (for product cards)
    // ============================================
    
    quickAddToCart(productId, quantity = 1) {
        const formData = new FormData();
        formData.append('quantity', quantity);
        
        fetch(`/add-to-cart/${productId}`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                this.updateCartCount();
                showNotification('Product added to cart!', 'success');
            } else {
                throw new Error('Failed to add to cart');
            }
        })
        .catch(error => {
            console.error('Quick add error:', error);
            showNotification('Failed to add to cart', 'error');
        });
    }
}

// ============================================
// 8. CART AUTO-UPDATE (for cart page)
// ============================================

class CartAutoUpdate {
    constructor() {
        this.updateTimeout = null;
        this.init();
    }
    
    init() {
        // Listen for quantity changes
        document.querySelectorAll('.cart-item .qty-input').forEach(input => {
            input.addEventListener('change', () => {
                this.scheduleUpdate(input);
            });
        });
    }
    
    scheduleUpdate(input) {
        // Clear existing timeout
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
        
        // Schedule update after 1 second of inactivity
        this.updateTimeout = setTimeout(() => {
            this.updateCartItem(input);
        }, 1000);
    }
    
    async updateCartItem(input) {
        const form = input.closest('form');
        if (!form) return;
        
        const cartItem = input.closest('.cart-item');
        const originalOpacity = cartItem.style.opacity;
        
        // Show loading
        cartItem.style.opacity = '0.6';
        
        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                // Reload page to update totals
                window.location.reload();
            } else {
                throw new Error('Update failed');
            }
        } catch (error) {
            console.error('Cart update error:', error);
            cartItem.style.opacity = originalOpacity;
            showNotification('Failed to update cart', 'error');
        }
    }
}

// ============================================
// 9. LOCAL STORAGE CART (Optional - Backup)
// ============================================

class LocalStorageCart {
    constructor() {
        this.storageKey = 'countryfresh_cart';
    }
    
    getCart() {
        const cartData = localStorage.getItem(this.storageKey);
        return cartData ? JSON.parse(cartData) : [];
    }
    
    saveCart(cart) {
        localStorage.setItem(this.storageKey, JSON.stringify(cart));
    }
    
    addItem(productId, quantity = 1) {
        const cart = this.getCart();
        const existingItem = cart.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ productId, quantity });
        }
        
        this.saveCart(cart);
        return cart;
    }
    
    removeItem(productId) {
        let cart = this.getCart();
        cart = cart.filter(item => item.productId !== productId);
        this.saveCart(cart);
        return cart;
    }
    
    updateQuantity(productId, quantity) {
        const cart = this.getCart();
        const item = cart.find(item => item.productId === productId);
        
        if (item) {
            item.quantity = quantity;
            this.saveCart(cart);
        }
        
        return cart;
    }
    
    clearCart() {
        localStorage.removeItem(this.storageKey);
    }
    
    getItemCount() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + item.quantity, 0);
    }
}

// ============================================
// 10. INITIALIZE
// ============================================

let cart;
let cartAutoUpdate;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize shopping cart
    cart = new ShoppingCart();
    
    // Initialize auto-update for cart page
    if (document.querySelector('.cart-section')) {
        cartAutoUpdate = new CartAutoUpdate();
    }
    
    console.log('Cart functionality initialized');
});

// ============================================
// 11. GLOBAL FUNCTIONS
// ============================================

// Make cart functions globally accessible
window.updateCartCount = function() {
    if (cart) {
        cart.updateCartCount();
    }
};

window.quickAddToCart = function(productId, quantity = 1) {
    if (cart) {
        cart.quickAddToCart(productId, quantity);
    }
};

// ============================================
// 12. EXPORT
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ShoppingCart,
        CartAutoUpdate,
        LocalStorageCart
    };
}