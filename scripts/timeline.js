class Timeline {
    constructor() {
        this.timelineContainer = null;
        this.timelineItems = [];
        this.intersectionObserver = null;
        this.currentActiveItem = 0;
        
        this.init();
    }
    
    init() {
        this.timelineContainer = document.querySelector('.experience__timeline');
        if (!this.timelineContainer) {
            console.warn('Timeline container not found');
            return;
        }
        
        this.initializeTimeline();
        this.bindEvents();
        this.addTimelineStyles();
        
        console.log('Timeline initialized');
    }
    
    initializeTimeline() {
        this.timelineItems = Array.from(this.timelineContainer.querySelectorAll('.timeline-item'));
        
        if (this.timelineItems.length === 0) {
            this.loadDefaultTimeline();
            return;
        }
        
        this.setupAnimations();
        this.setupIntersectionObserver();
        this.activateFirstItem();
    }
    
    loadDefaultTimeline() {
        const defaultTimeline = [
            {
                date: '2024 - Present',
                title: 'Frontend Developer Journey',
                description: 'Building interactive web applications and mastering modern frontend technologies through hands-on projects.',
                icon: 'fas fa-code',
                tags: ['JavaScript', 'React', 'PWA']
            },
            {
                date: '2023 - 2024',
                title: 'Skill Development Phase',
                description: 'Focused on mastering JavaScript, CSS animations, responsive design, and Progressive Web Apps.',
                icon: 'fas fa-rocket',
                tags: ['CSS3', 'JavaScript', 'Responsive Design']
            },
            {
                date: '2022 - 2023',
                title: 'Learning Foundations',
                description: 'Started with HTML, CSS, and basic JavaScript. Built first projects and discovered passion for web development.',
                icon: 'fas fa-graduation-cap',
                tags: ['HTML5', 'CSS3', 'JavaScript']
            }
        ];
        
        this.renderTimeline(defaultTimeline);
        this.timelineItems = Array.from(this.timelineContainer.querySelectorAll('.timeline-item'));
        this.setupAnimations();
        this.setupIntersectionObserver();
    }
    
    renderTimeline(timelineData) {
        this.timelineContainer.innerHTML = timelineData.map((item, index) => `
            <div class="timeline-item" data-index="${index}">
                <div class="timeline-item__marker">
                    <i class="${item.icon || 'fas fa-circle'}"></i>
                </div>
                <div class="timeline-item__connector"></div>
                <div class="timeline-item__content">
                    <div class="timeline-item__date">${item.date}</div>
                    <h3 class="timeline-item__title">${item.title}</h3>
                    <p class="timeline-item__description">${item.description}</p>
                    ${item.tags ? `
                        <div class="timeline-item__tags">
                            ${item.tags.map(tag => `<span class="timeline-tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                    <div class="timeline-item__progress"></div>
                </div>
            </div>
        `).join('');
    }
    
    setupAnimations() {
        this.timelineItems.forEach((item, index) => {

            item.style.opacity = '0';
            item.style.transform = 'translateX(-30px)';
            item.style.transition = `all 0.6s ease ${index * 0.2}s`;

            item.addEventListener('mouseenter', () => this.handleItemHover(item, true));
            item.addEventListener('mouseleave', () => this.handleItemHover(item, false));

            item.addEventListener('click', () => this.handleItemClick(item, index));
        });
    }
    
    setupIntersectionObserver() {
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateTimelineItem(entry.target);
                    this.intersectionObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        this.timelineItems.forEach(item => {
            this.intersectionObserver.observe(item);
        });
    }
    
    animateTimelineItem(item) {
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';

        const progressBar = item.querySelector('.timeline-item__progress');
        if (progressBar) {
            setTimeout(() => {
                progressBar.style.width = '100%';
            }, 300);
        }

        const marker = item.querySelector('.timeline-item__marker');
        if (marker) {
            marker.classList.add('animated');
        }
    }
    
    handleItemHover(item, isHovering) {
        if (isHovering) {
            item.style.transform = 'translateX(10px)';
            item.style.boxShadow = 'var(--shadow-lg)';
            
            const marker = item.querySelector('.timeline-item__marker');
            if (marker) {
                marker.style.transform = 'scale(1.2)';
            }
        } else {
            const index = Array.from(this.timelineItems).indexOf(item);
            if (index !== this.currentActiveItem) {
                item.style.transform = 'translateX(0)';
                item.style.boxShadow = 'var(--shadow-sm)';
            }
            
            const marker = item.querySelector('.timeline-item__marker');
            if (marker && !marker.classList.contains('active')) {
                marker.style.transform = 'scale(1)';
            }
        }
    }
    
    handleItemClick(item, index) {
        this.timelineItems.forEach((timelineItem, i) => {
            timelineItem.classList.remove('active');
            const marker = timelineItem.querySelector('.timeline-item__marker');
            if (marker) {
                marker.classList.remove('active');
                marker.style.transform = i === index ? 'scale(1.2)' : 'scale(1)';
            }
        });
        
        item.classList.add('active');
        const marker = item.querySelector('.timeline-item__marker');
        if (marker) {
            marker.classList.add('active');
        }
        
        this.currentActiveItem = index;

        this.dispatchTimelineEvent('timelineItemSelected', { index, item });
    }
    
    activateFirstItem() {
        if (this.timelineItems.length > 0) {
            this.handleItemClick(this.timelineItems[0], 0);
        }
    }
    
    dispatchTimelineEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        this.timelineContainer.dispatchEvent(event);
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                this.navigateTimeline(1);
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                this.navigateTimeline(-1);
            }
        });
        
        const timelineLinks = document.querySelectorAll('a[href="#experience"]');
        timelineLinks.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(() => {
                    this.highlightCurrentItem();
                }, 500);
            });
        });
    }
    
    navigateTimeline(direction) {
        const newIndex = this.currentActiveItem + direction;
        if (newIndex >= 0 && newIndex < this.timelineItems.length) {
            this.handleItemClick(this.timelineItems[newIndex], newIndex);

            this.timelineItems[newIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
    
    highlightCurrentItem() {
        if (this.timelineItems.length > 0) {
            const rect = this.timelineContainer.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            this.timelineItems.forEach((item, index) => {
                const itemRect = item.getBoundingClientRect();
                if (itemRect.top < viewportHeight * 0.7 && itemRect.bottom > viewportHeight * 0.3) {
                    this.handleItemClick(item, index);
                }
            });
        }
    }
    
    addTimelineStyles() {
        if (!document.querySelector('#timeline-styles')) {
            const style = document.createElement('style');
            style.id = 'timeline-styles';
            style.textContent = this.getTimelineStyles();
            document.head.appendChild(style);
        }
    }
    
    getTimelineStyles() {
        return `
            .experience__timeline {
                position: relative;
                max-width: 800px;
                margin: 0 auto;
                padding: var(--space-6) 0;
            }
            
            .timeline-item {
                position: relative;
                display: flex;
                margin-bottom: var(--space-6);
                opacity: 0;
                transform: translateX(-30px);
            }
            
            .timeline-item:last-child {
                margin-bottom: 0;
            }
            
            .timeline-item__marker {
                position: relative;
                width: 60px;
                height: 60px;
                background: var(--gradient-primary);
                border-radius: var(--radius-full);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: var(--text-lg);
                z-index: 2;
                transition: all 0.3s ease;
                flex-shrink: 0;
                box-shadow: var(--shadow-md);
            }
            
            .timeline-item__marker.animated {
                animation: pulse 2s infinite;
            }
            
            .timeline-item__marker.active {
                background: var(--gradient-secondary);
                box-shadow: var(--shadow-lg);
            }
            
            .timeline-item__connector {
                position: absolute;
                top: 60px;
                left: 30px;
                width: 2px;
                height: calc(100% + var(--space-2));
                background: var(--gradient-primary);
                z-index: 1;
            }
            
            .timeline-item:last-child .timeline-item__connector {
                display: none;
            }
            
            .timeline-item__content {
                flex: 1;
                margin-left: var(--space-6);
                padding: var(--space-3);
                background: var(--bg-primary);
                border-radius: var(--radius-2xl);
                border: 1px solid var(--border-color);
                box-shadow: var(--shadow-sm);
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .timeline-item__content::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 4px;
                height: 100%;
                background: var(--gradient-primary);
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .timeline-item.active .timeline-item__content::before {
                opacity: 1;
            }
            
            .timeline-item__content:hover {
                box-shadow: var(--shadow-lg);
                transform: translateY(-2px);
            }
            
            .timeline-item__date {
                font-size: var(--text-sm);
                font-weight: 600;
                color: var(--primary-color);
                margin-bottom: var(--space-2);
            }
            
            .timeline-item__title {
                font-size: var(--text-xl);
                font-weight: 700;
                color: var(--text-primary);
                margin-bottom: var(--space-3);
            }
            
            .timeline-item__description {
                color: var(--text-secondary);
                line-height: 1.6;
                margin-bottom: var(--space-4);
            }
            
            .timeline-item__tags {
                display: flex;
                flex-wrap: wrap;
                gap: var(--space-2);
                margin-bottom: var(--space-4);
            }
            
            .timeline-tag {
                padding: var(--space-1) var(--space-3);
                background: var(--bg-secondary);
                color: var(--text-primary);
                border-radius: var(--radius-full);
                font-size: var(--text-xs);
                font-weight: 500;
                border: 1px solid var(--border-color);
            }
            
            .timeline-item__progress {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 0%;
                height: 3px;
                background: var(--gradient-primary);
                transition: width 1.5s ease;
            }
            
            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                    box-shadow: var(--shadow-md);
                }
                50% {
                    transform: scale(1.05);
                    box-shadow: var(--shadow-lg);
                }
            }

            @media (max-width: 768px) {
                .timeline-item {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .timeline-item__content {
                    margin-left: 0;
                    margin-top: var(--space-4);
                    width: 100%;
                }
                
                .timeline-item__connector {
                    left: 30px;
                    top: 60px;
                    height: calc(100% + var(--space-8));
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .timeline-item {
                    transition: none;
                }
                
                .timeline-item__marker.animated {
                    animation: none;
                }
                
                .timeline-item__progress {
                    transition: none;
                }
            }

            [data-theme="dark"] .timeline-item__content {
                background: var(--bg-secondary);
            }

            [data-theme="high-contrast"] .timeline-item__marker {
                border: 2px solid white;
            }
        `;
    }

    addTimelineItem(itemData) {
        const newItem = this.createTimelineItem(itemData);
        this.timelineContainer.appendChild(newItem);
        this.timelineItems = Array.from(this.timelineContainer.querySelectorAll('.timeline-item'));
        this.setupAnimations();
        this.intersectionObserver.observe(newItem);
    }
    
    createTimelineItem(itemData) {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
            <div class="timeline-item__marker">
                <i class="${itemData.icon || 'fas fa-circle'}"></i>
            </div>
            <div class="timeline-item__connector"></div>
            <div class="timeline-item__content">
                <div class="timeline-item__date">${itemData.date}</div>
                <h3 class="timeline-item__title">${itemData.title}</h3>
                <p class="timeline-item__description">${itemData.description}</p>
                ${itemData.tags ? `
                    <div class="timeline-item__tags">
                        ${itemData.tags.map(tag => `<span class="timeline-tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="timeline-item__progress"></div>
            </div>
        `;
        
        return item;
    }
    
    getActiveItem() {
        return this.currentActiveItem;
    }
    
    setActiveItem(index) {
        if (index >= 0 && index < this.timelineItems.length) {
            this.handleItemClick(this.timelineItems[index], index);
        }
    }

    destroy() {
        if (this.intersectionObserver) {
            this.timelineItems.forEach(item => {
                this.intersectionObserver.unobserve(item);
            });
            this.intersectionObserver.disconnect();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.timeline = new Timeline();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Timeline;
}

console.log('Timeline module loaded');