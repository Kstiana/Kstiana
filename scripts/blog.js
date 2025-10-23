class Blog {
    constructor() {
        this.init();
    }
    
    init() {
        this.initializeArticleNavigation();
        this.initializeScrollSpy();
        this.initializeReadingProgress();
        this.initializeAccessibility();
        this.initializeThemeSwitcher();
        
        console.log('Blog initialized');
    }
    
    initializeArticleNavigation() {

        const articleLinks = document.querySelectorAll('a[href^="#"]');
        articleLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                if (targetId.startsWith('#')) {
                    e.preventDefault();
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }
    
    initializeScrollSpy() {
        const articles = document.querySelectorAll('.blog-article');
        const navLinks = document.querySelectorAll('.sidebar-nav__link');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '-100px 0px -100px 0px'
        });
        
        articles.forEach(article => {
            observer.observe(article);
        });
    }
    
    initializeReadingProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.innerHTML = '<div class="reading-progress__bar"></div>';
        document.body.appendChild(progressBar);
        
        const updateProgress = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.pageYOffset;
            const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
            
            const progressBarElement = document.querySelector('.reading-progress__bar');
            if (progressBarElement) {
                progressBarElement.style.width = scrollPercent + '%';
            }
        };
        
        window.addEventListener('scroll', updateProgress);
        window.addEventListener('resize', updateProgress);
        
        this.addReadingProgressStyles();
    }
    
    addReadingProgressStyles() {
        if (!document.querySelector('#reading-progress-styles')) {
            const style = document.createElement('style');
            style.id = 'reading-progress-styles';
            style.textContent = `
                .reading-progress {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: transparent;
                    z-index: 10000;
                }
                
                .reading-progress__bar {
                    height: 100%;
                    background: var(--gradient-primary);
                    width: 0%;
                    transition: width 0.1s ease;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    initializeAccessibility() {
        const fontSizeIncrease = document.getElementById('font-size-increase');
        const fontSizeDecrease = document.getElementById('font-size-decrease');
        
        let currentFontSize = 1;
        
        if (fontSizeIncrease) {
            fontSizeIncrease.addEventListener('click', () => {
                currentFontSize = Math.min(currentFontSize + 0.1, 1.5);
                document.documentElement.style.fontSize = `${currentFontSize * 100}%`;
            });
        }
        
        if (fontSizeDecrease) {
            fontSizeDecrease.addEventListener('click', () => {
                currentFontSize = Math.max(currentFontSize - 0.1, 0.8);
                document.documentElement.style.fontSize = `${currentFontSize * 100}%`;
            });
        }
        
        const highContrastToggle = document.getElementById('high-contrast-toggle');
        if (highContrastToggle) {
            const highContrastSaved = localStorage.getItem('high-contrast');
            if (highContrastSaved === 'true') {
                document.documentElement.setAttribute('data-theme', 'high-contrast');
            }
            
            highContrastToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                if (currentTheme === 'high-contrast') {
                    document.documentElement.removeAttribute('data-theme');
                   const savedTheme = localStorage.getItem('theme');
                    if (savedTheme) {
                        document.documentElement.setAttribute('data-theme', savedTheme);
                    }
                    localStorage.setItem('high-contrast', 'false');
                } else {
                    document.documentElement.setAttribute('data-theme', 'high-contrast');
                    localStorage.setItem('high-contrast', 'true');
                }
            });
        }
    }

    initializeThemeSwitcher() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;
        
 document.documentElement.classList.add('instant-theme');
        
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
        
        const highContrastSaved = localStorage.getItem('high-contrast');
        if (highContrastSaved === 'true') {
            document.documentElement.setAttribute('data-theme', 'high-contrast');
        }
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            this.updateThemeIcon(newTheme);
        });
    }

    updateThemeIcon(theme) {
        const themeIcon = document.querySelector('#theme-toggle i');
        if (themeIcon) {
            themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.blog = new Blog();
});