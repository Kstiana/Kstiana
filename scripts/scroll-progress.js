class ScrollProgress {
    constructor() {
        this.progressBar = null;
        this.progressCircle = null;
        this.currentProgress = 0;
        this.isVisible = false;
        this.displayMode = 'bar';
        this.showOnScroll = true;
        this.hideOnTop = true;
        this.rafId = null;
        
        this.init();
    }
    
    init() {
        this.createProgressIndicator();
        this.bindEvents();
        this.loadPreferences();
        this.updateProgress();
        
        console.log('Scroll progress initialized');
    }
    
    createProgressIndicator() {
    this.progressBar = document.getElementById('scroll-progress-bar');

    if (!this.progressBar) {
        const progressContainer = document.createElement('div');
            progressContainer.className = 'scroll-progress';
            progressContainer.innerHTML = `
                <div class="scroll-progress__bar" id="scroll-progress-bar">
                    <div class="scroll-progress__fill"></div>
                    <div class="scroll-progress__percentage">0%</div>
                </div>
                <div class="scroll-progress__circle" id="scroll-progress-circle">
                    <svg width="60" height="60" viewBox="0 0 60 60">
                        <circle class="scroll-progress__circle-bg" cx="30" cy="30" r="28"/>
                        <circle class="scroll-progress__circle-fill" cx="30" cy="30" r="28"/>
                        <text class="scroll-progress__circle-text" x="30" y="35" text-anchor="middle">0%</text>
                    </svg>
                </div>
                <div class="scroll-progress__controls">
                    <button class="scroll-progress__toggle" id="progress-toggle" aria-label="Toggle progress indicator">
                        <i class="fas fa-chevron-up"></i>
                    </button>
                    <button class="scroll-progress__mode" id="progress-mode" aria-label="Change progress display mode">
                        <i class="fas fa-sliders-h"></i>
                    </button>
                </div>
            `;
            
            document.body.appendChild(progressContainer);
            this.progressBar = document.getElementById('scroll-progress-bar');
            this.progressCircle = document.getElementById('scroll-progress-circle');
        }
        
        this.addProgressStyles();
        this.updateDisplayMode();
    }
    
    bindEvents() {
        let ticking = false;
        const updateProgress = () => {
            this.updateProgress();
            ticking = false;
        };
        
        const requestTick = () => {
            if (!ticking) {
                this.rafId = requestAnimationFrame(updateProgress);
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', requestTick, { passive: true });
        window.addEventListener('resize', requestTick, { passive: true });
        
        const toggleBtn = document.getElementById('progress-toggle');
        const modeBtn = document.getElementById('progress-mode');
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleVisibility();
            });
        }
        
        if (modeBtn) {
            modeBtn.addEventListener('click', () => {
                this.cycleDisplayMode();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                this.toggleVisibility();
            }
            
            if (e.ctrlKey && e.shiftKey && e.key === 'p') {
                e.preventDefault();
                this.cycleDisplayMode();
            }
        });

        if (this.progressBar) {
            this.progressBar.addEventListener('click', (e) => {
                this.handleProgressClick(e);
            });
        }
        
        if (this.progressCircle) {
            this.progressCircle.addEventListener('click', (e) => {
                this.handleProgressClick(e);
            });
        }
    }
    
    updateProgress() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        
        this.currentProgress = Math.min(100, Math.max(0, progress));
        
        this.updateProgressDisplay();
        this.handleVisibility();
    }
    
    updateProgressDisplay() {
        const percentage = Math.round(this.currentProgress);

        const barFill = this.progressBar?.querySelector('.scroll-progress__fill');
        if (barFill) {
            barFill.style.width = `${this.currentProgress}%`;
        }

        const circleFill = this.progressCircle?.querySelector('.scroll-progress__circle-fill');
        if (circleFill) {
            const circumference = 2 * Math.PI * 28;
            const offset = circumference - (this.currentProgress / 100) * circumference;
            circleFill.style.strokeDasharray = `${circumference} ${circumference}`;
            circleFill.style.strokeDashoffset = offset;
        }

        const percentageElements = document.querySelectorAll('.scroll-progress__percentage, .scroll-progress__circle-text');
        percentageElements.forEach(element => {
            if (element.tagName === 'text') {
                element.textContent = `${percentage}%`;
            } else {
                element.textContent = `${percentage}%`;
            }
        });

        const progressElement = this.progressBar || this.progressCircle;
        if (progressElement) {
            progressElement.setAttribute('aria-valuenow', percentage);
            progressElement.setAttribute('aria-valuetext', `${percentage} percent scrolled`);
        }
    }
    
    handleVisibility() {
        if (!this.showOnScroll) return;
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const shouldShow = scrollTop > 100;
        
        if (shouldShow && !this.isVisible) {
            this.show();
        } else if (!shouldShow && this.isVisible && this.hideOnTop) {
            this.hide();
        }
    }
    
    handleProgressClick(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        
        this.scrollToPercentage(percentage);
    }
    
    scrollToPercentage(percentage) {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const targetScroll = scrollHeight * percentage;
        
        window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });
    }
    
    toggleVisibility() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
        
        this.savePreferences();
    }
    
    show() {
        this.isVisible = true;
        const progressContainer = document.querySelector('.scroll-progress');
        if (progressContainer) {
            progressContainer.classList.add('visible');
        }
    }
    
    hide() {
        this.isVisible = false;
        const progressContainer = document.querySelector('.scroll-progress');
        if (progressContainer) {
            progressContainer.classList.remove('visible');
        }
    }
    
    cycleDisplayMode() {
        const modes = ['bar', 'circle', 'minimal'];
        const currentIndex = modes.indexOf(this.displayMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        
        this.setDisplayMode(modes[nextIndex]);
        this.savePreferences();
    }
    
    setDisplayMode(mode) {
        this.displayMode = mode;
        this.updateDisplayMode();

        this.announce(`Progress indicator mode: ${mode}`);
    }
    
    updateDisplayMode() {
        const progressContainer = document.querySelector('.scroll-progress');
        if (!progressContainer) return;

        progressContainer.classList.remove('mode-bar', 'mode-circle', 'mode-minimal');

        progressContainer.classList.add(`mode-${this.displayMode}`);

        const controls = progressContainer.querySelector('.scroll-progress__controls');
        if (controls) {
            if (this.displayMode === 'minimal') {
                controls.style.opacity = '0';
                controls.style.pointerEvents = 'none';
            } else {
                controls.style.opacity = '1';
                controls.style.pointerEvents = 'all';
            }
        }
    }
    
    loadPreferences() {
        try {
            const preferences = JSON.parse(localStorage.getItem('scroll-progress-preferences') || '{}');
            
            if (preferences.displayMode) {
                this.displayMode = preferences.displayMode;
            }
            
            if (typeof preferences.isVisible !== 'undefined') {
                this.isVisible = preferences.isVisible;
            }
            
            if (typeof preferences.showOnScroll !== 'undefined') {
                this.showOnScroll = preferences.showOnScroll;
            }

            if (this.isVisible) {
                this.show();
            } else {
                this.hide();
            }
            
            this.updateDisplayMode();
            
        } catch (error) {
            console.warn('Failed to load scroll progress preferences:', error);
        }
    }
    
    savePreferences() {
        try {
            const preferences = {
                displayMode: this.displayMode,
                isVisible: this.isVisible,
                showOnScroll: this.showOnScroll,
                hideOnTop: this.hideOnTop
            };
            
            localStorage.setItem('scroll-progress-preferences', JSON.stringify(preferences));
        } catch (error) {
            console.warn('Failed to save scroll progress preferences:', error);
        }
    }
    
    announce(message) {

        let announcer = document.getElementById('progress-announcer');
        
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'progress-announcer';
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            document.body.appendChild(announcer);
        }
        
        announcer.textContent = message;

        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    }
    
    addProgressStyles() {
        if (!document.querySelector('#scroll-progress-styles')) {
            const style = document.createElement('style');
            style.id = 'scroll-progress-styles';
            style.textContent = this.getProgressStyles();
            document.head.appendChild(style);
        }
    }
    
    getProgressStyles() {
        return `
            .scroll-progress {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 4px;
                background: transparent;
                z-index: 10000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .scroll-progress.visible {
                opacity: 1;
                visibility: visible;
            }

            .scroll-progress.mode-bar {
                height: 4px;
            }
            
            .scroll-progress__bar {
                position: relative;
                width: 100%;
                height: 100%;
                background: var(--bg-secondary);
                overflow: hidden;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .scroll-progress__bar:hover {
                height: 6px;
                background: var(--bg-tertiary);
            }
            
            .scroll-progress__fill {
                height: 100%;
                background: var(--gradient-primary);
                width: 0%;
                transition: width 0.1s ease;
                position: relative;
            }
            
            .scroll-progress__fill::after {
                content: '';
                position: absolute;
                top: 0;
                right: 0;
                width: 20px;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3));
                animation: progress-shimmer 2s infinite;
            }
            
            .scroll-progress__percentage {
                position: absolute;
                top: 100%;
                right: 0;
                background: var(--bg-primary);
                color: var(--text-primary);
                padding: 0.25rem 0.5rem;
                border-radius: var(--radius-md);
                font-size: var(--text-xs);
                font-weight: 600;
                opacity: 0;
                transform: translateY(-10px);
                transition: all 0.3s ease;
                box-shadow: var(--shadow-md);
                border: 1px solid var(--border-color);
                pointer-events: none;
            }
            
            .scroll-progress__bar:hover .scroll-progress__percentage {
                opacity: 1;
                transform: translateY(5px);
            }

            .scroll-progress.mode-circle {
                top: auto;
                bottom: 2rem;
                right: 2rem;
                left: auto;
                width: auto;
                height: auto;
            }
            
            .scroll-progress__circle {
                display: none;
                cursor: pointer;
                filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
                transition: all 0.3s ease;
            }
            
            .scroll-progress.mode-circle .scroll-progress__circle {
                display: block;
            }
            
            .scroll-progress.mode-circle .scroll-progress__bar {
                display: none;
            }
            
            .scroll-progress__circle:hover {
                transform: scale(1.1);
            }
            
            .scroll-progress__circle-bg {
                fill: none;
                stroke: var(--bg-secondary);
                stroke-width: 2;
            }
            
            .scroll-progress__circle-fill {
                fill: none;
                stroke: var(--primary-color);
                stroke-width: 2;
                stroke-linecap: round;
                transform: rotate(-90deg);
                transform-origin: 50% 50%;
                transition: stroke-dashoffset 0.1s ease;
            }
            
            .scroll-progress__circle-text {
                fill: var(--text-primary);
                font-size: 10px;
                font-weight: 600;
                font-family: var(--font-primary);
            }

            .scroll-progress.mode-minimal {
                height: 2px;
            }
            
            .scroll-progress.mode-minimal .scroll-progress__bar {
                background: transparent;
            }
            
            .scroll-progress.mode-minimal .scroll-progress__fill {
                background: var(--primary-color);
            }
            
            .scroll-progress.mode-minimal .scroll-progress__fill::after {
                display: none;
            }
            
            .scroll-progress.mode-minimal .scroll-progress__percentage {
                display: none;
            }

            .scroll-progress__controls {
                position: absolute;
                top: 100%;
                right: 1rem;
                display: flex;
                gap: 0.5rem;
                margin-top: 0.5rem;
                opacity: 0;
                transition: all 0.3s ease;
            }
            
            .scroll-progress:hover .scroll-progress__controls {
                opacity: 1;
            }
            
            .scroll-progress__toggle,
            .scroll-progress__mode {
                width: 32px;
                height: 32px;
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: var(--radius-full);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: var(--text-primary);
                font-size: var(--text-sm);
                transition: all 0.3s ease;
                box-shadow: var(--shadow-sm);
            }
            
            .scroll-progress__toggle:hover,
            .scroll-progress__mode:hover {
                background: var(--primary-color);
                color: white;
                border-color: var(--primary-color);
                transform: scale(1.1);
            }
            
            .scroll-progress__toggle:active,
            .scroll-progress__mode:active {
                transform: scale(0.95);
            }

            .scroll-progress.mode-circle .scroll-progress__controls {
                top: auto;
                bottom: 100%;
                right: 0;
                margin-top: 0;
                margin-bottom: 0.5rem;
                flex-direction: column;
            }

            @keyframes progress-shimmer {
                0% {
                    transform: translateX(-20px);
                }
                100% {
                    transform: translateX(100%);
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .scroll-progress,
                .scroll-progress__fill,
                .scroll-progress__circle,
                .scroll-progress__controls,
                .scroll-progress__toggle,
                .scroll-progress__mode {
                    transition: none;
                }
                
                .scroll-progress__fill::after {
                    animation: none;
                }
            }

            @media (max-width: 768px) {
                .scroll-progress.mode-circle {
                    bottom: 1rem;
                    right: 1rem;
                }
                
                .scroll-progress__circle {
                    width: 50px;
                    height: 50px;
                }
                
                .scroll-progress__circle svg {
                    width: 50px;
                    height: 50px;
                }
                
                .scroll-progress__circle-bg,
                .scroll-progress__circle-fill {
                    stroke-width: 3;
                }
                
                .scroll-progress__circle-text {
                    font-size: 8px;
                }
                
                .scroll-progress__controls {
                    display: none;
                }
            }

            @media (prefers-contrast: high) {
                .scroll-progress__fill {
                    background: var(--text-primary);
                }
                
                .scroll-progress__circle-fill {
                    stroke: var(--text-primary);
                }
                
                .scroll-progress__bar {
                    background: var(--bg-primary);
                    border: 1px solid var(--text-primary);
                }
            }

            [data-theme="dark"] .scroll-progress__bar {
                background: rgba(255, 255, 255, 0.1);
            }
            
            [data-theme="dark"] .scroll-progress__circle-bg {
                stroke: rgba(255, 255, 255, 0.1);
            }

            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }

            .scroll-progress__toggle:focus-visible,
            .scroll-progress__mode:focus-visible {
                outline: 2px solid var(--primary-color);
                outline-offset: 2px;
            }

            @media print {
                .scroll-progress {
                    display: none !important;
                }
            }
        `;
    }

    getProgress() {
        return this.currentProgress;
    }
    
    setProgress(percentage) {
        this.currentProgress = Math.min(100, Math.max(0, percentage));
        this.updateProgressDisplay();
    }
    
    showTemporarily(duration = 2000) {
        this.show();
        setTimeout(() => {
            if (this.hideOnTop) {
                this.hide();
            }
        }, duration);
    }
    
    setBehavior(showOnScroll, hideOnTop) {
        this.showOnScroll = showOnScroll;
        this.hideOnTop = hideOnTop;
        this.savePreferences();
    }

    scrollTo(percentage) {
        this.scrollToPercentage(percentage / 100);
    }

    destroy() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        
        const progressContainer = document.querySelector('.scroll-progress');
        if (progressContainer) {
            progressContainer.remove();
        }

        window.removeEventListener('scroll', this.updateProgress);
        window.removeEventListener('resize', this.updateProgress);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.scrollProgress = new ScrollProgress();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScrollProgress;
}

console.log('Scroll progress module loaded');
        