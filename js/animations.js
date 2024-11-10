class UIAnimations {
    static fadeIn(element, duration = 500) {
        element.style.opacity = 0;
        element.style.transition = `opacity ${duration}ms ease-in-out`;
        setTimeout(() => element.style.opacity = 1, 10);
    }

    static slideIn(element, direction = 'left', duration = 500) {
        const translations = {
            left: ['translateX(-100%)', 'translateX(0)'],
            right: ['translateX(100%)', 'translateX(0)'],
            top: ['translateY(-100%)', 'translateY(0)'],
            bottom: ['translateY(100%)', 'translateY(0)']
        };

        element.style.transform = translations[direction][0];
        element.style.transition = `transform ${duration}ms ease-in-out`;
        setTimeout(() => element.style.transform = translations[direction][1], 10);
    }

    static pulse(element, scale = 1.1, duration = 200) {
        element.style.transition = `transform ${duration}ms ease-in-out`;
        element.style.transform = `scale(${scale})`;
        setTimeout(() => element.style.transform = 'scale(1)', duration);
    }

    static countUp(element, target, duration = 1000) {
        const start = parseInt(element.textContent) || 0;
        const increment = (target - start) / (duration / 16);
        let current = start;
        
        const update = () => {
            current += increment;
            element.textContent = Math.round(current);
            
            if (increment > 0 ? current < target : current > target) {
                requestAnimationFrame(update);
            } else {
                element.textContent = target;
            }
        };
        
        requestAnimationFrame(update);
    }

    static progressBar(element, percent, duration = 1000) {
        element.style.width = '0%';
        element.style.transition = `width ${duration}ms ease-in-out`;
        setTimeout(() => element.style.width = `${percent}%`, 10);
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIAnimations;
} 