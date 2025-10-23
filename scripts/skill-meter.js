class SkillMeter {
    constructor() {
        this.skillElements = [];
        this.observer = null;
        this.animatedSkills = new Set();
        this.animationDuration = 1500;
        this.animationDelay = 200;
        this.easingFunction = this.easeOutCubic;
        
        this.init();
    }
    
    init() {
        this.initializeSkillElements();
        this.createIntersectionObserver();
        this.bindEvents();
        this.addSkillMeterStyles();
        
        console.log('Skill meter initialized');
    }
    
    initializeSkillElements() {
        
        this.skillElements = Array.from(document.querySelectorAll('.skill-meter__fill'));

        this.skillElements.forEach((element, index) => {
            const skillItem = element.closest('.skill-item');
            if (skillItem) {
                this.initializeSkillItem(skillItem, index);
            }
        });
    }
    
    initializeSkillItem(skillItem, index) {

        const percentage = this.getSkillPercentage(skillItem);
        const skillName = this.getSkillName(skillItem);
        const skillId = this.getSkillId(skillItem, index);

        skillItem.setAttribute('data-skill-id', skillId);
        skillItem.setAttribute('data-skill-percentage', percentage);
        skillItem.setAttribute('data-skill-name', skillName);

        this.setInitialState(skillItem, percentage);

        this.addHoverEffects(skillItem);
    }
    
    getSkillPercentage(skillItem) {
        let percentage = skillItem.getAttribute('data-percentage');
        
        if (!percentage) {

            const meterFill = skillItem.querySelector('.skill-meter__fill');
            if (meterFill) {
                percentage = meterFill.getAttribute('data-percentage');
            }
        }
        
        if (!percentage) {

            const percentageElement = skillItem.querySelector('.skill-item__percentage');
            if (percentageElement) {
                percentage = percentageElement.textContent.replace('%', '');
            }
        }
        
        return Math.min(100, Math.max(0, parseInt(percentage) || 0));
    }
    
    getSkillName(skillItem) {
        const nameElement = skillItem.querySelector('.skill-item__name');
        return nameElement ? nameElement.textContent : 'Skill';
    }
    
    getSkillId(skillItem, index) {
        return skillItem.id || `skill-${index}-${Date.now()}`;
    }
    
    setInitialState(skillItem, percentage) {
        const meterFill = skillItem.querySelector('.skill-meter__fill');
        if (meterFill) {

            meterFill.style.transform = 'scaleX(0)';
            meterFill.style.transition = 'none';                        
            meterFill.setAttribute('data-target-percentage', percentage);
        }

        this.updatePercentageDisplay(skillItem, 0);
    }
    
    createIntersectionObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.handleSkillInView(entry.target);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });

        this.skillElements.forEach(element => {
            const skillItem = element.closest('.skill-item');
            if (skillItem) {
                this.observer.observe(skillItem);
            }
        });
    }
    
    handleSkillInView(skillItem) {
        const skillId = skillItem.getAttribute('data-skill-id');
        
        if (this.animatedSkills.has(skillId)) {
            return; 
        }
        
        this.animatedSkills.add(skillId);

        const index = Array.from(skillItem.parentElement.children).indexOf(skillItem);
        const delay = index * this.animationDelay;

        setTimeout(() => {
            this.animateSkill(skillItem);
        }, delay);
    }
    
    animateSkill(skillItem) {
        const percentage = parseInt(skillItem.getAttribute('data-skill-percentage'));
        const meterFill = skillItem.querySelector('.skill-meter__fill');
        const startTime = performance.now();
        
        if (!meterFill) return;

        skillItem.classList.add('skill-animating');
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / this.animationDuration, 1);
            const easedProgress = this.easingFunction(progress);
            const currentPercentage = Math.floor(percentage * easedProgress);

            meterFill.style.transform = `scaleX(${easedProgress})`;
            meterFill.style.transition = 'none'; 

            this.updatePercentageDisplay(skillItem, currentPercentage);

            this.updateGlowEffect(meterFill, currentPercentage);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.animationComplete(skillItem, percentage);
            }
        };
        
        requestAnimationFrame(animate);
        this.dispatchSkillEvent('skillAnimationStart', skillItem, percentage);
    }
    
    animationComplete(skillItem, percentage) {
        skillItem.classList.remove('skill-animating');
        skillItem.classList.add('skill-animated');
        
        const meterFill = skillItem.querySelector('.skill-meter__fill');
        if (meterFill) {
            meterFill.style.transition = 'transform 0.3s ease';
        }

        this.addCompletionEffects(skillItem);
        this.dispatchSkillEvent('skillAnimationComplete', skillItem, percentage);

        if (percentage >= 80) {
            this.createParticleEffect(skillItem);
        }
    }
    
    updatePercentageDisplay(skillItem, percentage) {
        const percentageElement = skillItem.querySelector('.skill-item__percentage');
        if (percentageElement) {
            percentageElement.textContent = `${percentage}%`;

            this.updatePercentageColor(percentageElement, percentage);
        }

        const meter = skillItem.querySelector('.skill-meter');
        if (meter) {
            meter.setAttribute('aria-valuenow', percentage);
            meter.setAttribute('aria-valuetext', `${percentage} percent`);
        }
    }
    
    updatePercentageColor(percentageElement, percentage) {
        percentageElement.classList.remove('percentage-low', 'percentage-medium', 'percentage-high', 'percentage-expert');
 
        if (percentage < 50) {
            percentageElement.classList.add('percentage-low');
        } else if (percentage < 70) {
            percentageElement.classList.add('percentage-medium');
        } else if (percentage < 85) {
            percentageElement.classList.add('percentage-high');
        } else {
            percentageElement.classList.add('percentage-expert');
        }
    }
    
    updateGlowEffect(meterFill, percentage) {

        const milestones = [25, 50, 75, 90, 100];
        const isMilestone = milestones.includes(percentage);
        
        if (isMilestone) {
            meterFill.classList.add('skill-glow');
            setTimeout(() => {
                meterFill.classList.remove('skill-glow');
            }, 300);
        }
    }
    
    addCompletionEffects(skillItem) {

        skillItem.style.transform = 'scale(1.02)';
        skillItem.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
            skillItem.style.transform = 'scale(1)';
        }, 300);

        const percentage = parseInt(skillItem.getAttribute('data-skill-percentage'));
        if (percentage >= 90) {
            this.createConfettiEffect(skillItem);
        }
    }
    
    createParticleEffect(skillItem) {
        const meterFill = skillItem.querySelector('.skill-meter__fill');
        if (!meterFill) return;
        
        const rect = meterFill.getBoundingClientRect();
        const particles = 5;
        
        for (let i = 0; i < particles; i++) {
            this.createParticle(rect, skillItem);
        }
    }
    
    createParticle(rect, skillItem) {
        const particle = document.createElement('div');
        particle.className = 'skill-particle';
        
        const size = Math.random() * 4 + 2;
        const left = rect.left + Math.random() * rect.width;
        const top = rect.top - 10;
        
        particle.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            background: var(--primary-color);
            border-radius: 50%;
            left: ${left}px;
            top: ${top}px;
            pointer-events: none;
            z-index: 1000;
            opacity: 0.8;
        `;
        
        document.body.appendChild(particle);

        const animation = particle.animate([
            {
                transform: 'translateY(0) scale(1)',
                opacity: 0.8
            },
            {
                transform: `translateY(-${Math.random() * 30 + 20}px) translateX(${Math.random() * 20 - 10}px) scale(0)`,
                opacity: 0
            }
        ], {
            duration: 1000 + Math.random() * 500,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        });
        
        animation.onfinish = () => {
            particle.remove();
        };
    }
    
    createConfettiEffect(skillItem) {
        const rect = skillItem.getBoundingClientRect();
        const confettiCount = 15;
        
        for (let i = 0; i < confettiCount; i++) {
            this.createConfetti(rect);
        }
    }
    
    createConfetti(rect) {
        const confetti = document.createElement('div');
        confetti.className = 'skill-confetti';
        
        const colors = ['#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const shapes = ['rect', 'circle'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        
        const size = Math.random() * 8 + 4;
        const left = rect.left + Math.random() * rect.width;
        const top = rect.top + rect.height / 2;
        
        confetti.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: ${shape === 'circle' ? '50%' : '2px'};
            left: ${left}px;
            top: ${top}px;
            pointer-events: none;
            z-index: 1000;
            opacity: 0.9;
            transform: rotate(${Math.random() * 360}deg);
        `;
        
        document.body.appendChild(confetti);
 
        const animation = confetti.animate([
            {
                transform: `translateY(0) rotate(0deg)`,
                opacity: 0.9
            },
            {
                transform: `translateY(-${Math.random() * 100 + 50}px) 
                           translateX(${Math.random() * 100 - 50}px) 
                           rotate(${Math.random() * 720}deg)`,
                opacity: 0
            }
        ], {
            duration: 1500 + Math.random() * 1000,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        });
        
        animation.onfinish = () => {
            confetti.remove();
        };
    }
    
    addHoverEffects(skillItem) {
        skillItem.addEventListener('mouseenter', () => {
            this.handleSkillHover(skillItem, true);
        });
        
        skillItem.addEventListener('mouseleave', () => {
            this.handleSkillHover(skillItem, false);
        });
        
        // Touch devices
        skillItem.addEventListener('touchstart', () => {
            this.handleSkillHover(skillItem, true);
        }, { passive: true });
        
        skillItem.addEventListener('touchend', () => {
            this.handleSkillHover(skillItem, false);
        });
    }
    
    handleSkillHover(skillItem, isHovering) {
        if (isHovering) {
            skillItem.classList.add('skill-hover');
            this.showSkillTooltip(skillItem);
        } else {
            skillItem.classList.remove('skill-hover');
            this.hideSkillTooltip(skillItem);
        }
    }
    
    showSkillTooltip(skillItem) {

        this.hideSkillTooltip(skillItem);
        
        const percentage = skillItem.getAttribute('data-skill-percentage');
        const skillName = skillItem.getAttribute('data-skill-name');
        
        const tooltip = document.createElement('div');
        tooltip.className = 'skill-tooltip';
        tooltip.innerHTML = `
            <div class="skill-tooltip__content">
                <strong>${skillName}</strong>
                <span>${percentage}% proficiency</span>
                ${this.getSkillDescription(skillName, percentage)}
            </div>
        `;
        
        skillItem.appendChild(tooltip);

        this.positionTooltip(tooltip, skillItem);

        setTimeout(() => {
            tooltip.classList.add('tooltip-visible');
        }, 10);
    }
    
    hideSkillTooltip(skillItem) {
        const tooltip = skillItem.querySelector('.skill-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
    
    positionTooltip(tooltip, skillItem) {
        const rect = skillItem.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        tooltip.style.bottom = '100%';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translateX(-50%)';
        tooltip.style.marginBottom = '10px';
    }
    
    getSkillDescription(skillName, percentage) {
        const descriptions = {
            'HTML5': 'Semantic markup, accessibility, modern HTML features',
            'CSS3': 'Responsive design, animations, Flexbox, Grid, custom properties',
            'JavaScript': 'ES6+, DOM manipulation, async programming, modern APIs',
            'React': 'Components, hooks, state management, performance optimization',
            'Vue.js': 'Vue 3 composition API, Vuex, Vue Router, component architecture',
            'TypeScript': 'Type safety, interfaces, generics, modern JavaScript features',
            'Git': 'Version control, branching strategies, collaboration workflows',
            'Webpack': 'Module bundling, asset optimization, build configuration',
            'Figma': 'UI/UX design, prototyping, design systems, collaboration'
        };
        
        const description = descriptions[skillName] || 'Professional proficiency and experience';

        let level = 'Beginner';
        if (percentage >= 70) level = 'Proficient';
        if (percentage >= 85) level = 'Advanced';
        if (percentage >= 95) level = 'Expert';
        
        return `<div class="skill-level">${level} level</div><div class="skill-description">${description}</div>`;
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 's' && e.ctrlKey) {
                e.preventDefault();
                this.toggleAllAnimations();
            }
        });

        const exportBtn = document.getElementById('skills-export');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportSkillsData();
            });
        }

        const printBtn = document.getElementById('skills-print');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                this.printSkills();
            });
        }
    }
    
    toggleAllAnimations() {
        if (this.animatedSkills.size === this.skillElements.length) {

            this.resetAllAnimations();
        } else {

            this.animateAllSkills();
        }
    }
    
    animateAllSkills() {
        this.skillElements.forEach((element, index) => {
            const skillItem = element.closest('.skill-item');
            if (skillItem && !this.animatedSkills.has(skillItem.getAttribute('data-skill-id'))) {
                setTimeout(() => {
                    this.animateSkill(skillItem);
                }, index * 100);
            }
        });
    }
    
    resetAllAnimations() {
        this.animatedSkills.clear();
        
        this.skillElements.forEach(element => {
            const skillItem = element.closest('.skill-item');
            if (skillItem) {
                skillItem.classList.remove('skill-animated', 'skill-animating');
                this.setInitialState(skillItem, parseInt(skillItem.getAttribute('data-skill-percentage')));
            }
        });
        
        this.observer.disconnect();
        this.skillElements.forEach(element => {
            const skillItem = element.closest('.skill-item');
            if (skillItem) {
                this.observer.observe(skillItem);
            }
        });
    }
    
    exportSkillsData() {
        const skillsData = this.skillElements.map(element => {
            const skillItem = element.closest('.skill-item');
            return {
                name: skillItem?.getAttribute('data-skill-name') || 'Unknown',
                percentage: parseInt(skillItem?.getAttribute('data-skill-percentage') || '0'),
                category: skillItem?.closest('.skill-category')?.querySelector('.skill-category__title')?.textContent || 'General'
            };
        });
        
        const dataStr = JSON.stringify(skillsData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.download = 'skills-data.json';
        link.href = URL.createObjectURL(dataBlob);
        link.click();
    }
    
    printSkills() {
        const printWindow = window.open('', '_blank');
        const skillsData = this.getSkillsSummary();
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Skills Summary - Chioma Christiana</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .skill { margin: 10px 0; }
                    .skill-name { font-weight: bold; }
                    .skill-percentage { color: #666; }
                    .skill-category { margin-top: 20px; font-size: 1.2em; border-bottom: 2px solid #333; }
                </style>
            </head>
            <body>
                <h1>Skills Summary</h1>
                <div>Generated on ${new Date().toLocaleDateString()}</div>
                ${skillsData}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    }
    
    getSkillsSummary() {
        const categories = {};
        
        this.skillElements.forEach(element => {
            const skillItem = element.closest('.skill-item');
            if (skillItem) {
                const category = skillItem.closest('.skill-category')?.querySelector('.skill-category__title')?.textContent || 'Other';
                const name = skillItem.getAttribute('data-skill-name');
                const percentage = skillItem.getAttribute('data-skill-percentage');
                
                if (!categories[category]) {
                    categories[category] = [];
                }
                
                categories[category].push({ name, percentage });
            }
        });
        
        let html = '';
        Object.entries(categories).forEach(([category, skills]) => {
            html += `<div class="skill-category">${category}</div>`;
            skills.forEach(skill => {
                html += `
                    <div class="skill">
                        <span class="skill-name">${skill.name}</span>
                        <span class="skill-percentage"> - ${skill.percentage}%</span>
                    </div>
                `;
            });
        });
        
        return html;
    }
    
    dispatchSkillEvent(eventName, skillItem, percentage) {
        const event = new CustomEvent(eventName, {
            detail: {
                skillId: skillItem.getAttribute('data-skill-id'),
                skillName: skillItem.getAttribute('data-skill-name'),
                percentage: percentage,
                element: skillItem,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }
    
    // Easing functions
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
    
    addSkillMeterStyles() {
        if (!document.querySelector('#skill-meter-styles')) {
            const style = document.createElement('style');
            style.id = 'skill-meter-styles';
            style.textContent = this.getSkillMeterStyles();
            document.head.appendChild(style);
        }
    }
    
    getSkillMeterStyles() {
        return `
            .skill-animating {
                pointer-events: none;
            }
            
            .skill-animated {
                animation: skillPulse 0.5s ease;
            }
            
            @keyframes skillPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.02); }
                100% { transform: scale(1); }
            }

            .skill-meter__fill {
                transform-origin: left;
                transition: transform 0.1s linear;
            }
            
            .skill-glow {
                filter: drop-shadow(0 0 8px var(--primary-color));
            }

            .percentage-low {
                color: var(--red-500);
            }
            
            .percentage-medium {
                color: var(--yellow-500);
            }
            
            .percentage-high {
                color: var(--green-500);
            }
            
            .percentage-expert {
                color: var(--primary-color);
                font-weight: 700;
            }

            .skill-hover {
                transform: translateX(5px);
                transition: transform 0.3s ease;
            }
            
            .skill-hover .skill-meter__fill {
                filter: brightness(1.1);
            }

            .skill-tooltip {
                position: absolute;
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: var(--radius-lg);
                padding: 1rem;
                box-shadow: var(--shadow-xl);
                z-index: 1000;
                opacity: 0;
                transform: translateX(-50%) translateY(10px);
                transition: all 0.3s ease;
                min-width: 200px;
                pointer-events: none;
            }
            
            .tooltip-visible {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            
            .skill-tooltip__content {
                text-align: center;
            }
            
            .skill-tooltip__content strong {
                display: block;
                margin-bottom: 0.5rem;
                color: var(--text-primary);
            }
            
            .skill-level {
                font-size: var(--text-sm);
                color: var(--primary-color);
                font-weight: 600;
                margin: 0.5rem 0;
            }
            
            .skill-description {
                font-size: var(--text-sm);
                color: var(--text-secondary);
                line-height: 1.4;
            }

            .skill-particle {
                animation: particleFloat 1s ease-out forwards;
            }
            
            .skill-confetti {
                animation: confettiFloat 1.5s ease-out forwards;
            }
            
            @keyframes particleFloat {
                to {
                    transform: translateY(-30px) translateX(10px) scale(0);
                    opacity: 0;
                }
            }
            
            @keyframes confettiFloat {
                to {
                    transform: translateY(-100px) translateX(50px) rotate(360deg);
                    opacity: 0;
                }
            }
            
            @media (prefers-reduced-motion: reduce) {
                .skill-meter__fill {
                    transition: none;
                }
                
                .skill-animated {
                    animation: none;
                }
                
                .skill-particle,
                .skill-confetti {
                    display: none;
                }
            }

            @media print {
                .skill-tooltip,
                .skill-particle,
                .skill-confetti {
                    display: none !important;
                }
                
                .skill-meter__fill {
                    transform: none !important;
                    transition: none !important;
                }
            }
        `;
    }

    getSkillProgress(skillId) {
        const skillItem = this.skillElements.find(element => {
            const item = element.closest('.skill-item');
            return item && item.getAttribute('data-skill-id') === skillId;
        })?.closest('.skill-item');
        
        if (skillItem) {
            return {
                percentage: parseInt(skillItem.getAttribute('data-skill-percentage')),
                name: skillItem.getAttribute('data-skill-name'),
                animated: this.animatedSkills.has(skillId)
            };
        }
        
        return null;
    }
    
    animateSkillById(skillId) {
        const skillItem = this.skillElements.find(element => {
            const item = element.closest('.skill-item');
            return item && item.getAttribute('data-skill-id') === skillId;
        })?.closest('.skill-item');
        
        if (skillItem) {
            this.animateSkill(skillItem);
        }
    }
    
    updateSkillPercentage(skillId, newPercentage) {
        const skillItem = this.skillElements.find(element => {
            const item = element.closest('.skill-item');
            return item && item.getAttribute('data-skill-id') === skillId;
        })?.closest('.skill-item');
        
        if (skillItem) {
            skillItem.setAttribute('data-skill-percentage', newPercentage);
            const meterFill = skillItem.querySelector('.skill-meter__fill');
            if (meterFill) {
                meterFill.setAttribute('data-target-percentage', newPercentage);
            }

            if (this.animatedSkills.has(skillId)) {
                this.animateSkill(skillItem);
            }
        }
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
 
        document.querySelectorAll('.skill-tooltip').forEach(tooltip => {
            tooltip.remove();
        });
        document.querySelectorAll('.skill-particle, .skill-confetti').forEach(element => {
            element.remove();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.skillMeter = new SkillMeter();
});

document.addEventListener('skillAnimationStart', (event) => {
    console.log('Skill animation started:', event.detail);
});

document.addEventListener('skillAnimationComplete', (event) => {
    console.log('Skill animation completed:', event.detail);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkillMeter;
}

console.log('Skill meter module loaded');