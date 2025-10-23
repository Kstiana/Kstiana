class ProjectFilter {
    constructor() {
        this.projectsGrid = document.getElementById('projects-grid');
        this.filterButtons = document.querySelectorAll('.projects__filter');
        this.activeFilters = new Set(['all']);
        this.currentSort = 'featured';
        this.allProjects = [];
        
        this.init();
    }
    
    init() {
        if (!this.projectsGrid) {
            console.warn('Projects grid element not found');
            return;
        }
        
        this.loadProjects();
        this.initializeFilterButtons();
        this.initializeSorting();
        this.renderProjects();
        
        console.log('Project filter initialized');
    }
    
    loadProjects() {

        if (typeof window.projectData !== 'undefined') {
            this.allProjects = window.projectData;
        } else {
            console.warn('Project data not found. Using fallback data.');
            this.allProjects = this.getFallbackProjects();
        }
    }
    
    initializeFilterButtons() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.handleFilterClick(button);
            });
            
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleFilterClick(button);
                }
            });
        });
        
        this.updateFilterButtons();
    }
    
    handleFilterClick(button) {
        const filter = button.getAttribute('data-filter');
        
        if (filter === 'all') {
            this.activeFilters.clear();
            this.activeFilters.add('all');
        } else {

            this.activeFilters.delete('all');
            
            if (this.activeFilters.has(filter)) {
                this.activeFilters.delete(filter);

                if (this.activeFilters.size === 0) {
                    this.activeFilters.add('all');
                }
            } else {
                this.activeFilters.add(filter);
            }
        }
        
        this.updateFilterButtons();
        this.renderProjects();
        this.animateFilterChange();
    }
    
    updateFilterButtons() {
        this.filterButtons.forEach(button => {
            const filter = button.getAttribute('data-filter');
            
            if (filter === 'all') {
                button.classList.toggle('active', this.activeFilters.has('all'));
            } else {
                button.classList.toggle('active', this.activeFilters.has(filter));
            }
        });
    }
    
    initializeSorting() {

        if (!document.getElementById('project-sort')) {
            this.createSortDropdown();
        }
        
        const sortSelect = document.getElementById('project-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.renderProjects();
                this.animateSortChange();
            });
        }
    }
    
    createSortDropdown() {
        const sortContainer = document.createElement('div');
        sortContainer.className = 'projects__sort';
        sortContainer.innerHTML = `
            <label for="project-sort" class="sort-label">Sort by:</label>
            <select id="project-sort" class="sort-select" aria-label="Sort projects">
                <option value="featured">Featured First</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Alphabetical</option>
            </select>
        `;
        
        const filtersContainer = document.querySelector('.projects__filters');
        if (filtersContainer && filtersContainer.nextSibling) {
            filtersContainer.parentNode.insertBefore(sortContainer, filtersContainer.nextSibling);
        } else if (filtersContainer) {
            filtersContainer.parentNode.appendChild(sortContainer);
        }
        
        this.addSortStyles();
    }
    
    getFilteredProjects() {
        let filteredProjects = [...this.allProjects];
        
        if (!this.activeFilters.has('all')) {
            filteredProjects = filteredProjects.filter(project => 
                project.categories.some(category => this.activeFilters.has(category))
            );
        }
        
        filteredProjects = this.sortProjects(filteredProjects, this.currentSort);
        
        return filteredProjects;
    }
    
    sortProjects(projects, sortBy) {
        const sortedProjects = [...projects];
        
        switch (sortBy) {
            case 'featured':
                return sortedProjects.sort((a, b) => {
                    if (a.featured && !b.featured) return -1;
                    if (!a.featured && b.featured) return 1;
                    return b.year - a.year; 
                });
                
            case 'newest':
                return sortedProjects.sort((a, b) => b.year - a.year);
                
            case 'oldest':
                return sortedProjects.sort((a, b) => a.year - b.year);
                
            case 'name':
                return sortedProjects.sort((a, b) => a.title.localeCompare(b.title));
                
            default:
                return sortedProjects;
        }
    }
    
    renderProjects() {
        const filteredProjects = this.getFilteredProjects();
        
        if (typeof window.projectUtils !== 'undefined' && window.projectUtils.generateProjectCard) {
            this.projectsGrid.innerHTML = filteredProjects
                .map(project => window.projectUtils.generateProjectCard(project))
                .join('');
        } else {
        
            this.projectsGrid.innerHTML = filteredProjects
                .map(project => this.generateProjectCardFallback(project))
                .join('');
        }

        this.initializeProjectModals();
 this.updateProjectCount(filteredProjects.length);

        this.animateNewCards();
    }
    
    generateProjectCardFallback(project) {
        return `
            <div class="project-card" data-categories="${project.categories.join(',')}" data-tags="${project.tags.join(',')}" data-id="${project.id}">
                <div class="project-card__content">
                    <div class="project-card__header">
                        <h3 class="project-card__title">${project.title}</h3>
                        ${project.featured ? '<span class="project-card__featured">⭐ Featured</span>' : ''}
                    </div>
                    <p class="project-card__subtitle">${project.subtitle}</p>
                    <p class="project-card__description">${project.description}</p>
                    <div class="project-card__tags">
                        ${project.tags.map(tag => `<span class="project-card__tag">${tag}</span>`).join('')}
                    </div>
                    <div class="project-card__meta">
                        <span class="project-card__year">${project.year}</span>
                        <span class="project-card__status">${project.status}</span>
                    </div>
                    <div class="project-card__links">
                        <a href="${project.demoUrl}" target="_blank" class="project-card__link" aria-label="Live demo of ${project.title}">
                            <i class="fas fa-external-link-alt"></i>
                            <span>Live Demo</span>
                        </a>
                        <a href="${project.githubUrl}" target="_blank" class="project-card__link" aria-label="GitHub repository for ${project.title}">
                            <i class="fab fa-github"></i>
                            <span>Code</span>
                        </a>
                        <button class="project-card__link project-card__more" data-project-id="${project.id}" aria-label="View more details about ${project.title}">
                            <i class="fas fa-info-circle"></i>
                            <span>Details</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    initializeProjectModals() {
        const projectCards = this.projectsGrid.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            card.addEventListener('click', (e) => {

                if (e.target.closest('a')) return;
                
                const projectId = card.getAttribute('data-id');
                this.openProjectModal(projectId);
            });
        });
    }
    
    openProjectModal(projectId) {
        const project = this.allProjects.find(p => p.id === projectId);
        if (!project) return;

        if (window.modalViewer) {
            window.modalViewer.openProject(project);
        } else {
            this.openBasicModal(project);
        }
    }
    
    openBasicModal(project) {

        const modalHtml = `
            <div class="basic-modal" style="
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0,0,0,0.8); display: flex; align-items: center; 
                justify-content: center; z-index: 2000;
            ">
                <div style="
                    background: white; padding: 2rem; border-radius: 1rem; 
                    max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;
                ">
                    <h2>${project.title}</h2>
                    <p>${project.description}</p>
                    <button onclick="this.closest('.basic-modal').remove()">Close</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    
    updateProjectCount(count) {
        let countElement = document.getElementById('project-count');
        
        if (!countElement) {
            countElement = document.createElement('div');
            countElement.id = 'project-count';
            countElement.className = 'projects__count';
            
            const filtersContainer = document.querySelector('.projects__filters');
            if (filtersContainer && filtersContainer.parentNode) {
                filtersContainer.parentNode.insertBefore(countElement, filtersContainer);
            }
        }
        
        const totalProjects = this.allProjects.length;
        countElement.textContent = `Showing ${count} of ${totalProjects} projects`;
        countElement.setAttribute('aria-live', 'polite');
    }
    
    animateFilterChange() {
        this.projectsGrid.style.opacity = '0.7';
        this.projectsGrid.style.transform = 'scale(0.98)';
        
        setTimeout(() => {
            this.projectsGrid.style.opacity = '1';
            this.projectsGrid.style.transform = 'scale(1)';
        }, 150);
    }
    
    animateSortChange() {
        this.projectsGrid.style.opacity = '0.8';
        
        setTimeout(() => {
            this.projectsGrid.style.opacity = '1';
        }, 200);
    }
    
    animateNewCards() {
        const cards = this.projectsGrid.querySelectorAll('.project-card');
        
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }
    
    addSortStyles() {
        if (!document.querySelector('#project-filter-styles')) {
            const style = document.createElement('style');
            style.id = 'project-filter-styles';
            style.textContent = `
                .projects__sort {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 2rem;
                    justify-content: center;
                }
                
                .sort-label {
                    color: var(--text-secondary);
                    font-size: var(--text-sm);
                    font-weight: 500;
                }
                
                .sort-select {
                    padding: 0.5rem 2rem 0.5rem 0.75rem;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    color: var(--text-primary);
                    font-size: var(--text-sm);
                    cursor: pointer;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
                    background-position: right 0.5rem center;
                    background-repeat: no-repeat;
                    background-size: 1.5em 1.5em;
                }
                
                .sort-select:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }
                
                .projects__count {
                    text-align: center;
                    color: var(--text-secondary);
                    font-size: var(--text-sm);
                    margin-bottom: 1rem;
                    font-weight: 500;
                }
                
                .projects__filter {
                    transition: all var(--transition-fast);
                    position: relative;
                    overflow: hidden;
                }
                
                .projects__filter::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    transition: left 0.5s;
                }
                
                .projects__filter:hover::before {
                    left: 100%;
                }
                
                .projects__filter.active {
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-md);
                }
                
                @media (prefers-reduced-motion: reduce) {
                    .project-card,
                    .projects__filter,
                    .sort-select {
                        transition: none;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    getFallbackProjects() {
        return [
            {
                id: 'fallback-1',
                title: 'Sample Project 1',
                description: 'A sample project description.',
                thumbnail: 'project-thumbnails/project1-thumb.jpg',
                demoUrl: '#',
                githubUrl: '#',
                tags: ['JavaScript', 'CSS'],
                categories: ['tool'],
                featured: true,
                year: 2024,
                technologies: ['HTML', 'CSS', 'JavaScript']
            },
            {
                id: 'fallback-2', 
                title: 'Sample Project 2',
                description: 'Another sample project description.',
                thumbnail: 'project-thumbnails/project2-thumb.jpg',
                demoUrl: '#',
                githubUrl: '#',
                tags: ['PWA', 'Responsive'],
                categories: ['pwa'],
                featured: false,
                year: 2024,
                technologies: ['HTML', 'CSS', 'JavaScript']
            }
        ];
    }
    
    filterByCategory(category) {
        this.activeFilters.clear();
        this.activeFilters.add(category);
        this.updateFilterButtons();
        this.renderProjects();
    }
    
    getActiveFilters() {
        return Array.from(this.activeFilters);
    }
    
    destroy() {
        this.filterButtons.forEach(button => {
            button.replaceWith(button.cloneNode(true));
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('projects-grid')) {
        window.projectFilter = new ProjectFilter();
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectFilter;
}

console.log('Project filter module loaded');