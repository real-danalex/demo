/* ============================================
   COUNTRYFRESH BAKERY - HERO SLIDER
   ============================================ */

'use strict';

// ============================================
// 1. SLIDER CONFIGURATION
// ============================================

const sliderConfig = {
    autoPlayInterval: 5000,      // 5 seconds
    transitionDuration: 1000,    // 1 second
    pauseOnHover: true,
    swipeThreshold: 50           // Minimum swipe distance in pixels
};

// ============================================
// 2. SLIDER CLASS
// ============================================

class HeroSlider {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) return;
        
        this.slides = this.container.querySelectorAll('.slide');
        this.indicators = this.container.querySelectorAll('.indicator');
        this.prevBtn = this.container.querySelector('.slider-control.prev');
        this.nextBtn = this.container.querySelector('.slider-control.next');
        
        this.currentSlide = 0;
        this.isTransitioning = false;
        this.autoPlayTimer = null;
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        this.init();
    }
    
    init() {
        if (this.slides.length === 0) return;
        
        // Show first slide
        this.showSlide(0);
        
        // Initialize controls
        this.initControls();
        
        // Initialize touch/swipe
        this.initTouch();
        
        // Start autoplay
        this.startAutoPlay();
        
        // Pause on hover
        if (sliderConfig.pauseOnHover) {
            this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
            this.container.addEventListener('mouseleave', () => this.startAutoPlay());
        }
        
        // Pause when tab is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoPlay();
            } else {
                this.startAutoPlay();
            }
        });
    }
    
    initControls() {
        // Previous button
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.previousSlide();
            });
        }
        
        // Next button
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.nextSlide();
            });
        }
        
        // Indicators
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.goToSlide(index);
            });
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.previousSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });
    }
    
    initTouch() {
        this.container.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        this.container.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
        
        // Mouse drag (optional)
        let isDragging = false;
        let startX = 0;
        
        this.container.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.pageX;
        });
        
        this.container.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });
        
        this.container.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            
            const diff = e.pageX - startX;
            if (Math.abs(diff) > sliderConfig.swipeThreshold) {
                if (diff > 0) {
                    this.previousSlide();
                } else {
                    this.nextSlide();
                }
            }
        });
    }
    
    handleSwipe() {
        const swipeDistance = this.touchEndX - this.touchStartX;
        
        if (Math.abs(swipeDistance) > sliderConfig.swipeThreshold) {
            if (swipeDistance > 0) {
                // Swipe right - go to previous slide
                this.previousSlide();
            } else {
                // Swipe left - go to next slide
                this.nextSlide();
            }
        }
    }
    
    showSlide(index) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        // Remove active class from all slides
        this.slides.forEach(slide => slide.classList.remove('active'));
        
        // Remove active class from all indicators
        this.indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Add active class to current slide
        this.slides[index].classList.add('active');
        
        // Add active class to current indicator
        if (this.indicators[index]) {
            this.indicators[index].classList.add('active');
        }
        
        this.currentSlide = index;
        
        // Allow transitions again after animation completes
        setTimeout(() => {
            this.isTransitioning = false;
        }, sliderConfig.transitionDuration);
    }
    
    nextSlide() {
        let nextIndex = this.currentSlide + 1;
        if (nextIndex >= this.slides.length) {
            nextIndex = 0;
        }
        this.goToSlide(nextIndex);
    }
    
    previousSlide() {
        let prevIndex = this.currentSlide - 1;
        if (prevIndex < 0) {
            prevIndex = this.slides.length - 1;
        }
        this.goToSlide(prevIndex);
    }
    
    goToSlide(index) {
        if (index === this.currentSlide || this.isTransitioning) return;
        
        this.showSlide(index);
        this.restartAutoPlay();
    }
    
    startAutoPlay() {
        if (this.autoPlayTimer) return;
        
        this.autoPlayTimer = setInterval(() => {
            this.nextSlide();
        }, sliderConfig.autoPlayInterval);
    }
    
    stopAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }
    
    restartAutoPlay() {
        this.stopAutoPlay();
        this.startAutoPlay();
    }
    
    destroy() {
        this.stopAutoPlay();
        // Remove event listeners if needed
    }
}

// ============================================
// 3. INITIALIZE SLIDER
// ============================================

