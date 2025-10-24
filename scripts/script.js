document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log('Initializing portfolio website...');

    initializeNavigation();
    initializeSmoothScroll();    
    window.geolocationGreeting = new GeolocationGreeting();
    initializeProjectGrid();
    initializeSkillsSection();
    window.timeline = new Timeline();
    initializeBlogPreview();
    initializeContactForm();
    initializeAccessibility();

initializeThemeSwitcher();

setTimeout(() => {
    window.scrollProgress = new ScrollProgress();
}, 100);

if (typeof Microinteractions !== 'undefined') {
    window.microinteractions = new Microinteractions();
    window.microinteractions.addMicrointeractionStyles();
}

    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }, 1000);
}

function initializeNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navClose = document.getElementById('nav-close');
    const navLinks = document.querySelectorAll('.nav__link');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.add('active');
        });
    }
    
    if (navClose) {
        navClose.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });

    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navMenu.classList.remove('active');
        }
    });
}

function initializeSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function initializeProjectGrid() {
    const projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid) return;

    if (typeof window.projectData !== 'undefined') {
        renderProjects(window.projectData);
        initializeProjectFilters();
    } else {
        console.warn('Project data not found. Loading default projects...');
        loadDefaultProjects();
    }
}

function renderProjects(projects) {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    
    grid.innerHTML = projects.map(project => `
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
    `).join('');

    initializeProjectModals();
}

function initializeProjectFilters() {
    const filterButtons = document.querySelectorAll('.projects__filter');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            filterProjects(filterValue);
        });
    });
}

function filterProjects(filter) {
    const projects = document.querySelectorAll('.project-card');
    
    projects.forEach(project => {
        if (filter === 'all') {
            project.style.display = 'block';
        } else {
            const categories = project.getAttribute('data-categories');
            if (categories.includes(filter)) {
                project.style.display = 'block';
            } else {
                project.style.display = 'none';
            }
        }
    });
}

function initializeProjectModals() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('click', function() {

            if (event.target.closest('a')) return;
            
            const projectId = this.getAttribute('data-id');
            
            if (window.modalViewer) {
                window.modalViewer.openById(projectId);
            }
        });
    });
}

function initializeSkillsSection() {
    const skillsContainer = document.querySelector('.skills__container');
    if (!skillsContainer) return;
    
    const skillsData = [
        {
            category: 'Frontend Technologies',
            skills: [
                { name: 'HTML5', percentage: 95, icon: 'fab fa-html5' },
                { name: 'CSS3', percentage: 90, icon: 'fab fa-css3-alt' },
                { name: 'JavaScript (ES6+)', percentage: 88, icon: 'fab fa-js' },
                { name: 'Responsive Design', percentage: 92, icon: 'fas fa-mobile-alt' }
            ]
        },
        {
            category: 'Tools & Practices',
            skills: [
                { name: 'Git & GitHub', percentage: 85, icon: 'fab fa-git-alt' },
                { name: 'Figma', percentage: 80, icon: 'fab fa-figma' },
                { name: 'PWA', percentage: 75, icon: 'fas fa-rocket' },
                { name: 'Web Performance', percentage: 82, icon: 'fas fa-tachometer-alt' }
            ]
        },
        {
            category: 'Soft Skills',
            skills: [
                { name: 'Problem Solving', percentage: 90, icon: 'fas fa-puzzle-piece' },
                { name: 'UI/UX Design', percentage: 85, icon: 'fas fa-palette' },
                { name: 'Accessibility', percentage: 88, icon: 'fas fa-universal-access' },
                { name: 'Communication', percentage: 87, icon: 'fas fa-comments' }
            ]
        }
    ];
    
    renderSkills(skillsData);        
}

