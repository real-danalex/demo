/* ============================================
   DASHBOARD - JAVASCRIPT
   ============================================ */

'use strict';

// ============================================
// 1. TAB SWITCHING
// ============================================

function initTabSwitching() {
    const navItems = document.querySelectorAll('.dashboard-nav .nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Skip if it's logout link
            if (this.classList.contains('logout')) {
                return;
            }
            
            e.preventDefault();
            const tabId = this.dataset.tab;
            
            if (!tabId) return;
            
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Hide all tab contents
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Show selected tab
            const selectedTab = document.getElementById(tabId);
            if (selectedTab) {
                selectedTab.classList.add('active');
                
                // Update URL hash
                window.location.hash = tabId;
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
    
    // Load tab from URL hash
    if (window.location.hash) {
        const tabId = window.location.hash.substring(1);
        const navItem = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
        if (navItem) {
            navItem.click();
        }
    }
}

// Global function for switching tabs
window.switchTab = function(tabId) {
    const navItem = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    if (navItem) {
        navItem.click();
    }
};

// ============================================
// 2. ORDER FILTERING
// ============================================

function initOrderFiltering() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const orderCards = document.querySelectorAll('.order-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter orders
            orderCards.forEach(card => {
                const status = card.dataset.status;
                
                if (filter === 'all' || status === filter) {
                    card.style.display = 'block';
                    fadeIn(card);
                } else {
                    fadeOut(card);
                }
            });
        });
    });
}

// ============================================
// 3. ADDRESS MODAL
// ============================================

let currentAddressId = null;