let heroSlider;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize hero slider
    heroSlider = new HeroSlider('.hero-slider');
    
    // Log initialization
    if (heroSlider.slides && heroSlider.slides.length > 0) {
        console.log(`Hero Slider initialized with ${heroSlider.slides.length} slides`);
    }
});

// ============================================
// 4. TESTIMONIAL SLIDER (if needed)
// ============================================

class TestimonialSlider {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) return;
        
        this.slides = this.container.querySelectorAll('.testimonial-card');
        this.currentSlide = 0;
        this.slidesPerView = this.getSlidesPerView();
        
        this.init();
    }
    
    init() {
        if (this.slides.length <= this.slidesPerView) return;
        
        // Create navigation buttons
        this.createNavigation();
        
        // Initialize responsive behavior
        window.addEventListener('resize', () => {
            this.slidesPerView = this.getSlidesPerView();
            this.updateSlides();
        });
        
        // Auto-rotate
        this.startAutoRotate();
    }
    
    getSlidesPerView() {
        const width = window.innerWidth;
        if (width < 768) return 1;
        if (width < 1024) return 2;
        return 3;
    }
    
    createNavigation() {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'testimonial-nav prev';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.onclick = () => this.previousSlide();
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'testimonial-nav next';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.onclick = () => this.nextSlide();
        
        this.container.appendChild(prevBtn);
        this.container.appendChild(nextBtn);
    }
    
    updateSlides() {
        this.slides.forEach((slide, index) => {
            slide.style.display = 'none';
            
            if (index >= this.currentSlide && index < this.currentSlide + this.slidesPerView) {
                slide.style.display = 'block';
            }
        });
    }
    
    nextSlide() {
        this.currentSlide++;
        if (this.currentSlide + this.slidesPerView > this.slides.length) {
            this.currentSlide = 0;
        }
        this.updateSlides();
    }
    
    previousSlide() {
        this.currentSlide--;
        if (this.currentSlide < 0) {
            this.currentSlide = this.slides.length - this.slidesPerView;
        }
        this.updateSlides();
    }
    
    startAutoRotate() {
        setInterval(() => {
            this.nextSlide();
        }, 5000);
    }
}

// Initialize testimonial slider if present
document.addEventListener('DOMContentLoaded', function() {
    const testimonialSlider = new TestimonialSlider('.testimonials-slider');
});

// ============================================
// 5. PRODUCT CAROUSEL (Optional)
// ============================================

class ProductCarousel {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) return;
        
        this.track = this.container.querySelector('.carousel-track');
        this.items = this.container.querySelectorAll('.carousel-item');
        this.prevBtn = this.container.querySelector('.carousel-prev');
        this.nextBtn = this.container.querySelector('.carousel-next');
        
        this.currentPosition = 0;
        this.itemWidth = 0;
        
        this.init();
    }
    
    init() {
        if (!this.track || this.items.length === 0) return;
        
        this.calculateDimensions();
        
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.scrollLeft());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.scrollRight());
        }
        
        window.addEventListener('resize', () => {
            this.calculateDimensions();
        });
    }
    
    calculateDimensions() {
        if (this.items.length > 0) {
            this.itemWidth = this.items[0].offsetWidth + 
                parseInt(window.getComputedStyle(this.items[0]).marginRight);
        }
    }
    
    scrollLeft() {
        this.currentPosition = Math.max(0, this.currentPosition - this.itemWidth);
        this.updatePosition();
    }
    
    scrollRight() {
        const maxScroll = (this.items.length - this.getVisibleItems()) * this.itemWidth;
        this.currentPosition = Math.min(maxScroll, this.currentPosition + this.itemWidth);
        this.updatePosition();
    }
    
    updatePosition() {
        this.track.style.transform = `translateX(-${this.currentPosition}px)`;
    }
    
    getVisibleItems() {
        const containerWidth = this.container.offsetWidth;
        return Math.floor(containerWidth / this.itemWidth);
    }
}

// ============================================
// 6. EXPORT
// ============================================

// Make classes globally accessible
window.HeroSlider = HeroSlider;
window.TestimonialSlider = TestimonialSlider;
window.ProductCarousel = ProductCarousel;

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        HeroSlider,
        TestimonialSlider,
        ProductCarousel,
        sliderConfig
    };
}