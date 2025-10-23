class ScrollSpy {
    constructor() {
        this.sections = [];
        this.navLinks = [];
        this.observer = null;
        this.currentSection = '';
        this.headerHeight = 0;
        this.offset = 20;
        this.isScrolling = false;
        this.scrollTimeout = null;
        this.lastScrollTop = 0;
        this.scrollDirection = 'down';
        
        this.init();
    }
    
    init() {
        this.calculateHeaderHeight();
        this.initializeSections();
        this.initializeNavLinks();
        this.createScrollObserver();
        this.bindEvents();
        this.createVisualIndicator();
        
        console.log('ScrollSpy initialized');
    }
    
    calculateHeaderHeight() {
        const header = document.getElementById('header');
        if (header) {
            this.headerHeight = header.offsetHeight;
        }

        this.offset = this.headerHeight + 20;
    }
    
    initializeSections() {

        const sectionIds = Array.from(document.querySelectorAll('.nav__link[href^="#"]'))
            .map(link => link.getAttribute('href').substring(1))
            .filter(id => id !== ''); 
        
        this.sections = sectionIds.map(id => {
            const element = document.getElementById(id);
            return element ? {
                id: id,
                element: element,
                top: 0,
                bottom: 0,
                height: 0
            } : null;
        }).filter(section => section !== null);
        
        this.updateSectionPositions();
    }
    
    initializeNavLinks() {
        this.navLinks = Array.from(document.querySelectorAll('.nav__link[href^="#"]'));

        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavClick(e, link);
            });
        });
    }
    
    handleNavClick(e, link) {
        e.preventDefault();
        
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            this.scrollToSection(targetSection);
            this.updateActiveNavLink(targetId);

            this.closeMobileMenu();
        }
    }
    
    scrollToSection(section) {
        const targetPosition = section.offsetTop - this.offset;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        history.pushState(null, null, `#${section.id}`);
    }
    
    createScrollObserver() {

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.handleSectionInView(entry.target);
                }
            });
        }, {
            rootMargin: `-${this.offset}px 0px -30% 0px`,
            threshold: [0, 0.1, 0.5, 1]
        });

        this.sections.forEach(section => {
            this.observer.observe(section.element);
        });
    }
    
    handleSectionInView(section) {

        if (this.isScrolling) return;
        
        const sectionId = section.id;

        if (this.currentSection !== sectionId) {
            this.currentSection = sectionId;
            this.updateActiveNavLink(sectionId);
            this.updateVisualIndicator(sectionId);
            this.triggerSectionChangeEvent(sectionId);
        }
    }
    
    updateActiveNavLink(activeId) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            link.setAttribute('aria-current', 'false');
        });

        const activeLink = this.navLinks.find(link => 
            link.getAttribute('href') === `#${activeId}`
        );
        
        if (activeLink) {
            activeLink.classList.add('active');
            activeLink.setAttribute('aria-current', 'page');
            this.updateMobileMenuIndicator(activeLink);
        }
    }
    
    updateMobileMenuIndicator(activeLink) {
        const mobileIndicator = document.querySelector('.nav__mobile-indicator');
        if (mobileIndicator && activeLink.parentElement) {
            const linkRect = activeLink.getBoundingClientRect();
            const navRect = activeLink.closest('.nav__list').getBoundingClientRect();
            
            mobileIndicator.style.width = `${linkRect.width}px`;
            mobileIndicator.style.transform = `translateX(${linkRect.left - navRect.left}px)`;
            mobileIndicator.style.opacity = '1';
        }
    }
    
    createVisualIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'scrollspy-indicator';
        indicator.innerHTML = `
            <div class="scrollspy-indicator__line"></div>
            <div class="scrollspy-indicator__dot"></div>
            <div class="scrollspy-indicator__tooltip"></div>
        `;
        
        document.body.appendChild(indicator);
        this.addIndicatorStyles();
    }
    
    updateVisualIndicator(sectionId) {
        const indicator = document.querySelector('.scrollspy-indicator');
        const activeLink = this.navLinks.find(link => 
            link.getAttribute('href') === `#${sectionId}`
        );
        
        if (indicator && activeLink) {
            const linkRect = activeLink.getBoundingClientRect();
            const navRect = activeLink.closest('nav').getBoundingClientRect();

            indicator.style.top = `${linkRect.top + linkRect.height / 2}px`;
            indicator.style.left = `${navRect.left - 20}px`;
            indicator.style.opacity = '1';

            const tooltip = indicator.querySelector('.scrollspy-indicator__tooltip');
            if (tooltip) {
                tooltip.textContent = this.getSectionName(sectionId);
            }
        }
    }
    
    getSectionName(sectionId) {
        const sectionNames = {
            'home': 'Home',
            'projects': 'Projects',
            'skills': 'Skills',
            'services': 'Services',
            'experience': 'Experience',
            'blog': 'Blog',
            'contact': 'Contact'
        };
        
        return sectionNames[sectionId] || sectionId;
    }
    
    bindEvents() {
        window.addEventListener('resize', () => {
            this.calculateHeaderHeight();
            this.updateSectionPositions();
        });

        window.addEventListener('scroll', () => {
            this.handleScroll();
        }, { passive: true });

        window.addEventListener('scroll', () => {
            this.handleSmoothScroll();
        }, { passive: true });

        window.addEventListener('load', () => {
            this.handleInitialHash();
        });

        window.addEventListener('popstate', () => {
            this.handleHistoryChange();
        });
    }
    
    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        this.scrollDirection = scrollTop > this.lastScrollTop ? 'down' : 'up';
        this.lastScrollTop = scrollTop;

        if (scrollTop > 100) {
            document.body.classList.add('is-scrolling');
        } else {
            document.body.classList.remove('is-scrolling');
        }

        this.updateHeaderAppearance();
    }
    
    handleSmoothScroll() {
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }

        this.isScrolling = true;

        this.scrollTimeout = setTimeout(() => {
            this.isScrolling = false;
        }, 100);
    }
    
    handleInitialHash() {
        const hash = window.location.hash.substring(1);
        if (hash && this.sections.some(section => section.id === hash)) {
            this.updateActiveNavLink(hash);
            this.updateVisualIndicator(hash);
        } else {
            const firstSection = this.sections[0];
            if (firstSection) {
                this.updateActiveNavLink(firstSection.id);
                this.updateVisualIndicator(firstSection.id);
            }
        }
    }
    
    handleHistoryChange() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            this.updateActiveNavLink(hash);
            this.updateVisualIndicator(hash);
        }
    }
    
    updateHeaderAppearance() {
        const header = document.getElementById('header');
        if (!header) return;
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }

        if (scrollTop > this.headerHeight) {
            header.classList.add('header--shadow');
        } else {
            header.classList.remove('header--shadow');
        }
    }
    
    updateSectionPositions() {
        this.sections.forEach(section => {
            const rect = section.element.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            section.top = rect.top + scrollTop;
            section.bottom = rect.bottom + scrollTop;
            section.height = rect.height;
        });
    }
    
    closeMobileMenu() {
        const navMenu = document.getElementById('nav-menu');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
        }
    }
    
    triggerSectionChangeEvent(sectionId) {
        const event = new CustomEvent('sectionChange', {
            detail: {
                sectionId: sectionId,
                sectionName: this.getSectionName(sectionId),
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }
    
    addIndicatorStyles() {
        if (!document.querySelector('#scrollspy-styles')) {
            const style = document.createElement('style');
            style.id = 'scrollspy-styles';
            style.textContent = this.getScrollSpyStyles();
            document.head.appendChild(style);
        }
    }
    
    getScrollSpyStyles() {
        return `
            .scrollspy-indicator {
                position: fixed;
                top: 50%;
                left: 2rem;
                transform: translateY(-50%);
                z-index: 999;
                opacity: 0;
                transition: all 0.3s ease;
                pointer-events: none;
            }
            
            .scrollspy-indicator__line {
                position: absolute;
                top: 0;
                left: 6px;
                width: 2px;
                height: 100vh;
                background: var(--primary-color);
                opacity: 0.3;
                transform-origin: top;
            }
            
            .scrollspy-indicator__dot {
                width: 12px;
                height: 12px;
                background: var(--primary-color);
                border-radius: 50%;
                border: 2px solid var(--bg-primary);
                box-shadow: 0 0 0 2px var(--primary-color);
                position: relative;
                z-index: 2;
                transition: all 0.3s ease;
            }
            
            .scrollspy-indicator__tooltip {
                position: absolute;
                left: 25px;
                top: 50%;
                transform: translateY(-50%);
                background: var(--primary-color);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: var(--radius-md);
                font-size: var(--text-sm);
                font-weight: 600;
                white-space: nowrap;
                opacity: 0;
                transition: all 0.3s ease;
                pointer-events: none;
                box-shadow: var(--shadow-md);
            }
            
            .scrollspy-indicator__tooltip::before {
                content: '';
                position: absolute;
                left: -6px;
                top: 50%;
                transform: translateY(-50%);
                width: 0;
                height: 0;
                border-top: 6px solid transparent;
                border-bottom: 6px solid transparent;
                border-right: 6px solid var(--primary-color);
            }
            
            .scrollspy-indicator:hover .scrollspy-indicator__tooltip {
                opacity: 1;
                transform: translateY(-50%) translateX(5px);
            }
            
            .scrollspy-indicator:hover .scrollspy-indicator__dot {
                transform: scale(1.2);
                background: var(--primary-dark);
            }

            .nav__link.active {
                color: var(--primary-color) !important;
                font-weight: 600;
            }
            
            .nav__link.active::before {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 50%;
                transform: translateX(-50%);
                width: 4px;
                height: 4px;
                background: var(--primary-color);
                border-radius: 50%;
            }

            .nav__mobile-indicator {
                position: absolute;
                bottom: 0;
                height: 3px;
                background: var(--primary-color);
                border-radius: var(--radius-full);
                transition: all 0.3s ease;
                opacity: 0;
            }

            .header--scrolled {
                background: rgba(255, 255, 255, 0.95) !important;
                backdrop-filter: blur(10px);
            }
            
            [data-theme="dark"] .header--scrolled {
                background: rgba(17, 24, 39, 0.95) !important;
            }
            
            .header--shadow {
                box-shadow: var(--shadow-md);
            }

            .is-scrolling {
                cursor: default;
            }

            html {
                scroll-behavior: smooth;
            }

            .nav__link:focus-visible {
                outline: 2px solid var(--primary-color);
                outline-offset: 2px;
                border-radius: var(--radius-md);
            }

            @media (prefers-reduced-motion: reduce) {
                .scrollspy-indicator,
                .nav__link,
                .nav__mobile-indicator {
                    transition: none;
                }
                
                html {
                    scroll-behavior: auto;
                }
            }

            @media (max-width: 768px) {
                .scrollspy-indicator {
                    display: none;
                }
                
                .nav__mobile-indicator {
                    display: block;
                }
                
                .nav__link.active::before {
                    display: none;
                }
            }

            @media (min-width: 769px) {
                .nav__link {
                    position: relative;
                    transition: all 0.3s ease;
                }
                
                .nav__link::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 50%;
                    transform: translateX(-50%) scaleX(0);
                    width: 100%;
                    height: 2px;
                    background: var(--primary-color);
                    border-radius: var(--radius-full);
                    transition: transform 0.3s ease;
                }
                
                .nav__link:hover::after,
                .nav__link.active::after {
                    transform: translateX(-50%) scaleX(1);
                }
                
                .nav__link:hover {
                    color: var(--primary-color);
                    transform: translateY(-1px);
                }
            }

            @media (prefers-contrast: high) {
                .nav__link.active {
                    text-decoration: underline;
                    text-underline-offset: 4px;
                }
                
                .scrollspy-indicator__dot {
                    border-color: var(--bg-primary);
                    box-shadow: 0 0 0 2px var(--text-primary);
                }
            }

            @media print {
                .scrollspy-indicator {
                    display: none !important;
                }
            }
        `;
    }

    getCurrentSection() {
        return this.currentSection;
    }
    
    getAllSections() {
        return this.sections.map(section => section.id);
    }
    
    scrollToSectionById(sectionId) {
        const section = this.sections.find(s => s.id === sectionId);
        if (section) {
            this.scrollToSection(section.element);
        }
    }
    
    updateOffset(newOffset) {
        this.offset = newOffset;
        if (this.observer) {
            this.observer.disconnect();
            this.createScrollObserver();
        }
    }
    
    enable() {
        if (this.observer) {
            this.sections.forEach(section => {
                this.observer.observe(section.element);
            });
        }
    }
    
    disable() {
        if (this.observer) {
            this.observer.disconnect();
        }
        
        // Remove active states
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            link.setAttribute('aria-current', 'false');
        });
    }

    isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }
        
        const indicator = document.querySelector('.scrollspy-indicator');
        if (indicator) {
            indicator.remove();
        }

        this.navLinks.forEach(link => {
            link.removeEventListener('click', this.handleNavClick);
        });
        
        window.removeEventListener('resize', this.updateSectionPositions);
        window.removeEventListener('scroll', this.handleScroll);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.scrollSpy = new ScrollSpy();
});

document.addEventListener('sectionChange', (event) => {
    console.log('Section changed to:', event.detail.sectionId);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScrollSpy;
}

console.log('ScrollSpy module loaded');