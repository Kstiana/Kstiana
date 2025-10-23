class GeolocationGreeting {
    constructor() {
        this.greetingElement = document.getElementById('dynamic-greeting');
        this.userLocation = null;
        this.userCountry = null;
        this.userTimezone = null;
        this.isGeolocationAvailable = false;
        this.fallbackGreetings = [
            "Hello there! 👋",
            "Welcome! 🌟",
            "Greetings!",
            "Hi there! 😊",
            "Hey! 👋"
        ];
        
        this.init();
    }
    
    init() {
        if (!this.greetingElement) {
            console.warn('Greeting element not found');
            return;
        }
        
        this.checkGeolocationSupport();
        this.setInitialGreeting();
        this.detectUserLocation();
        
        console.log('🌍 Geolocation greeting initialized');
    }
    
    checkGeolocationSupport() {
        this.isGeolocationAvailable = 'geolocation' in navigator;
        
        if (!this.isGeolocationAvailable) {
            console.log('Geolocation API not available, using IP-based detection');
        }
    }
    
    setInitialGreeting() {
        const timeBasedGreeting = this.getTimeBasedGreeting();
        this.updateGreeting(timeBasedGreeting);
    }
    
    async detectUserLocation() {
        try {
            await this.detectLocationByIP();
            if (!this.userCountry && this.isGeolocationAvailable) {
                await this.detectLocationByBrowser();
            }
            
            this.updateGreetingWithLocation();
            
        } catch (error) {
            console.warn('Location detection failed:', error);
            this.useFallbackGreeting();
        }
    }
    
    async detectLocationByIP() {
        try {
            const response = await fetch('https://ipapi.co/json/', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                timeout: 5000
            });
            
            if (!response.ok) {
                throw new Error(`IP API responded with status: ${response.status}`);
            }
            
            const data = await response.json();
            
            this.userCountry = data.country_name;
            this.userTimezone = data.timezone;
            this.userLocation = {
                country: data.country_name,
                countryCode: data.country_code,
                city: data.city,
                region: data.region,
                timezone: data.timezone,
                latitude: data.latitude,
                longitude: data.longitude
            };
            
            console.log('📍 IP-based location detected:', this.userLocation);
            
        } catch (error) {
            console.warn('IP-based location detection failed:', error);
            await this.detectLocationByIPFallback();
        }
    }
    
    async detectLocationByIPFallback() {
        try {
            const response = await fetch('https://api.ipgeolocation.io/ipgeo?apiKey=demo', {
                method: 'GET',
                timeout: 5000
            });
            
            if (response.ok) {
                const data = await response.json();
                this.userCountry = data.country_name;
                this.userTimezone = data.timezone;
                this.userLocation = {
                    country: data.country_name,
                    countryCode: data.country_code,
                    city: data.city,
                    timezone: data.timezone
                };
            }
        } catch (error) {
            console.warn('Fallback IP location detection failed:', error);
        }
    }
    
    detectLocationByBrowser() {
        return new Promise((resolve, reject) => {
            if (!this.isGeolocationAvailable) {
                reject(new Error('Geolocation not available'));
                return;
            }
            
            const options = {
                enableHighAccuracy: false, 
                timeout: 10000, 
                maximumAge: 300000 
            };
            
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        await this.reverseGeocode(position.coords);
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                },
                (error) => {
                    console.warn('Browser geolocation failed:', error);
                    reject(error);
                },
                options
            );
        });
    }
    
    async reverseGeocode(coords) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=10`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Portfolio Website' 
                    }
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                this.userLocation = {
                    country: data.address.country,
                    countryCode: this.getCountryCode(data.address.country_code),
                    city: data.address.city || data.address.town || data.address.village,
                    state: data.address.state,
                    latitude: coords.latitude,
                    longitude: coords.longitude
                };
                
                this.userCountry = data.address.country;
                console.log('📍 Browser geolocation successful:', this.userLocation);
            }
        } catch (error) {
            console.warn('Reverse geocoding failed:', error);
            throw error;
        }
    }
    
    getCountryCode(countryCode) {
        if (countryCode && countryCode.length === 2) {
            return countryCode.toUpperCase();
        }
        return null;
    }
    
    updateGreetingWithLocation() {
        if (!this.userCountry) {
            this.useFallbackGreeting();
            return;
        }
        
        const timeBasedGreeting = this.getTimeBasedGreeting();
        const locationBasedGreeting = this.getLocationBasedGreeting();
        const emoji = this.getCountryEmoji();
        
        let greeting = '';
        
        if (this.userCity && Math.random() > 0.7) { 
            greeting = `${timeBasedGreeting} from ${this.userCity}, ${this.userCountry} ${emoji}`;
        } else {
            greeting = `${timeBasedGreeting} from ${this.userCountry} ${emoji}`;
        }
        
        this.updateGreeting(greeting);
        this.addLocationFeatures();
    }
    
    getTimeBasedGreeting() {
        const hour = new Date().getHours();
        const timezone = this.userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        let greeting = '';
        let emoji = '';
        
        if (hour < 12) {
            greeting = 'Good morning';
            
        } else if (hour < 18) {
            greeting = 'Good afternoon';
            
        } else {
            greeting = 'Good evening';
            
        }
        
        if (timezone && this.isDifferentTimezone(timezone)) {
            const timezoneName = this.getFriendlyTimezoneName(timezone);
            return `${greeting} ${emoji} (${timezoneName})`;
        }
        
        return `${greeting} ${emoji}`;
    }
    
    getLocationBasedGreeting() {
        if (!this.userCountry) return '';
        
        const countryGreetings = {
            'Nigeria': 'Kedu', 
            'United States': 'Howdy',
            'United Kingdom': 'Cheers',
            'Canada': 'Hello, eh',
            'Australia': 'G\'day',
            'India': 'Namaste',
            'Japan': 'Konnichiwa',
            'China': 'Nǐ hǎo',
            'Brazil': 'Olá',
            'France': 'Bonjour',
            'Germany': 'Hallo',
            'Spain': 'Hola',
            'Italy': 'Ciao',
            'Russia': 'Privet',
            'Egypt': 'Ahlan',
            'South Africa': 'Howzit',
            'Mexico': 'Hola',
            'South Korea': 'Annyeonghaseyo'
        };
        
        return countryGreetings[this.userCountry] || 'Hello';
    }
    
    getCountryEmoji() {
        if (!this.userLocation || !this.userLocation.countryCode) return '🌍';
        
        const countryCode = this.userLocation.countryCode;
        
        if (countryCode && countryCode.length === 2) {
            const codePoints = countryCode
                .toUpperCase()
                .split('')
                .map(char => 127397 + char.charCodeAt());
            return String.fromCodePoint(...codePoints);
        }
        
        return '🌍';
    }
    
    isDifferentTimezone(userTimezone) {
        const serverTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return userTimezone !== serverTimezone;
    }
    
    getFriendlyTimezoneName(timezone) {
        const timezoneNames = {
            'America/New_York': 'ET',
            'America/Chicago': 'CT',
            'America/Denver': 'MT',
            'America/Los_Angeles': 'PT',
            'Europe/London': 'GMT',
            'Europe/Paris': 'CET',
            'Asia/Tokyo': 'JST',
            'Asia/Shanghai': 'CST',
            'Australia/Sydney': 'AEST',
            'Africa/Lagos': 'WAT'
        };
        
        return timezoneNames[timezone] || timezone.split('/')[1] || timezone;
    }
    
    updateGreeting(greeting) {
        if (!this.greetingElement) return;
        
        // Add animation
        this.greetingElement.style.opacity = '0';
        this.greetingElement.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            this.greetingElement.textContent = greeting;
            this.greetingElement.style.opacity = '1';
            this.greetingElement.style.transform = 'translateY(0)';
        }, 200);
    }
    
    useFallbackGreeting() {
        const randomIndex = Math.floor(Math.random() * this.fallbackGreetings.length);
        const fallbackGreeting = this.fallbackGreetings[randomIndex];
        this.updateGreeting(fallbackGreeting);
    }
    
    addLocationFeatures() {
        if (!this.userLocation) return;
        
        this.addLocationTheming();
        this.updateVisitStatistics();
    }
    
    addLocationTheming() {
        const countryCode = this.userLocation.countryCode;
        
        if (countryCode) {
            const countryThemes = {
                'NG': { '--location-accent': '#008751' }, 
                'US': { '--location-accent': '#3C3B6E' }, 
                'GB': { '--location-accent': '#C8102E' }, 
                'CA': { '--location-accent': '#FF0000' }, 
                'AU': { '--location-accent': '#012169' }, 
                'IN': { '--location-accent': '#FF9933' }, 
                'JP': { '--location-accent': '#BC002D' }, 
                'CN': { '--location-accent': '#DE2910' }, 
                'BR': { '--location-accent': '#009C3B' }, 
                'FR': { '--location-accent': '#0055A4' }, 
                'DE': { '--location-accent': '#000000' }, 
                'ES': { '--location-accent': '#C60B1E' }  
            };
            
            const theme = countryThemes[countryCode];
            if (theme) {
                Object.entries(theme).forEach(([property, value]) => {
                    document.documentElement.style.setProperty(property, value);
                });
                
                this.greetingElement.classList.add('has-location-theme');
            }
        }
    }
    
    updateVisitStatistics() {
        try {
            const visits = JSON.parse(localStorage.getItem('portfolio-visits') || '{}');
            const country = this.userCountry || 'Unknown';
            
            if (!visits[country]) {
                visits[country] = 0;
            }
            
            visits[country]++;
            localStorage.setItem('portfolio-visits', JSON.stringify(visits));
            
            console.log(`📍 Visit from ${country}: ${visits[country]} total visits`);
            
        } catch (error) {
            console.warn('Could not update visit statistics:', error);
        }
    }
    
    getVisitStatistics() {
        try {
            return JSON.parse(localStorage.getItem('portfolio-visits') || '{}');
        } catch {
            return {};
        }
    }
    
    refreshGreeting() {
        this.detectUserLocation();
    }
    
    getCurrentLocation() {
        return this.userLocation;
    }
    
    getCurrentGreeting() {
        return this.greetingElement ? this.greetingElement.textContent : '';
    }
    
    setCustomGreeting(greeting) {
        this.updateGreeting(greeting);
    }
    
    addLocationStyles() {
        if (!document.querySelector('#location-greeting-styles')) {
            const style = document.createElement('style');
            style.id = 'location-greeting-styles';
            style.textContent = `
                .has-location-theme {
                    position: relative;
                }
                
                .has-location-theme::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: var(--location-accent, var(--primary-color));
                    border-radius: 1px;
                    opacity: 0.7;
                }
                
                #dynamic-greeting {
                    transition: all 0.3s ease;
                    display: inline-block;
                }
                

                @keyframes locationPulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                
                .location-detected {
                    animation: locationPulse 0.6s ease;
                }
                
                @media (prefers-reduced-motion: reduce) {
                    #dynamic-greeting {
                        transition: none;
                    }
                    
                    .location-detected {
                        animation: none;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    isLocationSharingAllowed() {
        return localStorage.getItem('location-sharing') === 'allowed';
    }
    
    setLocationSharingPreference(allowed) {
        localStorage.setItem('location-sharing', allowed ? 'allowed' : 'denied');
    }
    
    clearLocationData() {
        this.userLocation = null;
        this.userCountry = null;
        this.userTimezone = null;
        localStorage.removeItem('portfolio-visits');
        this.setInitialGreeting();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('dynamic-greeting')) {
        window.geolocationGreeting = new GeolocationGreeting();
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeolocationGreeting;
}

console.log('Geolocation greeting module loaded');