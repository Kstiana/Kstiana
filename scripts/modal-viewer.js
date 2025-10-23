class ModalViewer {
    constructor() {
        this.modal = document.getElementById('project-modal');
        this.modalBody = document.getElementById('modal-body');
        this.modalClose = document.getElementById('modal-close');
        this.currentProject = null;
        this.currentImageIndex = 0;
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        if (!this.modal) {
            console.warn('Modal elements not found. Creating modal dynamically.');
            this.createModal();
        }
        
        this.bindEvents();
        this.addModalStyles();
        console.log('🪟 Modal viewer initialized');
    }
    
    createModal() {
        this.modal = document.createElement('div');
        this.modal.id = 'project-modal';
        this.modal.className = 'modal';
        this.modal.setAttribute('aria-hidden', 'true');
        this.modal.setAttribute('role', 'dialog');
        this.modal.setAttribute('aria-labelledby', 'modal-title');
        
        this.modal.innerHTML = `
            <div class="modal__content">
                <button class="modal__close" id="modal-close" aria-label="Close modal">
                    <i class="fas fa-times"></i>
                </button>
                <div class="modal__body" id="modal-body"></div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        this.modalBody = document.getElementById('modal-body');
        this.modalClose = document.getElementById('modal-close');
    }
    
    bindEvents() {
        if (this.modalClose) {
            this.modalClose.addEventListener('click', () => this.close());
        }
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
            
            if (this.modal.classList.contains('active') && this.currentProject) {
                this.handleKeyboardNavigation(e);
            }
        });
        
        this.modal.addEventListener('transitionend', () => {
            if (this.modal.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }
    
    openProject(project) {
        if (this.isAnimating) return;
        
        this.currentProject = project;
        this.currentImageIndex = 0;
        this.isAnimating = true;

        this.renderProjectContent(project);

        this.modal.setAttribute('aria-hidden', 'false');
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            this.modal.focus();
            this.isAnimating = false;
        }, 300);
        
        this.trackModalOpen(project);
    }
    
    renderProjectContent(project) {
        if (!this.modalBody) return;
        
        this.modalBody.innerHTML = this.generateModalContent(project);
        
        if (project.images && project.images.length > 1) {
            this.initializeGallery();
        }
        
        this.initializeTechBadges();

        this.initializeSmoothScroll();
    }
    
    generateModalContent(project) {
        return `
            <article class="modal-project" data-project-id="${project.id}">
                <!-- Header Section -->
                <header class="modal-project__header">
                    <div class="modal-project__meta">
                        ${project.featured ? '<span class="modal-project__badge featured">⭐ Featured</span>' : ''}
                        <span class="modal-project__badge status">${project.status}</span>
                        <span class="modal-project__badge year">${project.year}</span>
                    </div>
                    
                    <h1 id="modal-title" class="modal-project__title">${project.title}</h1>
                    <p class="modal-project__subtitle">${project.subtitle}</p>
                    
                    <div class="modal-project__links">
                        <a href="${project.demoUrl}" target="_blank" class="button button--primary" aria-label="View live demo of ${project.title}">
                            <i class="fas fa-external-link-alt"></i>
                            <span>Live Demo</span>
                        </a>
                        <a href="${project.githubUrl}" target="_blank" class="button button--secondary" aria-label="View source code of ${project.title}">
                            <i class="fab fa-github"></i>
                            <span>Source Code</span>
                        </a>
                        <button class="button button--ghost" onclick="window.modalViewer.copyProjectLink('${project.id}')" aria-label="Copy project link to clipboard">
                            <i class="fas fa-link"></i>
                            <span>Copy Link</span>
                        </button>
                    </div>
                </header>
                
                ${project.images && project.images.length > 0 ? `
                <section class="modal-project__gallery" aria-label="Project screenshots">
                    <div class="gallery__main">
                        <img src="${project.images[0]}" 
                             alt="${project.title} screenshot" 
                             class="gallery__image active" 
                             id="gallery-main-image"
                             loading="lazy">
                        
                        ${project.images.length > 1 ? `
                        <button class="gallery__nav gallery__nav--prev" aria-label="Previous image">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="gallery__nav gallery__nav--next" aria-label="Next image">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        ` : ''}
                    </div>
                    
                    ${project.images.length > 1 ? `
                    <div class="gallery__thumbs">
                        ${project.images.map((image, index) => `
                            <button class="gallery__thumb ${index === 0 ? 'active' : ''}" 
                                    data-index="${index}"
                                    aria-label="View image ${index + 1} of ${project.images.length}">
                                <img src="${image}" alt="Thumbnail ${index + 1}" loading="lazy">
                            </button>
                        `).join('')}
                    </div>
                    ` : ''}
                </section>
                ` : ''}
                
                <!-- Content Sections -->
                <div class="modal-project__content">
                    <!-- Description -->
                    <section class="modal-project__section">
                        <h2 class="section__title">
                            <i class="fas fa-info-circle"></i>
                            Project Overview
                        </h2>
                        <div class="section__content">
                            <p>${project.fullDescription || project.description}</p>
                        </div>
                    </section>
                    
                    <!-- Technologies -->
                    <section class="modal-project__section">
                        <h2 class="section__title">
                            <i class="fas fa-code"></i>
                            Technologies Used
                        </h2>
                        <div class="section__content">
                            <div class="tech-grid">
                                ${project.technologies.map(tech => `
                                    <div class="tech-item" data-tech="${tech.toLowerCase()}">
                                        <span class="tech-badge">${tech}</span>
                                        <div class="tech-tooltip">${this.getTechDescription(tech)}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </section>
                    
                    <!-- Challenges -->
                    <section class="modal-project__section">
                        <h2 class="section__title">
                            <i class="fas fa-puzzle-piece"></i>
                            Challenges & Solutions
                        </h2>
                        <div class="section__content">
                            <ul class="challenges-list">
                                ${project.challenges ? project.challenges.map(challenge => `
                                    <li class="challenge-item">
                                        <i class="fas fa-check-circle"></i>
                                        <span>${challenge}</span>
                                    </li>
                                `).join('') : '<li>No specific challenges documented.</li>'}
                            </ul>
                        </div>
                    </section>
                    
                    <!-- Achievements -->
                    <section class="modal-project__section">
                        <h2 class="section__title">
                            <i class="fas fa-trophy"></i>
                            Key Achievements
                        </h2>
                        <div class="section__content">
                            <ul class="achievements-list">
                                ${project.achievements ? project.achievements.map(achievement => `
                                    <li class="achievement-item">
                                        <i class="fas fa-star"></i>
                                        <span>${achievement}</span>
                                    </li>
                                `).join('') : '<li>Project completed successfully.</li>'}
                            </ul>
                        </div>
                    </section>
                    
                    <!-- Project Details -->
                    <section class="modal-project__section">
                        <h2 class="section__title">
                            <i class="fas fa-clipboard-list"></i>
                            Project Details
                        </h2>
                        <div class="section__content">
                            <div class="details-grid">
                                <div class="detail-item">
                                    <strong>Categories:</strong>
                                    <span>${project.categories.map(cat => this.formatCategory(cat)).join(', ')}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Tags:</strong>
                                    <div class="tags-list">
                                        ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                                    </div>
                                </div>
                                <div class="detail-item">
                                    <strong>Project Type:</strong>
                                    <span>${this.getProjectType(project.categories)}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                
                <!-- Footer -->
                <footer class="modal-project__footer">
                    <div class="modal-project__actions">
                        <a href="${project.demoUrl}" target="_blank" class="button button--primary button--large">
                            <i class="fas fa-rocket"></i>
                            <span>Launch Project</span>
                        </a>
                        <a href="${project.githubUrl}" target="_blank" class="button button--secondary">
                            <i class="fab fa-github"></i>
                            <span>Explore Code</span>
                        </a>
                    </div>
                    
                    <div class="modal-project__share">
                        <span>Share this project:</span>
                        <div class="share-buttons">
                            <button class="share-btn" onclick="window.modalViewer.shareProject('twitter', '${project.id}')" aria-label="Share on Twitter">
                                <i class="fab fa-twitter"></i>
                            </button>
                            <button class="share-btn" onclick="window.modalViewer.shareProject('linkedin', '${project.id}')" aria-label="Share on LinkedIn">
                                <i class="fab fa-linkedin"></i>
                            </button>
                            <button class="share-btn" onclick="window.modalViewer.copyProjectLink('${project.id}')" aria-label="Copy link">
                                <i class="fas fa-link"></i>
                            </button>
                        </div>
                    </div>
                </footer>
            </article>
        `;
    }
    
    initializeGallery() {
        const mainImage = document.getElementById('gallery-main-image');
        const prevButton = document.querySelector('.gallery__nav--prev');
        const nextButton = document.querySelector('.gallery__nav--next');
        const thumbnails = document.querySelectorAll('.gallery__thumb');
        
        if (prevButton) {
            prevButton.addEventListener('click', () => this.navigateGallery(-1));
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', () => this.navigateGallery(1));
        }
        
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                const index = parseInt(thumb.getAttribute('data-index'));
                this.showImage(index);
            });
        });
        
        if (mainImage) {
            let startX = 0;
            
            mainImage.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            });
            
            mainImage.addEventListener('touchend', (e) => {
                const endX = e.changedTouches[0].clientX;
                const diff = startX - endX;
                
                if (Math.abs(diff) > 50) { 
                    if (diff > 0) {
                        this.navigateGallery(1); 
                    } else {
                        this.navigateGallery(-1); 
                    }
                }
            });
        }
    }
    
    navigateGallery(direction) {
        if (!this.currentProject || !this.currentProject.images) return;
        
        const totalImages = this.currentProject.images.length;
        let newIndex = this.currentImageIndex + direction;
        
        if (newIndex < 0) newIndex = totalImages - 1;
        if (newIndex >= totalImages) newIndex = 0;
        
        this.showImage(newIndex);
    }
    
    showImage(index) {
        if (!this.currentProject || !this.currentProject.images) return;
        
        const mainImage = document.getElementById('gallery-main-image');
        const thumbnails = document.querySelectorAll('.gallery__thumb');
        
        if (mainImage) {
            mainImage.style.opacity = '0';
            
            setTimeout(() => {
                mainImage.src = this.currentProject.images[index];
                mainImage.alt = `${this.currentProject.title} screenshot ${index + 1}`;
                mainImage.style.opacity = '1';
            }, 200);
        }
        
        thumbnails.forEach(thumb => thumb.classList.remove('active'));
        if (thumbnails[index]) {
            thumbnails[index].classList.add('active');
        }
        
        this.currentImageIndex = index;
    }
    
    initializeTechBadges() {
        const techItems = document.querySelectorAll('.tech-item');
        
        techItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const tooltip = item.querySelector('.tech-tooltip');
                if (tooltip) {
                    tooltip.style.opacity = '1';
                    tooltip.style.visibility = 'visible';
                }
            });
            
            item.addEventListener('mouseleave', () => {
                const tooltip = item.querySelector('.tech-tooltip');
                if (tooltip) {
                    tooltip.style.opacity = '0';
                    tooltip.style.visibility = 'hidden';
                }
            });
        });
    }
    
    initializeSmoothScroll() {
        const modalContent = this.modalBody;
        if (modalContent) {
            modalContent.addEventListener('wheel', (e) => {
                e.stopPropagation(); 
            });
        }
    }
    
    close() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.modal.classList.remove('active');
        this.modal.setAttribute('aria-hidden', 'true');
        
        setTimeout(() => {
            document.body.style.overflow = '';
            this.isAnimating = false;
            
            const activeElement = document.activeElement;
            if (activeElement && activeElement.classList.contains('project-card__more')) {
                activeElement.focus();
            }
        }, 300);
    }
    
    getTechDescription(tech) {
        const descriptions = {
            'HTML5': 'Semantic markup, accessibility, modern HTML features',
            'CSS3': 'Responsive design, animations, Flexbox, Grid, custom properties',
            'JavaScript (ES6+)': 'Modern JavaScript with classes, modules, async/await',
            'Vanilla JavaScript': 'Pure JavaScript without frameworks',
            'LocalStorage': 'Client-side data persistence',
            'Service Workers': 'Offline functionality and caching',
            'Web App Manifest': 'PWA installability and app-like experience',
            'IndexedDB': 'Client-side database for complex data',
            'Canvas API': 'Dynamic graphics and image generation',
            'Minimax Algorithm': 'AI decision-making for game opponents'
        };
        
        return descriptions[tech] || 'Technology used in this project';
    }
    
    formatCategory(category) {
        const categories = {
            'pwa': 'Progressive Web App',
            'ai': 'Artificial Intelligence',
            'game': 'Game Development',
            'tool': 'Web Tool',
            'creative': 'Creative Project',
            'education': 'Educational',
            'design': 'Design-focused'
        };
        
        return categories[category] || category;
    }
    
    getProjectType(categories) {
        if (categories.includes('pwa')) return 'Progressive Web Application';
        if (categories.includes('game')) return 'Web Game';
        if (categories.includes('tool')) return 'Web Tool';
        if (categories.includes('ai')) return 'AI-powered Application';
        return 'Web Application';
    }
    
    copyProjectLink(projectId) {
        const project = this.currentProject;
        const url = `${window.location.origin}${window.location.pathname}#project-${projectId}`;
        
        navigator.clipboard.writeText(url).then(() => {
            this.showNotification('Project link copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy link', 'error');
        });
    }
    
    shareProject(platform, projectId) {
        const project = this.currentProject;
        const url = encodeURIComponent(`${window.location.origin}${window.location.pathname}#project-${projectId}`);
        const text = encodeURIComponent(`Check out ${project.title} - ${project.subtitle}`);
        
        const shareUrls = {
            twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
        };
        
        if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `modal-notification modal-notification--${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    handleKeyboardNavigation(e) {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.navigateGallery(-1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.navigateGallery(1);
                break;
            case 'Home':
                e.preventDefault();
                this.showImage(0);
                break;
            case 'End':
                e.preventDefault();
                this.showImage(this.currentProject.images.length - 1);
                break;
        }
    }
    
    trackModalOpen(project) {
        console.log(`Modal opened for project: ${project.title}`);
    }
    
    addModalStyles() {
        if (!document.querySelector('#modal-viewer-styles')) {
            const style = document.createElement('style');
            style.id = 'modal-viewer-styles';
            style.textContent = this.getModalStyles();
            document.head.appendChild(style);
        }
    }
    
    getModalStyles() {
        return `
            .modal-project {
                max-width: 100%;
            }
            
            .modal-project__header {
                margin-bottom: 2rem;
                border-bottom: 1px solid var(--border-color);
                padding-bottom: 2rem;
            }
            
            .modal-project__meta {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1rem;
                flex-wrap: wrap;
            }
            
            .modal-project__badge {
                padding: 0.25rem 0.75rem;
                border-radius: var(--radius-full);
                font-size: var(--text-xs);
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            .modal-project__badge.featured {
                background: var(--gradient-primary);
                color: white;
            }
            
            .modal-project__badge.status {
                background: var(--bg-secondary);
                color: var(--text-secondary);
                border: 1px solid var(--border-color);
            }
            
            .modal-project__badge.year {
                background: var(--secondary-color);
                color: white;
            }
            
            .modal-project__title {
                font-size: var(--text-3xl);
                margin-bottom: 0.5rem;
                color: var(--text-primary);
            }
            
            .modal-project__subtitle {
                font-size: var(--text-lg);
                color: var(--text-secondary);
                margin-bottom: 2rem;
            }
            
            .modal-project__links {
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
            }
            
            /* Gallery Styles */
            .modal-project__gallery {
                margin-bottom: 2rem;
            }
            
            .gallery__main {
                position: relative;
                border-radius: var(--radius-xl);
                overflow: hidden;
                margin-bottom: 1rem;
                background: var(--bg-secondary);
            }
            
            .gallery__image {
                width: 100%;
                height: 400px;
                object-fit: contain;
                transition: opacity 0.3s ease;
            }
            
            .gallery__nav {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(255, 255, 255, 0.9);
                border: none;
                width: 48px;
                height: 48px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                color: var(--text-primary);
            }
            
            .gallery__nav:hover {
                background: var(--primary-color);
                color: white;
                transform: translateY(-50%) scale(1.1);
            }
            
            .gallery__nav--prev {
                left: 1rem;
            }
            
            .gallery__nav--next {
                right: 1rem;
            }
            
            .gallery__thumbs {
                display: flex;
                gap: 0.5rem;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .gallery__thumb {
                width: 60px;
                height: 60px;
                border: 2px solid transparent;
                border-radius: var(--radius-md);
                overflow: hidden;
                cursor: pointer;
                transition: all 0.3s ease;
                background: none;
                padding: 0;
            }
            
            .gallery__thumb.active {
                border-color: var(--primary-color);
            }
            
            .gallery__thumb:hover {
                transform: scale(1.05);
            }
            
            .gallery__thumb img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .modal-project__section {
                margin-bottom: 2rem;
            }
            
            .section__title {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: var(--text-xl);
                margin-bottom: 1rem;
                color: var(--text-primary);
            }
            
            .section__title i {
                color: var(--primary-color);
            }
            
            .tech-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }
            
            .tech-item {
                position: relative;
            }
            
            .tech-badge {
                display: inline-block;
                padding: 0.5rem 1rem;
                background: var(--bg-secondary);
                color: var(--text-primary);
                border-radius: var(--radius-md);
                font-size: var(--text-sm);
                font-weight: 500;
                border: 1px solid var(--border-color);
                transition: all 0.3s ease;
            }
            
            .tech-badge:hover {
                background: var(--primary-color);
                color: white;
                transform: translateY(-1px);
            }
            
            .tech-tooltip {
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: var(--gray-800);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: var(--radius-md);
                font-size: var(--text-sm);
                white-space: nowrap;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                z-index: 10;
                margin-bottom: 0.5rem;
            }
            
            .tech-tooltip::after {
                content: '';
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                border: 5px solid transparent;
                border-top-color: var(--gray-800);
            }
            
            .challenges-list,
            .achievements-list {
                list-style: none;
                padding: 0;
            }
            
            .challenge-item,
            .achievement-item {
                display: flex;
                align-items: flex-start;
                gap: 0.75rem;
                margin-bottom: 0.75rem;
                padding: 0.75rem;
                background: var(--bg-secondary);
                border-radius: var(--radius-md);
                transition: background-color 0.3s ease;
            }
            
            .challenge-item:hover,
            .achievement-item:hover {
                background: var(--bg-tertiary);
            }
            
            .challenge-item i {
                color: var(--primary-color);
                margin-top: 0.125rem;
            }
            
            .achievement-item i {
                color: var(--secondary-color);
                margin-top: 0.125rem;
            }
            
            .details-grid {
                display: grid;
                gap: 1rem;
            }
            
            .detail-item {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .detail-item strong {
                color: var(--text-primary);
                font-weight: 600;
            }
            
            .tags-list {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }
            
            .tag {
                padding: 0.25rem 0.75rem;
                background: var(--bg-secondary);
                color: var(--text-secondary);
                border-radius: var(--radius-full);
                font-size: var(--text-xs);
                font-weight: 500;
            }
            
            .modal-project__footer {
                border-top: 1px solid var(--border-color);
                padding-top: 2rem;
                margin-top: 2rem;
            }
            
            .modal-project__actions {
                display: flex;
                gap: 1rem;
                margin-bottom: 2rem;
                flex-wrap: wrap;
            }
            
            .button--large {
                padding: 1rem 2rem;
                font-size: var(--text-lg);
            }
            
            .button--ghost {
                background: transparent;
                color: var(--text-secondary);
                border: 1px solid var(--border-color);
            }
            
            .button--ghost:hover {
                background: var(--bg-secondary);
                color: var(--text-primary);
            }
            
            .modal-project__share {
                display: flex;
                align-items: center;
                gap: 1rem;
                flex-wrap: wrap;
            }
            
            .share-buttons {
                display: flex;
                gap: 0.5rem;
            }
            
            .share-btn {
                width: 40px;
                height: 40px;
                border: 1px solid var(--border-color);
                background: var(--bg-primary);
                border-radius: var(--radius-full);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                color: var(--text-secondary);
            }
            
            .share-btn:hover {
                background: var(--primary-color);
                color: white;
                transform: scale(1.1);
            }
            
            .modal__content {
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .modal-notification {
                animation: slideInRight 0.3s ease;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            @media (max-width: 768px) {
                .modal-project__title {
                    font-size: var(--text-2xl);
                }
                
                .modal-project__links {
                    flex-direction: column;
                }
                
                .modal-project__actions {
                    flex-direction: column;
                }
                
                .gallery__image {
                    height: 300px;
                }
                
                .gallery__nav {
                    width: 40px;
                    height: 40px;
                }
                
                .modal-project__share {
                    flex-direction: column;
                    align-items: flex-start;
                }
            }
            
            @media (prefers-reduced-motion: reduce) {
                .gallery__image,
                .gallery__nav,
                .tech-badge,
                .share-btn {
                    transition: none;
                }
            }
        `;
    }
    
    openById(projectId) {
        const project = window.projectData.find(p => p.id === projectId);
        if (project) {
            this.openProject(project);
        }
    }
    
    isOpen() {
        return this.modal.classList.contains('active');
    }
    
    destroy() {
        if (this.modal && this.modal.parentNode) {
            this.modal.parentNode.removeChild(this.modal);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.modalViewer = new ModalViewer();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModalViewer;
}

console.log('Modal viewer module loaded');