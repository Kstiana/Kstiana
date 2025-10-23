class LoadingScreen {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.loadingContent = document.querySelector('.loading-content');
        this.loaderSpinner = document.querySelector('.loader-spinner');
        this.progressBar = null;
        this.progressText = null;
        this.minDisplayTime = 1500;
        this.startTime = null;
        
        this.init();
    }
    
    init() {
        if (!this.loadingScreen) {
            console.warn('Loading screen element not found');
            return;
        }
        
        this.createEnhancedLoader();
        this.startLoadingSimulation();
        this.handleRealPageLoad();
        
        console.log('🔄 Loading screen initialized');
    }
    
    createEnhancedLoader() {
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'loading-progress';
        this.progressBar.innerHTML = `
            <div class="loading-progress__track">
                <div class="loading-progress__fill"></div>
            </div>
            <div class="loading-progress__text">0%</div>
        `;

        const loadingDots = document.createElement('div');
        loadingDots.className = 'loading-dots';
        loadingDots.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;

        if (this.loadingContent) {
            this.loadingContent.appendChild(this.progressBar);
            this.loadingContent.appendChild(loadingDots);
        }
        
        this.progressText = this.progressBar.querySelector('.loading-progress__text');

        this.addLoadingStyles();
    }
    
    addLoadingStyles() {
        if (!document.querySelector('#loading-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-styles';
            style.textContent = `
                .loading-progress {
                    width: 200px;
                    margin: 2rem auto 1rem;
                    text-align: center;
                }
                
                .loading-progress__track {
                    width: 100%;
                    height: 4px;
                    background: var(--gray-200);
                    border-radius: 2px;
                    overflow: hidden;
                    margin-bottom: 0.5rem;
                }
                
                .loading-progress__fill {
                    height: 100%;
                    background: var(--gradient-primary);
                    border-radius: 2px;
                    width: 0%;
                    transition: width 0.3s ease;
                }
                
                .loading-progress__text {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    font-weight: 600;
                }
                
                .loading-dots {
                    display: flex;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-top: 1rem;
                }
                
                .loading-dots span {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: var(--primary-color);
                    animation: loading-dots 1.4s ease-in-out infinite both;
                }
                
                .loading-dots span:nth-child(1) {
                    animation-delay: -0.32s;
                }
                
                .loading-dots span:nth-child(2) {
                    animation-delay: -0.16s;
                }
                
                .loading-dots span:nth-child(3) {
                    animation-delay: 0s;
                }
                
                @keyframes loading-dots {
                    0%, 80%, 100% {
                        transform: scale(0.8);
                        opacity: 0.5;
                    }
                    40% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                
                .loader-spinner {
                    width: 60px;
                    height: 60px;
                    border: 3px solid transparent;
                    border-top: 3px solid var(--primary-color);
                    border-right: 3px solid var(--primary-light);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1.5rem;
                    position: relative;
                }
                
                .loader-spinner::before {
                    content: '';
                    position: absolute;
                    top: -3px;
                    left: -3px;
                    right: -3px;
                    bottom: -3px;
                    border: 3px solid transparent;
                    border-bottom: 3px solid var(--secondary-color);
                    border-left: 3px solid var(--secondary-light);
                    border-radius: 50%;
                    animation: spin 0.5s linear infinite reverse;
                }
                
                .loading-content {
                    text-align: center;
                    animation: fadeInUp 0.6s ease;
                }
                
                .loading-content p {
                    color: var(--text-secondary);
                    margin-top: 1rem;
                    font-size: 0.9rem;
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .loading-screen {
                    background: var(--bg-primary);
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    transition: opacity 0.5s ease, visibility 0.5s ease;
                }
                
                .loading-screen.fade-out {
                    opacity: 0;
                    visibility: hidden;
                }

                @media (prefers-reduced-motion: reduce) {
                    .loader-spinner,
                    .loader-spinner::before,
                    .loading-dots span {
                        animation: none;
                    }
                    
                    .loading-progress__fill {
                        transition: none;
                    }
                }
                
 [data-theme="dark"] .loading-progress__track {
                    background: var(--gray-700);
                }
  [data-theme="high-contrast"] .loading-progress__track {
                    background: var(--gray-600);
                    border: 1px solid var(--border-color);
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    startLoadingSimulation() {
        this.startTime = Date.now();
        let progress = 0;
        const targetProgress = 90; 
        
        const simulateProgress = () => {
            if (progress < targetProgress) {
            
                const increment = Math.random() * 15 + 5;
                progress = Math.min(progress + increment, targetProgress);
                this.updateProgress(progress);

                const delay = progress < 50 ? 200 : 100;
                setTimeout(simulateProgress, delay);
            }
        };
        
        simulateProgress();
    }
    
    updateProgress(percentage) {
        if (this.progressBar) {
            const fill = this.progressBar.querySelector('.loading-progress__fill');
            if (fill) {
                fill.style.width = percentage + '%';
            }
        }
        
        if (this.progressText) {
            this.progressText.textContent = Math.round(percentage) + '%';
        }
        
        this.updateLoadingText(percentage);
    }
    
    updateLoadingText(percentage) {
        const messages = [
            { threshold: 0, text: 'Loading amazing experiences...' },
            { threshold: 25, text: 'Initializing portfolio...' },
            { threshold: 50, text: 'Loading projects...' },
            { threshold: 75, text: 'Almost there...' },
            { threshold: 90, text: 'Final touches...' }
        ];
        
        const message = messages
            .filter(m => percentage >= m.threshold)
            .pop();
            
        if (message && this.loadingContent) {
            const textElement = this.loadingContent.querySelector('p');
            if (textElement) {
                textElement.textContent = message.text;
            }
        }
    }
    
    handleRealPageLoad() {
        const resources = [
            () => document.readyState === 'complete',
            () => window.projectData !== undefined,
            () => document.querySelectorAll('img[data-src], img[src]').length > 0
        ];
        
        let resourcesLoaded = 0;
        const totalResources = resources.length;
        
        const checkResources = () => {
            resourcesLoaded = resources.filter(resource => resource()).length;
            const progress = 90 + (resourcesLoaded / totalResources) * 10;
            this.updateProgress(progress);
            
            if (resourcesLoaded === totalResources || Date.now() - this.startTime > 5000) {
                this.completeLoading();
            } else {
                setTimeout(checkResources, 100);
            }
        };
        
        setTimeout(checkResources, 500);
        
        setTimeout(() => {
            this.completeLoading();
        }, 7000);
    }
    
    completeLoading() {
        this.updateProgress(100);
        
        const elapsed = Date.now() - this.startTime;
        const remainingTime = Math.max(0, this.minDisplayTime - elapsed);
        
        setTimeout(() => {
            this.hideLoadingScreen();
        }, remainingTime);
    }
    
    hideLoadingScreen() {
        if (!this.loadingScreen) return;

        this.loadingScreen.classList.add('fade-out');

        if (this.loadingContent) {
            this.loadingContent.style.animation = 'fadeOutDown 0.5s ease';
        }

        setTimeout(() => {
            this.loadingScreen.style.display = 'none';
            this.dispatchLoadComplete();
        }, 500);
    }
    
    dispatchLoadComplete() {

        const event = new CustomEvent('loadingComplete');
        document.dispatchEvent(event);

        this.logPerformance();
    }
    
    logPerformance() {
        const loadTime = Date.now() - this.startTime;
        console.log(`🚀 Portfolio loaded in ${loadTime}ms`);
        
        if (window.performance) {
            const navigationTiming = performance.getEntriesByType('navigation')[0];
            if (navigationTiming) {
                console.log('Performance Metrics:');
                console.log(`- DOM Content Loaded: ${navigationTiming.domContentLoadedEventEnd - navigationTiming.navigationStart}ms`);
                console.log(`- Complete Load: ${navigationTiming.loadEventEnd - navigationTiming.navigationStart}ms`);
            }
        }
    }

    show() {
        if (this.loadingScreen) {
            this.loadingScreen.style.display = 'flex';
            this.loadingScreen.classList.remove('fade-out');
            this.startTime = Date.now();
            this.startLoadingSimulation();
        }
    }

    setProgress(percentage) {
        this.updateProgress(Math.min(100, Math.max(0, percentage)));
    }

    destroy() {
        if (this.loadingScreen) {
            this.loadingScreen.remove();
        }
        
        const styles = document.getElementById('loading-styles');
        if (styles) {
            styles.remove();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {

    if (document.getElementById('loading-screen')) {
        window.loadingScreen = new LoadingScreen();
    } else {
        document.dispatchEvent(new CustomEvent('loadingComplete'));
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingScreen;
}

if (!document.querySelector('#loading-animations')) {
    const style = document.createElement('style');
    style.id = 'loading-animations';
    style.textContent = `
        @keyframes fadeOutDown {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(20px);
            }
        }
    `;
    document.head.appendChild(style);
}

document.addEventListener('loadingComplete', () => {
    console.log('Portfolio fully loaded and ready!');
    
    if (window.portfolioApp) {

    }
});

console.log('Loading screen module loaded');