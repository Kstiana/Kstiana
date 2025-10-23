class ServiceOffers {
    constructor() {
        this.services = [];
        this.currentCategory = 'all';
        this.activeService = null;
        
        this.init();
    }
    
    init() {
        this.loadServicesData();
        this.createServicesSection();
        this.bindEvents();
        
        console.log('Service offers initialized');
    }
    
    loadServicesData() {
        this.services = [
          {
        id: 'frontend-development',
        title: 'Frontend Development',
        icon: 'fas fa-code',
        description: 'Custom, responsive web applications with modern technologies',
        features: ['Responsive Design', 'Performance Focus', 'Accessibility'],
        technologies: ['HTML5', 'CSS3', 'JavaScript', 'React'],
        cta: 'Discuss Project'
    },
    {
        id: 'pwa-development',
        title: 'PWA Development', 
        icon: 'fas fa-rocket',
        description: 'Convert websites to fast, installable Progressive Web Apps',
        features: ['Offline Function', 'App-like Experience', 'Push Notifications'],
        technologies: ['Service Workers', 'Web App Manifest', 'Cache API'],
        cta: 'Learn More'
    },
    {
        id: 'website-redesign',
        title: 'Website Redesign',
        icon: 'fas fa-paint-brush',
        description: 'Modern, user-centered website redesigns',
        features: ['UI/UX Design', 'Performance Boost', 'SEO Optimization'],
        technologies: ['Figma', 'CSS3', 'JavaScript'],
        cta: 'Redesign My Site'
    },
    {
        id: 'consulting',
        title: 'Development Consulting',
        icon: 'fas fa-graduation-cap',
        description: 'Code reviews, best practices, and team mentoring',
        features: ['Code Review', 'Best Practices', 'Performance Tips'],
        technologies: ['JavaScript', 'CSS', 'Web Standards'],
        cta: 'Get Guidance'
    }      
        ];
    }
    
    createServicesSection() {
    if (document.getElementById('services')) return;
    
    const projectsSection = document.getElementById('projects');
    if (!projectsSection) return;
    
    const servicesSection = document.createElement('section');
    servicesSection.id = 'services';
    servicesSection.className = 'services section';
    servicesSection.innerHTML = this.generateServicesHTML();
    
    projectsSection.parentNode.insertBefore(servicesSection, projectsSection.nextSibling);
    
    this.addServicesStyles();

    if (window.microinteractions) window.microinteractions.registerDynamicElements('#services .section__header');
}
    
    generateServicesHTML() {
        return `
            <div class="container">
                <div class="section__header">
                    <h2 class="section__title">Services I Offer</h2>
                    <p class="section__subtitle">Professional frontend development services tailored to your needs</p>
                </div>
                
                <!-- Services Grid -->
                <div class="services__grid" id="services-grid">
                    ${this.generateServicesGrid()}
                </div>

                <div class="services__cta">
                    <div class="cta-content">
                        <h3>Ready to work together?</h3>
                        <p>Let's discuss your project and how I can help bring your ideas to life.</p>
                        <div class="cta-buttons">
                            <a href="#contact" class="button button--primary">
                                <i class="fas fa-paper-plane"></i>
                                <span>Get In Touch</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    generateServicesGrid() {
        return this.services.map(service => `
            <div class="service-card" data-service-id="${service.id}">
                <div class="service-card__header">
                    <div class="service-icon">
                        <i class="${service.icon}"></i>
                    </div>
                    <h3 class="service-title">${service.title}</h3>
                </div>
                
                <div class="service-card__body">
                    <p class="service-description">${service.description}</p>
                    
                    <div class="service-features">
                        ${service.features.map(feature => `
                            <span class="service-feature">✓ ${feature}</span>
                        `).join('')}
                    </div>
                    
                    <div class="service-technologies">
                        ${service.technologies.map(tech => `
                            <span class="tech-tag">${tech}</span>
                        `).join('')}
                    </div>
                </div>
                
                <div class="service-card__footer">
                    <a href="#contact" class="button button--primary">
                        <span>${service.cta}</span>
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `).join('');
    }
    
    bindEvents() {
    document.addEventListener('click', (e) => {
        const serviceCard = e.target.closest('.service-card');
        if (serviceCard) {
            e.preventDefault();
            const serviceId = serviceCard.getAttribute('data-service-id');
            this.startServiceInquiry(serviceId);
        }
    });
}
    
    startServiceInquiry(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (!service) return;

        this.prefillContactForm(service);

        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    prefillContactForm(service) {
        const subjectField = document.getElementById('subject');
        const messageField = document.getElementById('message');
        
        if (subjectField) {
            subjectField.value = `Inquiry: ${service.title} Service`;
        }
 
        if (messageField) {
            messageField.value = `Hello Chioma,\n\nI'm interested in your ${service.title} service.\n\nLooking forward to discussing this further!\n\nBest regards,\n[Your Name]`;
        }
    }
    
    addServicesStyles() {
        if (!document.querySelector('#services-styles')) {
            const style = document.createElement('style');
            style.id = 'services-styles';
            style.textContent = this.getServicesStyles();
            document.head.appendChild(style);
        }
    }
    
    getServicesStyles() {
        return `
            .services {
                background: var(--bg-secondary);
            }
            
            .services__grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 1rem;
                margin-bottom: 1rem;
            }

            .service-card {
                background: var(--bg-primary);
                border-radius: var(--radius-2xl);
                padding: 0.5rem;
                box-shadow: var(--shadow-md);
                transition: all 0.3s ease;
                border: 1px solid var(--border-color);
            }
            
            .service-card:hover {
                transform: translateY(-5px);
                box-shadow: var(--shadow-xl);
                border-color: var(--primary-color);
            }
            
            .service-card__header {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 1rem;
            }
            
            .service-icon {
                width: 50px;
                height: 50px;
                background: var(--gradient-primary);
                border-radius: var(--radius-lg);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 1.5rem;
            }
            
            .service-title {
                font-size: var(--text-xl);
                margin: 0;
                color: var(--text-primary);
            }
            
            .service-description {
                color: var(--text-secondary);
                margin-bottom: 1.5rem;
                line-height: 1.6;
            }
            
            .service-features {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                margin-bottom: 1rem;
            }
            
            .service-feature {
                font-size: var(--text-sm);
                color: var(--text-secondary);
            }
            
            .service-technologies {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                margin-bottom: 1rem;
            }
            
            .tech-tag {
                padding: 0.5rem 1rem;
                background: var(--bg-secondary);
                color: var(--text-primary);
                border-radius: var(--radius-full);
                font-size: var(--text-sm);
                border: 1px solid var(--border-color);
            }
            
            .service-card__footer {
                display: flex;
                gap: 0.75rem;
            }
            
            .service-card__footer .button {
                flex: 1;
                justify-content: center;
            }

            .services__cta {
                background: var(--gradient-primary);
                color: white;
                padding: 1rem 0.5rem;
                border-radius: var(--radius-2xl);
                text-align: center;
            }
            
            .cta-content h3 {
                font-size: var(--text-3xl);
                margin-bottom: 1rem;
            }
            
            .cta-content p {
                font-size: var(--text-lg);
                margin-bottom: 1rem;
                opacity: 0.9;
            }
            
            .cta-buttons {
                display: flex;
                gap: 0.5rem;
                justify-content: center;
                flex-wrap: wrap;
            }

            @media (max-width: 768px) {
                .services__grid {
                    grid-template-columns: 2fr;
                }
                
                .service-card {
                    padding: 1.5rem;
                }
            }
        `;
    }

    getServices() {
        return this.services;
    }
    
    getServiceById(id) {
        return this.services.find(service => service.id === id);
    }

    destroy() {
        const servicesSection = document.getElementById('services');
        if (servicesSection) {
            servicesSection.remove();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.serviceOffers = new ServiceOffers();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ServiceOffers;
}

console.log('Service offers module loaded');