/* ============================================
   FAQ PAGE - JAVASCRIPT
   ============================================ */

'use strict';
console.log("✅ faq.js loaded");


// ============================================
// 1. FAQ ACCORDION
// ============================================

function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
            
            // Smooth scroll to question if opening
            if (item.classList.contains('active')) {
                setTimeout(() => {
                    question.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest'
                    });
                }, 300);
            }
        });
    });
}

// ============================================
// 2. CATEGORY FILTERING
// ============================================

function initCategoryFiltering() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const faqCategories = document.querySelectorAll('.faq-category');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show/hide categories
            if (category === 'all') {
                faqCategories.forEach(cat => {
                    cat.style.display = 'block';
                    fadeIn(cat);
                });
            } else {
                faqCategories.forEach(cat => {
                    if (cat.dataset.category === category) {
                        cat.style.display = 'block';
                        fadeIn(cat);
                    } else {
                        fadeOut(cat);
                    }
                });
            }
        });
    });
}

// ============================================
// 3. FAQ SEARCH
// ============================================

function searchFAQs() {
    const searchInput = document.getElementById('faqSearch');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm.length < 2) {
        showAllFAQs();
        return;
    }
    
    const faqItems = document.querySelectorAll('.faq-item');
    const faqCategories = document.querySelectorAll('.faq-category');
    let foundResults = false;
    
    // Show all categories first
    faqCategories.forEach(category => {
        category.style.display = 'block';
    });
    
    // Filter FAQ items
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question span').textContent.toLowerCase();
        const answer = item.querySelector('.faq-answer p').textContent.toLowerCase();
        
        if (question.includes(searchTerm) || answer.includes(searchTerm)) {
            item.style.display = 'block';
            highlightSearchTerm(item, searchTerm);
            foundResults = true;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Hide empty categories
    faqCategories.forEach(category => {
        const visibleItems = category.querySelectorAll('.faq-item[style*="display: block"]');
        if (visibleItems.length === 0) {
            category.style.display = 'none';
        }
    });
    
    // Show no results message
    if (!foundResults) {
        showNoResults();
    } else {
        hideNoResults();
    }
}

function highlightSearchTerm(item, term) {
    const questionSpan = item.querySelector('.faq-question span');
    const originalText = questionSpan.textContent;
    const regex = new RegExp(`(${term})`, 'gi');
    const highlightedText = originalText.replace(regex, '<mark>$1</mark>');
    questionSpan.innerHTML = highlightedText;
}

function showAllFAQs() {
    const faqItems = document.querySelectorAll('.faq-item');
    const faqCategories = document.querySelectorAll('.faq-category');
    
    faqCategories.forEach(category => {
        category.style.display = 'block';
    });
    
    faqItems.forEach(item => {
        item.style.display = 'block';
        // Remove highlight
        const questionSpan = item.querySelector('.faq-question span');
        questionSpan.innerHTML = questionSpan.textContent;
    });
    
    hideNoResults();
}

function showNoResults() {
    let noResultsDiv = document.querySelector('.no-results');
    
    if (!noResultsDiv) {
        noResultsDiv = document.createElement('div');
        noResultsDiv.className = 'no-results';
        noResultsDiv.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3>No Results Found</h3>
                <p>We couldn't find any FAQs matching your search. Try different keywords or <a href="#" onclick="contactSupport()">contact our support team</a>.</p>
            </div>
        `;
        document.querySelector('.faq-container').appendChild(noResultsDiv);
    }
    
    noResultsDiv.style.display = 'block';
}

function hideNoResults() {
    const noResultsDiv = document.querySelector('.no-results');
    if (noResultsDiv) {
        noResultsDiv.style.display = 'none';
    }
}

// ============================================
// 4. LIVE SEARCH
// ============================================

function initLiveSearch() {
    const searchInput = document.getElementById('faqSearch');
    
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        
        // Debounce search
        searchTimeout = setTimeout(() => {
            searchFAQs();
        }, 300);
    });
    
    // Search on Enter key
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchFAQs();
        }
    });
}

// ============================================
// 5. SMOOTH SCROLL TO SECTION
// ============================================

function initSmoothScroll() {
    const navLinks = document.querySelectorAll('.policy-nav-list a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Update active link
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Scroll to section
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Offset for fixed header
                const headerOffset = 100;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// 6. SCROLL SPY (Update active nav on scroll)
// ============================================

function initScrollSpy() {
    const sections = document.querySelectorAll('.policy-section-item');
    const navLinks = document.querySelectorAll('.policy-nav-list a');
    
    if (sections.length === 0) return;
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ============================================
// 7. UTILITY FUNCTIONS
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

function contactSupport() {
    window.location.href = '/contact';
}

// ============================================
// 8. PRINT FAQ
// ============================================

function printFAQ() {
    // Expand all FAQs before printing
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.classList.add('active');
    });
    
    window.print();
    
    // Collapse after printing
    setTimeout(() => {
        faqItems.forEach(item => {
            item.classList.remove('active');
        });
    }, 1000);
}

// ============================================
// 9. COPY LINK TO FAQ
// ============================================

function copyFAQLink(faqId) {
    const url = window.location.origin + window.location.pathname + '#' + faqId;
    
    navigator.clipboard.writeText(url).then(() => {
        showNotification('Link copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy link', 'error');
    });
}

// ============================================
// 10. FAQ RATING (Optional)
// ============================================

function rateFAQ(faqId, rating) {
    // Send rating to server
    fetch('/api/faq-rating', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            faq_id: faqId,
            rating: rating
        })
    })
    .then(response => response.json())
    .then(data => {
        showNotification('Thank you for your feedback!', 'success');
    })
    .catch(error => {
        console.error('Rating error:', error);
    });
}

// ============================================
// 11. INITIALIZE ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize FAQ page features
    initFAQAccordion();
    initCategoryFiltering();
    initLiveSearch();
    initSmoothScroll();
    initScrollSpy();
    
    console.log('FAQ page initialized');
    
    // Open FAQ from URL hash
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetFaq = document.querySelector(`[data-faq-id="${targetId}"]`);
        
        if (targetFaq) {
            setTimeout(() => {
                targetFaq.click();
                targetFaq.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }
});

// ============================================
// 12. EXPORT FUNCTIONS
// ============================================

// Make functions globally accessible
window.searchFAQs = searchFAQs;
window.contactSupport = contactSupport;
window.printFAQ = printFAQ;
window.copyFAQLink = copyFAQLink;
window.rateFAQ = rateFAQ;

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        searchFAQs,
        initFAQAccordion,
        initCategoryFiltering,
        initLiveSearch
    };
}

