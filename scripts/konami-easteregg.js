class KonamiEasterEgg {
    constructor() {
        this.sequence = [];
        this.konamiCode = [
            'ArrowUp', 'ArrowUp', 
            'ArrowDown', 'ArrowDown', 
            'ArrowLeft', 'ArrowRight', 
            'ArrowLeft', 'ArrowRight', 
            'KeyB', 'KeyA'
        ];
        this.requiredLength = this.konamiCode.length;
        this.isActive = false;
        this.easterEggs = [];
        this.currentEgg = null;
        this.eggHistory = [];
        this.maxHistory = 5;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.createEasterEggs();
        this.addEasterEggStyles();
        
        console.log('🎮 Konami easter egg initialized - Press ↑↑↓↓←→←→BA for secrets!');
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });

        if (window.location.hash === '#debug-easteregg') {
            this.createDebugPanel();
        }
    }
    
    handleKeyPress(event) {
        const key = event.key.startsWith('Arrow') ? event.key : event.code;
        this.sequence.push(key);
        
       
    }
    
    checkKonamiCode() {
        if (this.sequence.length < this.requiredLength) return false;
        
        for (let i = 0; i < this.requiredLength; i++) {
            if (this.sequence[this.sequence.length - this.requiredLength + i] !== this.konamiCode[i]) {
                return false;
            }
        }
        
        return true;
    }
    
    showKeyPressFeedback(event) {
        const feedback = document.createElement('div');
        feedback.className = 'konami-feedback';
        feedback.textContent = this.getKeyDisplay(event);
        feedback.style.cssText = `
            position: fixed;
            top: ${20 + Math.random() * 60}%;
            left: ${20 + Math.random() * 60}%;
            background: var(--primary-color);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: var(--radius-full);
            font-size: var(--text-sm);
            font-weight: bold;
            z-index: 10000;
            pointer-events: none;
            opacity: 0;
            transform: scale(0.8);
            animation: konamiFeedback 1s ease-out forwards;
        `;
        
        document.body.appendChild(feedback);
        setTimeout(() => {
            feedback.remove();
        }, 1000);
    }
    
    getKeyDisplay(event) {
        const keyMap = {
            'ArrowUp': '↑',
            'ArrowDown': '↓', 
            'ArrowLeft': '←',
            'ArrowRight': '→',
            'KeyB': 'B',
            'KeyA': 'A'
        };
        
        return keyMap[event.code] || event.key.toUpperCase();
    }
    
    activateEasterEgg() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.sequence = []; 
        const availableEggs = this.easterEggs.filter(egg => !this.eggHistory.includes(egg.id));
        const egg = availableEggs.length > 0 
            ? availableEggs[Math.floor(Math.random() * availableEggs.length)]
            : this.easterEggs[Math.floor(Math.random() * this.easterEggs.length)];
        
        this.currentEgg = egg;
        this.eggHistory.unshift(egg.id);

        if (this.eggHistory.length > this.maxHistory) {
            this.eggHistory.pop();
        }

        this.showActivationMessage(egg);

        setTimeout(() => {
            egg.execute();
        }, 1000);

        setTimeout(() => {
            this.isActive = false;
        }, egg.duration + 1000);
        
        console.log(`🎮 Easter egg activated: ${egg.name}`);
    }
    
    showActivationMessage(egg) {
        const message = document.createElement('div');
        message.className = 'konami-activation';
        message.innerHTML = `
            <div class="activation-content">
                <div class="activation-icon">🎮</div>
                <h3>Easter Egg Activated!</h3>
                <p>${egg.name}</p>
                <div class="activation-hint">${egg.hint}</div>
            </div>
        `;
        
        document.body.appendChild(message);

        setTimeout(() => {
            message.style.animation = 'slideOutUp 0.5s ease forwards';
            setTimeout(() => message.remove(), 500);
        }, 3000);
    }
    
    createEasterEggs() {
        this.easterEggs = [
            {
                id: 'matrix-rain',
                name: 'Matrix Digital Rain',
                description: 'Classic falling code animation from The Matrix',
                hint: 'Look at the falling code!',
                duration: 10000,
                execute: () => this.matrixRain()
            },
            {
                id: 'party-mode',
                name: 'Disco Party Mode',
                description: 'Transform the site into a colorful dance party',
                hint: 'Dance with the colors!',
                duration: 8000,
                execute: () => this.partyMode()
            },
            {
                id: 'retro-gaming',
                name: 'Retro Gaming Theme',
                description: '8-bit style transformation with pixel art',
                hint: 'Everything is pixelated!',
                duration: 12000,
                execute: () => this.retroGaming()
            },
            {
                id: 'invert-colors',
                name: 'Color Inversion',
                description: 'Invert all colors on the site',
                hint: 'The world is upside down!',
                duration: 6000,
                execute: () => this.invertColors()
            },
            {
                id: 'floating-elements',
                name: 'Floating Elements',
                description: 'Make all elements float and bounce around',
                hint: 'Everything is floating!',
                duration: 8000,
                execute: () => this.floatingElements()
            },
            {
                id: 'typewriter-effect',
                name: 'Typewriter Mode',
                description: 'All text appears as if being typed',
                hint: 'Listen to the typing sounds!',
                duration: 10000,
                execute: () => this.typewriterEffect()
            },
            {
                id: 'rainbow-text',
                name: 'Rainbow Text',
                description: 'All text cycles through rainbow colors',
                hint: 'So many colors!',
                duration: 8000,
                execute: () => this.rainbowText()
            },
            {
                id: 'secret-message',
                name: 'Secret Developer Message',
                description: 'Reveal hidden messages from the developer',
                hint: 'Check the console for secrets!',
                duration: 5000,
                execute: () => this.secretMessage()
            }
        ];
    }
    
    matrixRain() {
        const canvas = document.createElement('canvas');
        canvas.id = 'matrix-rain';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9998;
            pointer-events: none;
        `;
        
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops = [];
        
        for (let i = 0; i < columns; i++) {
            drops[i] = 1;
        }
        
        function draw() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#0F0';
            ctx.font = `${fontSize}px monospace`;
            
            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }
        
        const interval = setInterval(draw, 33);
        
        setTimeout(() => {
            clearInterval(interval);
            canvas.remove();
        }, 10000);
    }
    
    partyMode() {
        const style = document.createElement('style');
        style.id = 'party-mode-styles';
        style.textContent = `
            @keyframes partyColor {
                0% { filter: hue-rotate(0deg); }
                25% { filter: hue-rotate(90deg); }
                50% { filter: hue-rotate(180deg); }
                75% { filter: hue-rotate(270deg); }
                100% { filter: hue-rotate(360deg); }
            }
            
            .party-mode {
                animation: partyColor 1s linear infinite !important;
            }
            
            @keyframes dance {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                25% { transform: translateY(-10px) rotate(2deg); }
                75% { transform: translateY(5px) rotate(-2deg); }
            }
            
            .dance-element {
                animation: dance 0.5s ease-in-out infinite !important;
            }
        `;
        document.head.appendChild(style);
        document.documentElement.classList.add('party-mode');

        const elementsToDance = ['h1', 'h2', 'h3', '.button', '.project-card', '.skill-item'];
        elementsToDance.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.classList.add('dance-element');
            });
        });

        this.createDiscoBall();

        this.playPartySound();
        
        setTimeout(() => {
            document.documentElement.classList.remove('party-mode');
            document.querySelectorAll('.dance-element').forEach(el => {
                el.classList.remove('dance-element');
            });
            style.remove();
            document.getElementById('disco-ball')?.remove();
        }, 8000);
    }
    
    createDiscoBall() {
        const discoBall = document.createElement('div');
        discoBall.id = 'disco-ball';
        discoBall.innerHTML = '💿';
        discoBall.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            font-size: 3rem;
            z-index: 10000;
            animation: spin 2s linear infinite;
            filter: drop-shadow(0 0 10px rgba(255,255,255,0.5));
        `;
        
        document.body.appendChild(discoBall);
    }
    
    playPartySound() {

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const times = [0, 0.1, 0.2, 0.3, 0.4, 0.5];
            
            times.forEach(time => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(200 + Math.random() * 800, audioContext.currentTime + time);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime + time);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + 0.1);
                
                oscillator.start(audioContext.currentTime + time);
                oscillator.stop(audioContext.currentTime + time + 0.1);
            });
        } catch (error) {
            console.log('Audio context not available for party sound');
        }
    }
    
    retroGaming() {
        const style = document.createElement('style');
        style.id = 'retro-gaming-styles';
        style.textContent = `
            .retro-mode {
                image-rendering: pixelated;
                image-rendering: -moz-crisp-edges;
                image-rendering: crisp-edges;
            }
            
            .retro-mode * {
                border-radius: 0px !important;
                font-family: 'Press Start 2P', cursive, monospace !important;
            }
            
            .retro-mode img {
                filter: contrast(1.5) brightness(1.2) saturate(0.8);
            }
            
            @keyframes pixelGlitch {
                0% { transform: translate(0px, 0px); }
                25% { transform: translate(-2px, 2px); }
                50% { transform: translate(2px, -2px); }
                75% { transform: translate(-2px, -2px); }
                100% { transform: translate(0px, 0px); }
            }
            
            .pixel-glitch {
                animation: pixelGlitch 0.1s infinite;
            }
        `;
        document.head.appendChild(style);

        const fontLink = document.createElement('link');
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);
        
        document.documentElement.classList.add('retro-mode');

        setInterval(() => {
            const elements = document.querySelectorAll('h1, h2, h3, p');
            const randomElement = elements[Math.floor(Math.random() * elements.length)];
            randomElement.classList.add('pixel-glitch');
            
            setTimeout(() => {
                randomElement.classList.remove('pixel-glitch');
            }, 100);
        }, 500);

        this.createPixelParticles();
        
        setTimeout(() => {
            document.documentElement.classList.remove('retro-mode');
            style.remove();
            fontLink.remove();
        }, 12000);
    }
    
    createPixelParticles() {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const pixel = document.createElement('div');
                pixel.style.cssText = `
                    position: fixed;
                    width: 8px;
                    height: 8px;
                    background: #ff00ff;
                    z-index: 9999;
                    pointer-events: none;
                    top: ${Math.random() * 100}%;
                    left: ${Math.random() * 100}%;
                    animation: pixelFloat 2s ease-out forwards;
                `;
                
                document.body.appendChild(pixel);
                
                setTimeout(() => pixel.remove(), 2000);
            }, i * 200);
        }
    }
    
    invertColors() {
        document.documentElement.style.filter = 'invert(1)';
        
        setTimeout(() => {
            document.documentElement.style.filter = '';
        }, 6000);
    }
    
    floatingElements() {
        const elements = document.querySelectorAll('div, p, h1, h2, h3, img, button, a');
        
        elements.forEach(element => {
            if (element.offsetWidth > 50 && element.offsetHeight > 20) {
                const randomX = (Math.random() - 0.5) * 40;
                const randomY = (Math.random() - 0.5) * 40;
                const randomRotate = (Math.random() - 0.5) * 10;
                
                element.style.transition = 'all 0.5s ease';
                element.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg)`;

                element.style.animation = `float 2s ease-in-out infinite`;
            }
        });
        
        setTimeout(() => {
            elements.forEach(element => {
                element.style.transition = 'all 0.5s ease';
                element.style.transform = '';
                element.style.animation = '';
            });
        }, 8000);
    }
    
    typewriterEffect() {
        const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, .project-card__description');
        let currentElement = 0;
        
        function typeNextElement() {
            if (currentElement >= elements.length) return;
            
            const element = elements[currentElement];
            const originalText = element.textContent;
            element.textContent = '';
            element.style.borderRight = '2px solid var(--primary-color)';
            
            let charIndex = 0;
            const typeInterval = setInterval(() => {
                if (charIndex < originalText.length) {
                    element.textContent += originalText.charAt(charIndex);
                    charIndex++;

                    if (charIndex % 3 === 0) {
                        playTypeSound();
                    }
                } else {
                    clearInterval(typeInterval);
                    element.style.borderRight = 'none';
                    currentElement++;
                    setTimeout(typeNextElement, 100);
                }
            }, 50);
        }
        
        function playTypeSound() {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(100 + Math.random() * 400, audioContext.currentTime);
                oscillator.type = 'square';
                
                gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
            } catch (error) {
                // Audio not available
            }
        }
        
        typeNextElement();
    }
    
    rainbowText() {
        const style = document.createElement('style');
   style.id = 'rainbow-text-styles';
        style.textContent = `
            @keyframes rainbow {
                0% { color: #ff0000; }
                16% { color: #ff8000; }
                33% { color: #ffff00; }
                50% { color: #00ff00; }
                66% { color: #0000ff; }
                83% { color: #8000ff; }
                100% { color: #ff0080; }
            }
            
            .rainbow-text {
                animation: rainbow 1s linear infinite !important;
            }
        `;
        document.head.appendChild(style);
        
        document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a').forEach(element => {
            element.classList.add('rainbow-text');
        });
        
        setTimeout(() => {
            document.querySelectorAll('.rainbow-text').forEach(element => {
                element.classList.remove('rainbow-text');
            });
            style.remove();
        }, 8000);
    }
    
    secretMessage() {
        const message = document.createElement('div');
        message.className = 'secret-message';
        message.innerHTML = `
            <div class="message-content">
                <h3>🧠 Developer Secret!</h3>
                <p>You found the Konami code! 🎮</p>
                <p>This portfolio was built with pure HTML, CSS, and JavaScript.</p>
                <p>Check the console for more secrets... 👇</p>
            </div>
        `;
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg-primary);
            border: 3px solid var(--primary-color);
            border-radius: var(--radius-2xl);
            padding: 2rem;
            z-index: 10000;
            box-shadow: var(--shadow-2xl);
            text-align: center;
            max-width: 400px;
            animation: secretReveal 0.5s ease-out;
        `;
        
        document.body.appendChild(message);

        console.log(`%c
🎮 KONAMI CODE ACTIVATED!
        
Hey there, curious developer! 👋

You found my secret easter egg! Here are some fun facts about this portfolio:

✨ Built with vanilla JavaScript (no frameworks!)
🎨 Custom CSS with CSS Variables for theming
⚡ Performance optimized (Lighthouse score: 95+)
📱 Fully responsive design
♿ Accessibility first approach

Want to see the code? Check out the GitHub repo!

Thanks for exploring! 🚀
        `, 'background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; padding: 20px; border-radius: 10px; font-size: 14px;');
        
        setTimeout(() => {
            message.style.animation = 'secretHide 0.5s ease-in forwards';
            setTimeout(() => message.remove(), 500);
        }, 5000);
    }
    
    addEasterEggStyles() {
        if (!document.querySelector('#konami-easteregg-styles')) {
            const style = document.createElement('style');
            style.id = 'konami-easteregg-styles';
            style.textContent = this.getEasterEggStyles();
            document.head.appendChild(style);
        }
    }
    
    getEasterEggStyles() {
        return `
            @keyframes konamiFeedback {
                0% {
                    opacity: 0;
                    transform: scale(0.8);
                }
                50% {
                    opacity: 1;
                    transform: scale(1.1);
                }
                100% {
                    opacity: 0;
                    transform: scale(0.9);
                }
            }

            .konami-activation {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--primary-color);
                color: white;
                padding: 1rem 2rem;
                border-radius: var(--radius-2xl);
                z-index: 10000;
                box-shadow: var(--shadow-2xl);
                animation: slideInDown 0.5s ease-out;
            }
            
            .activation-content {
                text-align: center;
            }
            
            .activation-icon {
                font-size: 2rem;
                margin-bottom: 0.5rem;
            }
            
            .activation-content h3 {
                margin: 0 0 0.5rem 0;
                font-size: var(--text-lg);
            }
            
            .activation-content p {
                margin: 0 0 0.5rem 0;
                font-weight: 600;
            }
            
            .activation-hint {
                font-size: var(--text-sm);
                opacity: 0.8;
            }

            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            @keyframes pixelFloat {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100px) rotate(180deg);
                    opacity: 0;
                }
            }

            @keyframes float {
                0%, 100% {
                    transform: translateY(0px);
                }
                50% {
                    transform: translateY(-10px);
                }
            }

            @keyframes secretReveal {
                from {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.5);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }
            
            @keyframes secretHide {
                from {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
                to {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.5);
                }
            }

            @keyframes slideInDown {
                from {
                    transform: translateX(-50%) translateY(-100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutUp {
                from {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(-50%) translateY(-100%);
                    opacity: 0;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .konami-feedback,
                .konami-activation,
                .party-mode,
                .dance-element,
                .pixel-glitch,
                .rainbow-text {
                    animation: none !important;
                }
            }
        `;
    }
    
    createDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'konami-debug';
        panel.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--bg-primary);
            border: 2px solid var(--primary-color);
            border-radius: var(--radius-lg);
            padding: 1rem;
            z-index: 10000;
            font-family: monospace;
            font-size: var(--text-sm);
            box-shadow: var(--shadow-lg);
        `;
        
        panel.innerHTML = `
            <div style="margin-bottom: 0.5rem; font-weight: bold;">🎮 Konami Debug</div>
            <div>Sequence: <span id="konami-sequence">${this.sequence.join(' ')}</span></div>
            <div>Active: <span id="konami-active">${this.isActive}</span></div>
            <div style="margin-top: 0.5rem;">
                <button onclick="window.konamiEasterEgg.activateEasterEgg()" style="padding: 0.25rem 0.5rem; margin-right: 0.5rem;">Activate</button>
                <button onclick="window.konamiEasterEgg.sequence = []; document.getElementById('konami-sequence').textContent = '';" style="padding: 0.25rem 0.5rem;">Reset</button>
            </div>
        `;
        
        document.body.appendChild(panel);

        const updateSequence = () => {
            document.getElementById('konami-sequence').textContent = this.sequence.join(' ');
            document.getElementById('konami-active').textContent = this.isActive;
        };
        
        const originalHandleKeyPress = this.handleKeyPress.bind(this);
        this.handleKeyPress = (event) => {
            originalHandleKeyPress(event);
            updateSequence();
        };
    }

    activateRandomEgg() {
        const randomEgg = this.easterEggs[Math.floor(Math.random() * this.easterEggs.length)];
        this.currentEgg = randomEgg;
        this.isActive = true;
        
        this.showActivationMessage(randomEgg);
        randomEgg.execute();
        
        setTimeout(() => {
            this.isActive = false;
        }, randomEgg.duration + 1000);
    }
    
    getActiveEgg() {
        return this.currentEgg;
    }
    
    getEggHistory() {
        return this.eggHistory.map(id => this.easterEggs.find(egg => egg.id === id));
    }

    destroy() {
        document.removeEventListener('keydown', this.handleKeyPress);

        document.querySelectorAll('#matrix-rain, #disco-ball, .secret-message, #konami-debug').forEach(el => {
            el.remove();
        });
        document.querySelectorAll('#konami-easteregg-styles, #party-mode-styles, #retro-gaming-styles, #rainbow-text-styles').forEach(el => {
            el.remove();
        });
        document.documentElement.classList.remove('party-mode', 'retro-mode');
        document.documentElement.style.filter = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.konamiEasterEgg = new KonamiEasterEgg();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = KonamiEasterEgg;
}

console.log('🎮 Konami easter egg loaded - Cheat code: ↑↑↓↓←→←→BA');