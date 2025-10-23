class Microinteractions {
    constructor() {
        this.observers = [];
        this.intersectionObserver = null;
        this.scrollEffects = [];
        this.hoverEffects = [];
        this.clickEffects = [];
        
        this.init();
    }
    
    init() {
        this.initializeObservers();
        this.initializeRippleEffects();
        this.initializeHoverEffects();
        this.initializeScrollAnimations();
        this.initializeButtonInteractions();
        this.initializeFormInteractions();
        this.initializeCursorEffects();
        this.initializeLoadingStates();
        this.initializeFocusEffects();
        
        console.log('Microinteractions initialized');
    }
    
    initializeObservers() {
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.handleElementInViewport(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
    }
    
    initializeRippleEffects() {
        document.addEventListener('click', (e) => {
            const target = e.target;
 
            if (target.matches('.button, .btn, .card, .project-card, .service-card, [data-ripple]')) {
                this.createRippleEffect(e, target);
            }
        });
    }
    
    createRippleEffect(event, element) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
        `;

        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        element.style.overflow = 'hidden';
        
        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    initializeHoverEffects() {
        this.hoverEffects = [
            {
                selector: '.project-card, .service-card, .blog-card',
                class: 'card-hover'
            },
            {
                selector: '.nav__link',
                class: 'nav-link-hover'
            },
            {
                selector: '.hero__social-link, .contact__social-link, .footer__social-link',
                class: 'social-link-hover'
            },
            {
                selector: '.skill-item',
                class: 'skill-hover'
            },
            {
                selector: '.tech-badge, .project-card__tag',
                class: 'badge-hover'
            }
        ];
        
        this.hoverEffects.forEach(effect => {
            const elements = document.querySelectorAll(effect.selector);
            elements.forEach(element => {
                element.addEventListener('mouseenter', () => {
                    this.handleHoverEnter(element, effect.class);
                });
                element.addEventListener('mouseleave', () => {
                    this.handleHoverLeave(element, effect.class);
                });
            });
        });
    }
    
    handleHoverEnter(element, effectClass) {
        element.classList.add(effectClass);
        
        if (element.classList.contains('project-card') || 
            element.classList.contains('service-card')) {
            this.animateCardHover(element);
        }
        
        if (element.classList.contains('nav__link')) {
            this.animateNavLinkHover(element);
        }
    }
    
    handleHoverLeave(element, effectClass) {
        element.classList.remove(effectClass);
    }
    
    animateCardHover(card) {
        card.style.transform = 'translateY(-8px)';
        card.style.boxShadow = 'var(--shadow-xl)';

        if (card.style.borderColor) {
            card.style.borderColor = 'var(--primary-color)';
        }
    }
    
    animateNavLinkHover(link) {
        let underline = link.querySelector('.nav-underline');
        if (!underline) {
            underline = document.createElement('span');
            underline.className = 'nav-underline';
            underline.style.cssText = `
                position: absolute;
                bottom: -2px;
                left: 0;
                width: 0;
                height: 2px;
                background: var(--primary-color);
                transition: width 0.3s ease;
            `;
            link.style.position = 'relative';
            link.appendChild(underline);
        }
        
        underline.style.width = '100%';
    }
    
    initializeScrollAnimations() {
        const scrollElements = [
            '.skill-meter__fill',
            '.timeline-item',
            
            '.section__header',
            '.hero__content > *',
            '.stat-item'
        ];
        
        scrollElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                this.intersectionObserver.observe(element);
                this.scrollEffects.push(element);
            });
        });
    }
    
    handleElementInViewport(element) {
        if (element.classList.contains('skill-meter__fill')) {
            this.animateSkillMeter(element);
        } else if (element.classList.contains('timeline-item')) {
            this.animateTimelineItem(element);
        }  else if (element.classList.contains('section__header')) {
            this.animateSectionHeader(element);
        } else {
            element.style.animation = 'fadeInUp 0.6s ease forwards';
        }

        this.intersectionObserver.unobserve(element);
    }
    
    animateSkillMeter(meter) {
        const percentage = meter.getAttribute('data-percentage');
        meter.style.transform = `scaleX(${percentage / 100})`;
        meter.style.transition = 'transform 1s ease-out';
    }
    
    animateTimelineItem(item) {
        item.style.animation = 'slideInLeft 0.6s ease forwards';
    }
     animateSectionHeader(header) {
        const title = header.querySelector('.section__title');
        const subtitle = header.querySelector('.section__subtitle');
        
        if (title) {
            title.style.animation = 'fadeInDown 0.8s ease 0.2s forwards';
            title.style.opacity = '0';
        }
        
        if (subtitle) {
            subtitle.style.animation = 'fadeInUp 0.8s ease 0.4s forwards';
            subtitle.style.opacity = '0';
        }
    }
    
    initializeButtonInteractions() {
        document.addEventListener('mousedown', (e) => {
            if (e.target.matches('.button, .btn')) {
                this.handleButtonPress(e.target);
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (e.target.matches('.button, .btn')) {
                this.handleButtonRelease(e.target);
            }
        });
        
        document.addEventListener('touchstart', (e) => {
            if (e.target.matches('.button, .btn')) {
                this.handleButtonPress(e.target);
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (e.target.matches('.button, .btn')) {
                this.handleButtonRelease(e.target);
            }
        });
    }
    
    handleButtonPress(button) {
        button.style.transform = 'scale(0.95)';
        button.style.transition = 'transform 0.1s ease';
    }
    
    handleButtonRelease(button) {
        button.style.transform = 'scale(1)';
    }
    
    initializeFormInteractions() {
        const formFields = document.querySelectorAll('.form__input, .form__textarea');
        
        formFields.forEach(field => {
            field.addEventListener('focus', () => {
                this.handleFieldFocus(field);
            });
            
            field.addEventListener('blur', () => {
                this.handleFieldBlur(field);
            });

            field.addEventListener('input', () => {
                this.handleFieldInput(field);
            });
        });
    }
    
    handleFieldFocus(field) {
        field.parentElement.classList.add('focused');

        const label = field.previousElementSibling;
        if (label && label.classList.contains('form__label')) {
            label.classList.add('floating');
        }
    }
    
    handleFieldBlur(field) {
        field.parentElement.classList.remove('focused');
        
        if (!field.value) {
            const label = field.previousElementSibling;
            if (label && label.classList.contains('form__label')) {
                label.classList.remove('floating');
            }
        }
    }
    
    handleFieldInput(field) {
        if (field.value) {
            field.parentElement.classList.add('has-value');
        } else {
            field.parentElement.classList.remove('has-value');
        }
    }
    
    initializeCursorEffects() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        
        this.createCustomCursor();
        this.addCursorInteractionEffects();
    }
    
    createCustomCursor() {
        if (window.innerWidth < 768) return;
        
        const cursor = document.createElement('div');
        cursor.id = 'custom-cursor';
        cursor.innerHTML = `
            <div class="cursor-dot"></div>
            <div class="cursor-ring"></div>
        `;
        document.body.appendChild(cursor);
        
        this.initializeCursorMovement();
    }
    
    initializeCursorMovement() {
        const cursor = document.getElementById('custom-cursor');
        if (!cursor) return;
        
        let mouseX = 0;
        let mouseY = 0;
        let ringX = 0;
        let ringY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        const animateCursor = () => {
            const dot = cursor.querySelector('.cursor-dot');
            if (dot) {
                dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
            }

            const ring = cursor.querySelector('.cursor-ring');
            if (ring) {
                ringX += (mouseX - ringX) * 0.2;
                ringY += (mouseY - ringY) * 0.2;
                ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
            }
            
            requestAnimationFrame(animateCursor);
        };
        
        animateCursor();

        document.body.style.cursor = 'none';
    }
    
    addCursorInteractionEffects() {
        const cursor = document.getElementById('custom-cursor');
        if (!cursor) return;

        const interactiveElements = [
            'a', 'button', '.button', '.project-card', 
            '.service-card', '.nav__link', 'input', 'textarea'
        ];
        
        interactiveElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.addEventListener('mouseenter', () => {
                    cursor.classList.add('cursor-hover');
                });
                element.addEventListener('mouseleave', () => {
                    cursor.classList.remove('cursor-hover');
                });
            });
        });
        
        document.addEventListener('mousedown', () => {
            cursor.classList.add('cursor-click');
        });
        
        document.addEventListener('mouseup', () => {
            cursor.classList.remove('cursor-click');
        });
    }
    
    initializeLoadingStates() {
        this.createLoadingAnimations();
    }
    
    createLoadingAnimations() {
        const skeletonHTML = `
            <div class="skeleton-loading">
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
                <div class="skeleton-line medium"></div>
            </div>
        `;
        
        if (!document.querySelector('#skeleton-styles')) {
            const style = document.createElement('style');
            style.id = 'skeleton-styles';
            style.textContent = this.getSkeletonStyles();
            document.head.appendChild(style);
        }
    }
    
    initializeFocusEffects() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
        
        this.enhanceFocusStyles();
    }
    
    enhanceFocusStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .keyboard-navigation :focus-visible {
                outline: 3px solid var(--primary-color) !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
            }
            
            .keyboard-navigation .button:focus-visible,
            .keyboard-navigation a:focus-visible {
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(style);
    }
    
    getSkeletonStyles() {
        return `
            .skeleton-loading {
                animation: skeleton-pulse 2s infinite ease-in-out;
            }
            
            .skeleton-line {
                height: 1rem;
                background: var(--bg-secondary);
                border-radius: 0.25rem;
                margin-bottom: 0.75rem;
            }
            
            .skeleton-line.short {
                width: 60%;
            }
            
            .skeleton-line.medium {
                width: 80%;
            }
            
            @keyframes skeleton-pulse {
                0% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.5;
                }
                100% {
                    opacity: 1;
                }
            }
        `;
    }
    
    addMicrointeractionStyles() {
        if (!document.querySelector('#microinteractions-styles')) {
            const style = document.createElement('style');
            style.id = 'microinteractions-styles';
            style.textContent = this.getMicrointeractionStyles();
            document.head.appendChild(style);
        }
    }
    
    getMicrointeractionStyles() {
        return `
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            .ripple-effect {
                z-index: 1;
            }

            .card-hover {
                transition: all 0.3s ease !important;
            }
            
            .nav-link-hover {
                transition: color 0.3s ease, transform 0.2s ease;
            }
            
            .social-link-hover {
                transition: all 0.3s ease !important;
            }
            
            .skill-hover {
                transition: transform 0.3s ease;
            }
            
            .skill-hover:hover {
                transform: translateX(8px);
            }
            
            .badge-hover {
                transition: all 0.3s ease;
            }
            
            .badge-hover:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-md);
            }

            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes fadeInDown {
                from {
                    opacity: 0;
                    transform: translateY(-30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes slideInLeft {
                from {
                    opacity: 0;
                    transform: translateX(-30px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(30px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            .form__group.focused .form__label {
                color: var(--primary-color);
                transform: translateY(-1.5rem) scale(0.85);
            }
            
            .form__group.focused .form__input,
            .form__group.focused .form__textarea {
                border-color: var(--primary-color);
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }
            
            .form__label.floating {
                transform: translateY(-1.5rem) scale(0.85);
                color: var(--primary-color);
            }

            #custom-cursor {
                position: fixed;
                top: 0;
                left: 0;
                z-index: 10000;
                pointer-events: none;
                mix-blend-mode: difference;
            }
            
            .cursor-dot {
                width: 6px;
                height: 6px;
                background: white;
                border-radius: 50%;
                position: absolute;
                transform: translate(-50%, -50%);
                transition: width 0.2s, height 0.2s;
            }
            
            .cursor-ring {
                width: 24px;
                height: 24px;
                border: 2px solid white;
                border-radius: 50%;
                position: absolute;
                transform: translate(-50%, -50%);
                transition: all 0.2s ease;
            }
            
            .cursor-hover .cursor-dot {
                width: 8px;
                height: 8px;
            }
            
            .cursor-hover .cursor-ring {
                width: 32px;
                height: 32px;
                border-width: 1px;
            }
            
            .cursor-click .cursor-ring {
                width: 20px;
                height: 20px;
                border-width: 3px;
            }

            .button {
                transition: all 0.3s ease !important;
                position: relative;
                overflow: hidden;
            }
            
            .button::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s;
            }
            
            .button:hover::before {
                left: 100%;
            }

            .nav-underline {
                transition: width 0.3s ease;
            }

            @media (prefers-reduced-motion: reduce) {
                * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
                
                #custom-cursor {
                    display: none !important;
                }
                
                .ripple-effect {
                    display: none !important;
                }
            }

            @media (max-width: 768px) {
                #custom-cursor {
                    display: none !important;
                }
                
                .button::before {
                    display: none;
                }
            }

            .loading {
                position: relative;
                overflow: hidden;
            }
            
            .loading::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                animation: loading-shimmer 1.5s infinite;
            }
            
            @keyframes loading-shimmer {
                0% {
                    left: -100%;
                }
                100% {
                    left: 100%;
                }
            }

            .focus-visible {
                outline: 3px solid var(--primary-color) !important;
                outline-offset: 2px !important;
            }
            
            * {
                transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
            }

            img, video, canvas, .no-transition {
                transition: none !important;
            }
        `;
    }

    addScrollAnimation(element, animationClass) {
        this.intersectionObserver.observe(element);
        this.scrollEffects.push(element);
    }
    
    removeScrollAnimation(element) {
        this.intersectionObserver.unobserve(element);
        const index = this.scrollEffects.indexOf(element);
        if (index > -1) {
            this.scrollEffects.splice(index, 1);
        }
    }
    
    triggerRipple(element, x, y) {
        const event = new MouseEvent('click', {
            clientX: x,
            clientY: y
        });
        this.createRippleEffect(event, element);
    }

    isReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    registerDynamicElements(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
        this.intersectionObserver.observe(element);
        this.scrollEffects.push(element);
    });
}

    destroy() {
        if (this.intersectionObserver) {
            this.scrollEffects.forEach(element => {
                this.intersectionObserver.unobserve(element);
            });
            this.intersectionObserver.disconnect();
        }
        
        const cursor = document.getElementById('custom-cursor');
        if (cursor) {
            cursor.remove();
            document.body.style.cursor = '';
        }

        this.observers.forEach(observer => {
            if (observer.element && observer.handler) {
                observer.element.removeEventListener(observer.type, observer.handler);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.microinteractions = new Microinteractions();
    window.microinteractions.addMicrointeractionStyles();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Microinteractions;
}

console.log('Microinteractions module loaded');