window.openAddressModal = function(mode, addressId = null) {
    const modal = document.getElementById('addressModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('addressForm');
    
    currentAddressId = addressId;
    
    if (mode === 'add') {
        modalTitle.textContent = 'Add New Address';
        form.reset();
    } else if (mode === 'edit') {
        modalTitle.textContent = 'Edit Address';
        // Load address data (would come from server)
        loadAddressData(addressId);
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeAddressModal = function() {
    const modal = document.getElementById('addressModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    currentAddressId = null;
};

function loadAddressData(addressId) {
    // This would fetch from server
    // For now, just populate with sample data
    document.getElementById('address_type').value = 'home';
    document.getElementById('full_name').value = 'John Doe';
    document.getElementById('phone_number').value = '+2348012345678';
    document.getElementById('address').value = '123 Sample Street, Ikeja';
    document.getElementById('city').value = 'Lagos';
    document.getElementById('state').value = 'Lagos';
}

// Close modal on outside click
document.addEventListener('click', function(e) {
    const modal = document.getElementById('addressModal');
    if (e.target === modal) {
        closeAddressModal();
    }
});

// ============================================
// 4. FORM SUBMISSIONS
// ============================================

function initFormSubmissions() {
    // Profile Form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch('/api/update-profile', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    showNotification('Profile updated successfully!', 'success');
                } else {
                    throw new Error('Update failed');
                }
            } catch (error) {
                console.error('Profile update error:', error);
                showNotification('Failed to update profile', 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Password Form
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const newPassword = document.getElementById('new_password').value;
            const confirmPassword = document.getElementById('confirm_password').value;
            
            if (newPassword !== confirmPassword) {
                showNotification('Passwords do not match!', 'error');
                return;
            }
            
            const formData = new FormData(this);
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch('/api/change-password', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    showNotification('Password updated successfully!', 'success');
                    this.reset();
                } else {
                    throw new Error('Update failed');
                }
            } catch (error) {
                console.error('Password update error:', error);
                showNotification('Failed to update password', 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Address Form
    const addressForm = document.getElementById('addressForm');
    if (addressForm) {
        addressForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            submitBtn.disabled = true;
            
            try {
                const url = currentAddressId 
                    ? `/api/update-address/${currentAddressId}` 
                    : '/api/add-address';
                
                const response = await fetch(url, {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    showNotification('Address saved successfully!', 'success');
                    closeAddressModal();
                    // Reload page to show new address
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    throw new Error('Save failed');
                }
            } catch (error) {
                console.error('Address save error:', error);
                showNotification('Failed to save address', 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// ============================================
// 5. DELETE ADDRESS
// ============================================

window.deleteAddress = function(addressId) {
    if (!confirm('Are you sure you want to delete this address?')) {
        return;
    }
    
    fetch(`/api/delete-address/${addressId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            showNotification('Address deleted successfully', 'success');
            setTimeout(() => window.location.reload(), 1000);
        } else {
            throw new Error('Delete failed');
        }
    })
    .catch(error => {
        console.error('Delete error:', error);
        showNotification('Failed to delete address', 'error');
    });
};

// ============================================
// 6. REORDER
// ============================================

window.reorder = function(orderId) {
    if (!confirm('Add all items from this order to your cart?')) {
        return;
    }
    
    fetch(`/api/reorder/${orderId}`, {
        method: 'POST'
    })
    .then(response => {
        if (response.ok) {
            showNotification('Items added to cart!', 'success');
            updateCartCount();
        } else {
            throw new Error('Reorder failed');
        }
    })
    .catch(error => {
        console.error('Reorder error:', error);
        showNotification('Failed to reorder', 'error');
    });
};

// ============================================
// 7. DELETE ACCOUNT
// ============================================

window.deleteAccount = function() {
    const confirmation = prompt(
        'This action cannot be undone. Type "DELETE" to confirm:'
    );
    
    if (confirmation !== 'DELETE') {
        showNotification('Account deletion cancelled', 'info');
        return;
    }
    
    if (!confirm('Are you absolutely sure? All your data will be permanently deleted.')) {
        return;
    }
    
    fetch('/api/delete-account', {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            showNotification('Account deleted successfully', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } else {
            throw new Error('Delete failed');
        }
    })
    .catch(error => {
        console.error('Account deletion error:', error);
        showNotification('Failed to delete account', 'error');
    });
};

// ============================================
// 8. SETTINGS TOGGLES
// ============================================

function initSettingsToggles() {
    const toggles = document.querySelectorAll('.toggle input[type="checkbox"]');
    
    toggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const setting = this.closest('.setting-item');
            const settingName = setting.querySelector('h4').textContent;
            const isEnabled = this.checked;
            
            // Save setting (would send to server)
            saveSetting(settingName, isEnabled);
        });
    });
}

function saveSetting(name, value) {
    // This would save to server
    console.log(`Setting "${name}" changed to: ${value}`);
    
    // Show feedback
    showNotification('Settings updated', 'success');
}

// ============================================
// 9. UTILITY FUNCTIONS
// ============================================

function fadeIn(element) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    let opacity = 0;
    const timer = setInterval(function() {
        if (opacity >= 1) {
            clearInterval(timer);
        }
        element.style.opacity = opacity;
        opacity += 0.1;
    }, 30);
}

function fadeOut(element) {
    let opacity = 1;
    const timer = setInterval(function() {
        if (opacity <= 0) {
            clearInterval(timer);
            element.style.display = 'none';
        }
        element.style.opacity = opacity;
        opacity -= 0.1;
    }, 30);
}

// ============================================
// 10. STATS ANIMATION
// ============================================

function animateStats() {
    const stats = document.querySelectorAll('.stat-info h3');
    
    stats.forEach(stat => {
        const target = parseInt(stat.textContent.replace(/[^0-9]/g, ''));
        if (isNaN(target)) return;
        
        let current = 0;
        const increment = target / 50;
        const isCurrency = stat.textContent.includes('₦');
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            if (isCurrency) {
                stat.textContent = `₦${current.toFixed(2)}`;
            } else {
                stat.textContent = Math.floor(current);
            }
        }, 20);
    });
}

// ============================================
// 11. SEARCH ORDERS
// ============================================

function initOrderSearch() {
    const searchInput = document.getElementById('orderSearch');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        const orderCards = document.querySelectorAll('.order-card');
        
        orderCards.forEach(card => {
            const orderId = card.querySelector('h3').textContent.toLowerCase();
            const orderDate = card.querySelector('.order-info p').textContent.toLowerCase();
            
            if (orderId.includes(query) || orderDate.includes(query)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// ============================================
// 12. PRINT ORDER
// ============================================

window.printOrder = function(orderId) {
    window.open(`/order/${orderId}/print`, '_blank');
};

// ============================================
// 13. DOWNLOAD INVOICE
// ============================================

window.downloadInvoice = function(orderId) {
    window.location.href = `/order/${orderId}/invoice`;
};

// ============================================
// 14. KEYBOARD SHORTCUTS
// ============================================

function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Alt + 1-7 for quick navigation
        if (e.altKey) {
            const shortcuts = {
                '1': 'overview',
                '2': 'orders',
                '3': 'addresses',
                '4': 'profile',
                '5': 'password',
                '6': 'wishlist',
                '7': 'settings'
            };
            
            if (shortcuts[e.key]) {
                e.preventDefault();
                switchTab(shortcuts[e.key]);
            }
        }
        
        // Escape to close modal
        if (e.key === 'Escape') {
            closeAddressModal();
        }
    });
}

// ============================================
// 15. AUTO-SAVE DRAFT
// ============================================

function initAutoSave() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('change', function() {
                // Save to localStorage
                const formId = form.id;
                const fieldName = this.name;
                const fieldValue = this.value;
                
                if (formId && fieldName) {
                    const key = `draft_${formId}_${fieldName}`;
                    localStorage.setItem(key, fieldValue);
                }
            });
        });
    });
}

// ============================================
// 16. LOAD DRAFTS
// ============================================

function loadDrafts() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const formId = form.id;
        if (!formId) return;
        
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            const fieldName = input.name;
            if (!fieldName) return;
            
            const key = `draft_${formId}_${fieldName}`;
            const savedValue = localStorage.getItem(key);
            
            if (savedValue && input.value === '') {
                input.value = savedValue;
            }
        });
    });
}

// ============================================
// 17. INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initialized');
    
    // Initialize features
    initTabSwitching();
    initOrderFiltering();
    initFormSubmissions();
    initSettingsToggles();
    initKeyboardShortcuts();
    initAutoSave();
    loadDrafts();
    
    // Animate stats on load
    setTimeout(animateStats, 300);
    
    // Update cart count
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
});

// ============================================
// 18. EXPORT
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        switchTab,
        openAddressModal,
        closeAddressModal,
        deleteAddress,
        reorder,
        deleteAccount
    };
}