class MobileUtils {
    constructor() {
        this.touchStartY = 0;
        this.pullThreshold = 100;
        this.isRefreshing = false;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add touch feedback to all interactive elements
        document.querySelectorAll('button, .exercise-card, .achievement-card')
            .forEach(element => {
                element.classList.add('touch-friendly', 'no-select');
            });

        // Handle pull-to-refresh
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

        // Handle device orientation changes
        window.addEventListener('orientationchange', () => this.handleOrientationChange());

        // Add vibration feedback for interactions
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, .exercise-card, .achievement-card')) {
                this.provideHapticFeedback();
            }
        });
    }

    handleTouchStart(e) {
        this.touchStartY = e.touches[0].clientY;
    }

    handleTouchMove(e) {
        if (window.scrollY === 0 && !this.isRefreshing) {
            const touchY = e.touches[0].clientY;
            const pull = touchY - this.touchStartY;
            
            if (pull > 0) {
                e.preventDefault();
                this.showPullToRefresh(pull);
            }
        }
    }

    handleTouchEnd(e) {
        if (this.isRefreshing) {
            const pull = e.changedTouches[0].clientY - this.touchStartY;
            if (pull > this.pullThreshold) {
                this.refresh();
            } else {
                this.hidePullToRefresh();
            }
        }
    }

    showPullToRefresh(pull) {
        const progress = Math.min(pull / this.pullThreshold, 1);
        const pullIndicator = document.querySelector('.pull-to-refresh');
        if (pullIndicator) {
            pullIndicator.style.height = `${pull}px`;
            pullIndicator.style.opacity = progress;
        }
    }

    hidePullToRefresh() {
        const pullIndicator = document.querySelector('.pull-to-refresh');
        if (pullIndicator) {
            pullIndicator.style.height = '0';
            pullIndicator.style.opacity = '0';
        }
        this.isRefreshing = false;
    }

    refresh() {
        // Implement page-specific refresh logic
        location.reload();
    }

    handleOrientationChange() {
        // Adjust UI elements based on orientation
        const orientation = window.orientation;
        document.body.classList.toggle('landscape', orientation === 90 || orientation === -90);
    }

    provideHapticFeedback() {
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }

    static addSwipeNavigation(element, callbacks) {
        let touchStartX = 0;
        let touchEndX = 0;
        
        element.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        
        element.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchEndX - touchStartX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0 && callbacks.onSwipeRight) {
                    callbacks.onSwipeRight();
                } else if (diff < 0 && callbacks.onSwipeLeft) {
                    callbacks.onSwipeLeft();
                }
            }
        }
    }
}

// Initialize mobile utils
const mobileUtils = new MobileUtils();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileUtils;
} 