function renderSkills(skillsData) {
    const container = document.querySelector('.skills__container');
    
    container.innerHTML = skillsData.map(category => `
        <div class="skill-category">
            <h3 class="skill-category__title">${category.category}</h3>
            <div class="skill-items">
                ${category.skills.map(skill => `
                    <div class="skill-item">
                        <div class="skill-item__icon">
                            <i class="${skill.icon}"></i>
                        </div>
                        <div class="skill-item__content">
                            <div class="skill-item__header">
                                <span class="skill-item__name">${skill.name}</span>
                                <span class="skill-item__percentage">${skill.percentage}%</span>
                            </div>
                            <div class="skill-meter">
                                <div class="skill-meter__fill" data-percentage="${skill.percentage}"></div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    if (window.skillMeter) {
        window.skillMeter.initializeSkillElements();
        window.skillMeter.createIntersectionObserver();
    }
}

function initializeBlogPreview() {
    const blogGrid = document.querySelector('.blog__grid');
    if (!blogGrid) return;
    
    const blogPosts = [
        {
            title: 'From Curiosity to Code: My Journey into Frontend Development',
            excerpt: 'How I went from tinkering with HTML to building complex web applications with passion and purpose.',
            readTime: '5 min read',
            date: 'July 2023'
        },
        {
            title: 'Why I Love Vanilla JavaScript (And What It\'s Taught Me)',
            excerpt: 'Discovering the power of pure JavaScript and how it made me a better developer without relying on frameworks.',
            readTime: '7 min read',
            date: 'September 2023'
        },
        {
            title: 'How I Built Palettrix: A Color Tool for Designers',
            excerpt: 'A deep dive into creating a comprehensive color palette generator with advanced color theory and PWA capabilities.',
            readTime: '8 min read',
            date: 'October 2025'
        }
    ];
    
    renderBlogPreview(blogPosts);
}

function renderBlogPreview(posts) {
    const grid = document.querySelector('.blog__grid');
    
    grid.innerHTML = posts.map(post => `
        <article class="blog-card">
            <div class="blog-card__content">
                <h3 class="blog-card__title">${post.title}</h3>
                <p class="blog-card__excerpt">${post.excerpt}</p>
                <div class="blog-card__meta">
                    <span>${post.date}</span>
                    <span>${post.readTime}</span>
                </div>
            </div>
        </article>
    `).join('');
}

function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        // Basic validation BEFORE allowing Netlify to handle submission
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();
        
        if (!name || !email || !subject || !message) {
            e.preventDefault(); // Only prevent if validation fails
            showNotification('Please fill in all fields.', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            e.preventDefault(); // Only prevent if validation fails
            showNotification('Please enter a valid email address.', 'error');
            return;
        }
        
        // Message length validation (1000 characters max)
        if (message.length > 1000) {
            e.preventDefault(); // Only prevent if validation fails
            showNotification('Message should not exceed 1000 characters.', 'error');
            return;
        }
        
        // If validation passes, let Netlify handle the submission
        // Show loading state
        const submitButton = contactForm.querySelector('.form__submit');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Sending...</span>';
        submitButton.disabled = true;
        
        // Netlify will redirect to a success page, but we can't catch it easily
        // So we'll reset the button after a timeout
        setTimeout(() => {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }, 3000);
    });
}

function initializeAccessibility() {
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

function initializeThemeSwitcher() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    document.documentElement.classList.add('instant-theme');
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

const highContrastSaved = localStorage.getItem('high-contrast');
if (highContrastSaved === 'true') {
    document.documentElement.setAttribute('data-theme', 'high-contrast');
}
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('#theme-toggle i');
    if (themeIcon) {
        themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

function loadDefaultProjects() {
    const defaultProjects = [
        {
            id: 'palettrix',
            title: 'Palettrix - Color Palette Generator',
            description: 'A powerful color palette generator with advanced color theory and PWA capabilities.',
            thumbnail: 'project-thumbnails/project1-thumb.jpg',
            demoUrl: 'https://palettrix-ks.vercel.app',
            githubUrl: 'https://github.com/Kstiana/Palettrix',
            tags: ['PWA', 'Color Theory', 'JavaScript'],
            categories: ['pwa', 'tool']
        },
        {
            id: 'poetica',
            title: 'Poetica - Poetry Generator',
            description: 'Web-based poetry creation tool with AI-enhanced generation and customizable themes.',
            thumbnail: 'project-thumbnails/project2-thumb.jpg',
            demoUrl: 'https://poetica-a.vercel.app',
            githubUrl: 'https://github.com/Kstiana/Poetica',
            tags: ['AI', 'Creative', 'PWA'],
            categories: ['pwa', 'ai']
        },
        {
            id: 'neonxo',
            title: 'NeonXO - Tic Tac Toe Game',
            description: 'Modern neon-themed Tic Tac Toe with smart AI opponent and responsive design.',
            thumbnail: 'project-thumbnails/project3-thumb.jpg',
            demoUrl: 'https://neonx-o.vercel.app',
            githubUrl: 'https://github.com/Kstiana/Neon-xo',
            tags: ['Game', 'AI', 'Responsive'],
            categories: ['game', 'ai']
        }
    ];
    
    renderProjects(defaultProjects);
}

window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
});

window.portfolioApp = {
    initializeApp,
    showNotification,
    filterProjects
};

console.log('Portfolio website initialized successfully!'); 
