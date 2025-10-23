class ThemeSwitcher {
    constructor(options = {}) {
    this.themes = ['light', 'dark', 'high-contrast'];
    this.currentTheme = this.getSavedTheme();
    this.isTransitioning = false;
    this.silent = options.silent || false; // NEW
    this.init();
}
    
    init() {
    this.applyThemeImmediately(this.currentTheme);
    if (!this.silent) {
        this.createThemeToggle();
    }
    this.observeSystemTheme();
    console.log('Optimized theme switcher initialized');
}
    
    getSavedTheme() {
        try {
            const savedTheme = localStorage.getItem('portfolio-theme');
            return savedTheme && this.themes.includes(savedTheme) 
                ? savedTheme 
                : this.getSystemTheme();
        } catch {
            return 'light';
        }
    }
    
    getSystemTheme() {
        return window.matchMedia?.('(prefers-color-scheme: dark)').matches 
            ? 'dark' 
            : 'light';
    }
    
    applyThemeImmediately(theme) {
        if (!this.themes.includes(theme) || this.isTransitioning) return;

        document.documentElement.classList.add('no-transition');
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;

        requestAnimationFrame(() => {
            try {
                localStorage.setItem('portfolio-theme', theme);
            } catch (e) {
                // Silent fail
            }
        });

        this.updateThemeIcon();
        this.updateMetaThemeColor(theme);
        
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.documentElement.classList.remove('no-transition');
            });
        });
        
        this.dispatchThemeChangeEvent(theme);
    }
    
    setTheme(theme) {
        if (this.isTransitioning || !this.themes.includes(theme)) return;
        
        this.isTransitioning = true;
        requestAnimationFrame(() => {
            this.applyThemeImmediately(theme);
            this.isTransitioning = false;
        });
    }
    
    createThemeToggle() {
        let toggleBtn = document.getElementById('theme-toggle');
        
        if (!toggleBtn) {
            toggleBtn = document.createElement('button');
            toggleBtn.id = 'theme-toggle';
            toggleBtn.className = 'theme-toggle__btn';
            toggleBtn.setAttribute('aria-label', 'Toggle theme');
            toggleBtn.innerHTML = '<i class="fas fa-palette"></i>';
            
            const navMenu = document.querySelector('.nav__menu');
            if (navMenu) {
                const themeToggleContainer = document.createElement('div');
                themeToggleContainer.className = 'theme-toggle';
                themeToggleContainer.appendChild(toggleBtn);
                navMenu.appendChild(themeToggleContainer);
            }
        }
        
        toggleBtn.addEventListener('click', () => {
            this.cycleTheme();
        }, { passive: true });
        
        toggleBtn.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.cycleTheme(e.key === 'ArrowDown');
            }
        });
    }
    
    cycleTheme(forward = true) {
        const currentIndex = this.themes.indexOf(this.currentTheme);
        const nextIndex = forward 
            ? (currentIndex + 1) % this.themes.length
            : (currentIndex - 1 + this.themes.length) % this.themes.length;
        
        this.setTheme(this.themes[nextIndex]);
    }
    
    getNextThemeIcon() {

        const currentIndex = this.themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        const nextTheme = this.themes[nextIndex];
        
        const icons = {
            'light': 'fas fa-moon', 
            'dark': 'fas fa-circle',    
            'high-contrast': 'fas fa-sun'  
        };
        
        return icons[nextTheme] || 'fas fa-palette';
    }
    
    updateThemeIcon() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (!toggleBtn) return;
        
        const icon = toggleBtn.querySelector('i');
        if (!icon) return;

        icon.className = this.getNextThemeIcon();

        icon.classList.add('theme-icon-transition');
        setTimeout(() => {
            icon.classList.remove('theme-icon-transition');
        }, 300);
    }
    
    updateMetaThemeColor(theme) {
        const themeColors = {
            'light': '#6366f1',
            'dark': '#1f2937',
            'high-contrast': '#000000'
        };
        
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        metaThemeColor.content = themeColors[theme] || '#6366f1';
    }
    
    observeSystemTheme() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            this.handleSystemThemeChange = (e) => {
                if (!localStorage.getItem('portfolio-theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            };
            
            mediaQuery.addEventListener('change', this.handleSystemThemeChange);
        }
    }
    
    dispatchThemeChangeEvent(theme) {
        document.dispatchEvent(new CustomEvent('themeChange', {
            detail: { theme }
        }));
    }
    
    destroy() {
        if (this.handleSystemThemeChange) {
            window.matchMedia?.('(prefers-color-scheme: dark)')
                .removeEventListener('change', this.handleSystemThemeChange);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.themeSwitcher = new ThemeSwitcher();
});

const style = document.createElement('style');
style.textContent = `
    .theme-toggle {
        display: flex;
        align-items: center;
    }
    
    .theme-toggle__btn {
        background: var(--bg-secondary);
        border: 2px solid var(--border-color);
        border-radius: var(--radius-full);
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--text-primary);
        transition: all var(--transition-fast);
        position: relative;
        overflow: hidden;
    }
    
    .theme-toggle__btn:hover {
        background: var(--primary-color);
        color: var(--white);
        border-color: var(--primary-color);
        transform: scale(1.05);
    }
    
    .theme-toggle__btn:active {
        transform: scale(0.95);
    }
    
    .theme-toggle__btn::after {
        content: '';
        position: absolute;
        bottom: 4px;
        right: 4px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--primary-color);
        border: 2px solid var(--bg-primary);
    }
    
    .theme-icon-transition {
        transition: all 0.3s ease;
        transform: scale(1.1);
    }
    
    .no-transition * {
        transition: none !important;
    }
    
    @media (prefers-reduced-motion: reduce) {
        .theme-icon-transition {
            transition: none;
            transform: none;
        }
    }
`;
document.head.appendChild(style);

console.log('Theme switcher loaded');