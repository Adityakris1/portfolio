// Advanced 3D Portfolio JavaScript - Fixed Navigation and Links
// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Performance and compatibility checks
    const supportsWebGL = (() => {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
        } catch(e) {
            return false;
        }
    })();
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Global animation state
    let animationFrameId;
    let isPageVisible = true;
    
    // Page visibility API for performance optimization
    document.addEventListener('visibilitychange', () => {
        isPageVisible = !document.hidden;
        if (!isPageVisible && animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        } else if (isPageVisible) {
            startAnimations();
        }
    });
    
    // =================== ENSURE EXTERNAL LINKS WORK ===================
    function ensureExternalLinksWork() {
        // Project links
        const projectLinks = document.querySelectorAll('.project-link');
        projectLinks.forEach(link => {
            const url = link.getAttribute('href');
            if (url && url.startsWith('http')) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
                // Remove any existing event listeners that might interfere
                link.onclick = null;
                console.log('✅ Project link configured:', url);
            }
        });
        
        // Certification links
        const certLinks = document.querySelectorAll('.cert-link');
        certLinks.forEach(link => {
            const url = link.getAttribute('href');
            if (url && url.startsWith('http')) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
                link.onclick = null;
                console.log('✅ Certification link configured:', url);
            }
        });
        
        // Social media links
        const socialLinks = document.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            const url = link.getAttribute('href');
            if (url && url.startsWith('http')) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
                link.onclick = null;
                console.log('✅ Social link configured:', url);
            }
        });
    }
    
    // =================== CUSTOM CURSOR SYSTEM ===================
    class CustomCursor {
        constructor() {
            this.cursor = document.querySelector('.custom-cursor');
            this.dot = document.querySelector('.cursor-dot');
            this.outline = document.querySelector('.cursor-outline');
            this.trail = document.querySelector('.cursor-trail');
            
            this.mouseX = 0;
            this.mouseY = 0;
            this.outlineX = 0;
            this.outlineY = 0;
            
            this.trails = [];
            this.maxTrails = 20;
            
            this.init();
        }
        
        init() {
            if (isMobile) {
                document.body.style.cursor = 'auto';
                return;
            }
            
            // Mouse move handler
            document.addEventListener('mousemove', (e) => {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
                
                // Update dot position immediately
                this.dot.style.left = this.mouseX + 'px';
                this.dot.style.top = this.mouseY + 'px';
                
                // Add trail
                this.addTrail(this.mouseX, this.mouseY);
            });
            
            // Hover effects
            const hoverElements = document.querySelectorAll('a, button, .nav-item, .skill-badge, .project-card');
            hoverElements.forEach(el => {
                el.addEventListener('mouseenter', () => this.setHoverState(true));
                el.addEventListener('mouseleave', () => this.setHoverState(false));
            });
            
            this.animate();
        }
        
        addTrail(x, y) {
            if (this.trails.length >= this.maxTrails) {
                this.trails.shift();
            }
            
            this.trails.push({
                x: x,
                y: y,
                life: 1,
                decay: 0.05
            });
        }
        
        setHoverState(isHovering) {
            if (isHovering) {
                this.outline.style.transform = 'translate(-50%, -50%) scale(1.5)';
                this.outline.style.borderColor = '#ffffff';
                this.dot.style.transform = 'translate(-50%, -50%) scale(1.5)';
            } else {
                this.outline.style.transform = 'translate(-50%, -50%) scale(1)';
                this.outline.style.borderColor = '#ffffff';
                this.dot.style.transform = 'translate(-50%, -50%) scale(1)';
            }
        }
        
        animate() {
            // Smooth outline following
            this.outlineX += (this.mouseX - this.outlineX) * 0.2;
            this.outlineY += (this.mouseY - this.outlineY) * 0.2;
            
            this.outline.style.left = this.outlineX + 'px';
            this.outline.style.top = this.outlineY + 'px';
            
            // Update trails
            this.updateTrails();
            
            if (isPageVisible) {
                requestAnimationFrame(() => this.animate());
            }
        }
        
        updateTrails() {
            this.trails.forEach((trail, index) => {
                trail.life -= trail.decay;
                if (trail.life <= 0) {
                    this.trails.splice(index, 1);
                    return;
                }
                
                // Create trail element if needed
                if (!trail.element) {
                    trail.element = document.createElement('div');
                    trail.element.className = 'cursor-trail-particle';
                    trail.element.style.position = 'absolute';
                    trail.element.style.width = '2px';
                    trail.element.style.height = '2px';
                    trail.element.style.background = '#ffffff';
                    trail.element.style.borderRadius = '50%';
                    trail.element.style.pointerEvents = 'none';
                    trail.element.style.zIndex = '9998';
                    document.body.appendChild(trail.element);
                }
                
                // Update trail element
                trail.element.style.left = trail.x + 'px';
                trail.element.style.top = trail.y + 'px';
                trail.element.style.opacity = trail.life;
                trail.element.style.transform = `translate(-50%, -50%) scale(${trail.life})`;
            });
        }
    }
    
    // =================== MATRIX RAIN EFFECT ===================
    class MatrixRain {
        constructor() {
            this.canvas = document.getElementById('matrixCanvas');
            this.ctx = this.canvas.getContext('2d');
            this.chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
            this.charArray = this.chars.split('');
            this.fontSize = 14;
            this.columns = 0;
            this.drops = [];
            
            this.init();
        }
        
        init() {
            this.resize();
            window.addEventListener('resize', () => this.resize());
            this.animate();
        }
        
        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.columns = Math.floor(this.canvas.width / this.fontSize);
            
            // Initialize drops
            this.drops = [];
            for (let i = 0; i < this.columns; i++) {
                this.drops[i] = Math.random() * -100;
            }
        }
        
        animate() {
            if (!isPageVisible || prefersReducedMotion) {
                requestAnimationFrame(() => this.animate());
                return;
            }
            
            // Black background with slight transparency for trail effect
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Matrix rain effect
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = this.fontSize + 'px Courier New';
            
            for (let i = 0; i < this.drops.length; i++) {
                const char = this.charArray[Math.floor(Math.random() * this.charArray.length)];
                const x = i * this.fontSize;
                const y = this.drops[i] * this.fontSize;
                
                this.ctx.fillText(char, x, y);
                
                if (y > this.canvas.height && Math.random() > 0.975) {
                    this.drops[i] = 0;
                }
                this.drops[i]++;
            }
            
            requestAnimationFrame(() => this.animate());
        }
    }
    
    // =================== 3D PARTICLE SYSTEM ===================
    class ParticleSystem {
        constructor() {
            this.particles = [];
            this.maxParticles = isMobile ? 30 : 60;
            this.container = document.querySelector('.particle-system');
            
            this.init();
        }
        
        init() {
            // Create initial particles
            for (let i = 0; i < this.maxParticles; i++) {
                this.createParticle();
            }
            
            this.animate();
        }
        
        createParticle() {
            const particle = {
                element: document.createElement('div'),
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 10,
                size: Math.random() * 4 + 1,
                speedX: (Math.random() - 0.5) * 2,
                speedY: -Math.random() * 3 - 1,
                life: 1,
                decay: Math.random() * 0.01 + 0.005
            };
            
            // Style particle
            particle.element.style.position = 'absolute';
            particle.element.style.width = particle.size + 'px';
            particle.element.style.height = particle.size + 'px';
            particle.element.style.background = '#ffffff';
            particle.element.style.borderRadius = '50%';
            particle.element.style.pointerEvents = 'none';
            particle.element.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.8)';
            
            this.container.appendChild(particle.element);
            this.particles.push(particle);
        }
        
        updateParticle(particle) {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.life -= particle.decay;
            
            // Update position
            particle.element.style.left = particle.x + 'px';
            particle.element.style.top = particle.y + 'px';
            particle.element.style.opacity = particle.life;
            particle.element.style.transform = `scale(${particle.life})`;
            
            // Remove if dead or off screen
            if (particle.life <= 0 || particle.y < -50) {
                particle.element.remove();
                return false;
            }
            
            return true;
        }
        
        animate() {
            if (!isPageVisible || prefersReducedMotion) {
                requestAnimationFrame(() => this.animate());
                return;
            }
            
            // Update existing particles
            this.particles = this.particles.filter(particle => this.updateParticle(particle));
            
            // Create new particles
            while (this.particles.length < this.maxParticles) {
                this.createParticle();
            }
            
            requestAnimationFrame(() => this.animate());
        }
    }
    
    // =================== TYPEWRITER EFFECT ===================
    class TypewriterEffect {
        constructor(element, text, speed = 80) {
            this.element = element;
            this.text = text;
            this.speed = speed;
            this.currentIndex = 0;
            this.isDeleting = false;
            this.isComplete = false;
        }
        
        type() {
            if (this.isComplete) return;
            
            const currentText = this.text.substring(0, this.currentIndex);
            this.element.textContent = currentText;
            
            if (!this.isDeleting && this.currentIndex < this.text.length) {
                this.currentIndex++;
                setTimeout(() => this.type(), this.speed);
            } else if (this.currentIndex === this.text.length) {
                this.isComplete = true;
                // Add blinking cursor
                this.element.style.borderRight = '2px solid #ffffff';
            }
        }
        
        start() {
            this.element.textContent = '';
            setTimeout(() => this.type(), 500);
        }
    }
    
    // =================== GLITCH EFFECT ===================
    class GlitchEffect {
        constructor(element) {
            this.element = element;
            this.originalText = element.getAttribute('data-text') || element.textContent;
            this.chars = '!<>-_\\/[]{}—=+*^?#________';
            this.isGlitching = false;
        }
        
        glitch() {
            if (this.isGlitching) return;
            this.isGlitching = true;
            
            const iterations = 10;
            let iteration = 0;
            
            const glitchInterval = setInterval(() => {
                this.element.textContent = this.originalText
                    .split('')
                    .map((char, index) => {
                        if (index < iteration) {
                            return this.originalText[index];
                        }
                        return this.chars[Math.floor(Math.random() * this.chars.length)];
                    })
                    .join('');
                
                if (iteration >= this.originalText.length) {
                    clearInterval(glitchInterval);
                    this.element.textContent = this.originalText;
                    this.isGlitching = false;
                }
                
                iteration += 1/3;
            }, 30);
        }
        
        startRandomGlitch() {
            setInterval(() => {
                if (Math.random() > 0.95 && !this.isGlitching) {
                    this.glitch();
                }
            }, 100);
        }
    }
    
    // =================== FIXED NAVIGATION SYSTEM ===================
    class NavigationSystem {
        constructor() {
            this.navItems = document.querySelectorAll('.nav-item');
            this.sections = document.querySelectorAll('section');
            this.currentSection = 'hero';
            
            this.init();
        }
        
        init() {
            // Clear any existing event listeners and setup fresh ones
            this.navItems.forEach(item => {
                // Clone node to remove all event listeners
                const newItem = item.cloneNode(true);
                item.parentNode.replaceChild(newItem, item);
                
                // Add click handler for internal navigation only
                newItem.addEventListener('click', (e) => {
                    const href = newItem.getAttribute('href');
                    
                    // Only handle internal navigation
                    if (href && href.startsWith('#')) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const sectionId = href.substring(1);
                        this.scrollToSection(sectionId);
                        this.updateActiveNav(sectionId);
                        
                        console.log('🎯 Navigating to section:', sectionId);
                    }
                });
            });
            
            // Re-query nav items after cloning
            this.navItems = document.querySelectorAll('.nav-item');
            
            // Setup scroll spy
            this.setupScrollSpy();
        }
        
        scrollToSection(sectionId) {
            const targetSection = document.getElementById(sectionId);
            if (!targetSection) {
                console.warn('⚠️ Section not found:', sectionId);
                return;
            }
            
            const navHeight = document.querySelector('.floating-nav')?.offsetHeight || 80;
            const offsetTop = targetSection.offsetTop - navHeight - 20;
            
            window.scrollTo({
                top: Math.max(0, offsetTop),
                behavior: 'smooth'
            });
            
            console.log('✅ Scrolled to section:', sectionId);
        }
        
        setupScrollSpy() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                        this.updateActiveNav(entry.target.id);
                    }
                });
            }, {
                threshold: [0.3],
                rootMargin: '-80px 0px -50% 0px'
            });
            
            this.sections.forEach(section => {
                if (section.id) {
                    observer.observe(section);
                }
            });
        }
        
        updateActiveNav(sectionId) {
            if (this.currentSection === sectionId) return;
            
            this.currentSection = sectionId;
            this.navItems.forEach(nav => nav.classList.remove('active'));
            
            const activeNav = document.querySelector(`[data-section="${sectionId}"], [href="#${sectionId}"]`);
            if (activeNav) {
                activeNav.classList.add('active');
                console.log('🎯 Active nav updated to:', sectionId);
            }
        }
    }
    
    // =================== CONTACT FORM SYSTEM ===================
    class ContactFormSystem {
        constructor() {
            this.form = document.getElementById('messageForm');
            this.modal = document.getElementById('successModal');
            
            this.init();
        }
        
        init() {
            if (!this.form) return;
            
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            this.setupModalHandlers();
            this.setupInputAnimations();
        }
        
        async handleSubmit(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const submitBtn = this.form.querySelector('.holographic-submit-button');
            const buttonText = submitBtn.querySelector('.button-text');
            const originalText = buttonText.textContent;
            
            // Get form data
            const formData = {
                name: document.getElementById('senderName').value.trim(),
                email: document.getElementById('senderEmail').value.trim(),
                subject: document.getElementById('messageSubject').value.trim(),
                message: document.getElementById('messageContent').value.trim()
            };
            
            // Validate
            if (!this.validateForm(formData)) return;
            
            // Animate button
            this.setButtonState(submitBtn, buttonText, 'Preparing transmission...', true);
            
            try {
                // Simulate processing
                await this.simulateProcessing(submitBtn, buttonText);
                
                // Create WhatsApp message
                const whatsappMessage = this.createWhatsAppMessage(formData);
                const phoneNumber = '917985930166';
                const whatsappURL = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;
                
                // Open WhatsApp
                const opened = window.open(whatsappURL, '_blank', 'noopener,noreferrer');
                
                if (opened) {
                    this.setButtonState(submitBtn, buttonText, 'Message transmitted!', false);
                    this.showModal();
                    
                    // Reset form
                    setTimeout(() => {
                        this.form.reset();
                        this.setButtonState(submitBtn, buttonText, originalText, false);
                    }, 3000);
                } else {
                    throw new Error('Failed to open WhatsApp');
                }
                
            } catch (error) {
                console.error('Transmission error:', error);
                this.setButtonState(submitBtn, buttonText, 'Transmission failed - retry?', false);
                
                setTimeout(() => {
                    this.setButtonState(submitBtn, buttonText, originalText, false);
                }, 3000);
            }
        }
        
        validateForm(data) {
            const { name, email, subject, message } = data;
            
            if (!name || !email || !subject || !message) {
                this.showError('All fields are required for transmission');
                return false;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                this.showError('Invalid email format detected');
                return false;
            }
            
            return true;
        }
        
        async simulateProcessing(button, buttonText) {
            const stages = [
                'Encoding message...',
                'Establishing connection...',
                'Encrypting data...',
                'Transmitting signal...'
            ];
            
            for (let i = 0; i < stages.length; i++) {
                this.setButtonState(button, buttonText, stages[i], true);
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        createWhatsAppMessage(data) {
            const message = `*PORTFOLIO CONTACT REQUEST*%0A%0A` +
                `*Name:* ${encodeURIComponent(data.name)}%0A` +
                `*Email:* ${encodeURIComponent(data.email)}%0A` +
                `*Subject:* ${encodeURIComponent(data.subject)}%0A%0A` +
                `*Message:*%0A${encodeURIComponent(data.message)}%0A%0A` +
                `*Source:* Advanced Portfolio Interface`;
            
            return message;
        }
        
        setButtonState(button, textElement, text, disabled) {
            textElement.textContent = text;
            button.disabled = disabled;
            
            if (disabled) {
                button.style.opacity = '0.7';
                button.style.cursor = 'not-allowed';
            } else {
                button.style.opacity = '1';
                button.style.cursor = 'pointer';
            }
        }
        
        showError(message) {
            const errorDiv = document.createElement('div');
            errorDiv.textContent = message;
            errorDiv.style.cssText = `
                position: fixed;
                top: 100px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.95);
                color: #ffffff;
                padding: 1rem 2rem;
                border: 2px solid #ffffff;
                border-radius: 25px;
                z-index: 10002;
                font-family: 'Courier New', monospace;
                box-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
                animation: errorSlideIn 0.3s ease;
            `;
            
            // Add animation CSS
            const style = document.createElement('style');
            style.textContent = `
                @keyframes errorSlideIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(errorDiv);
            setTimeout(() => {
                errorDiv.remove();
                style.remove();
            }, 4000);
        }
        
        showModal() {
            if (this.modal) {
                this.modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
                console.log('✅ Success modal displayed');
            }
        }
        
        closeModal() {
            if (this.modal) {
                this.modal.classList.add('hidden');
                document.body.style.overflow = 'auto';
                console.log('✅ Modal closed');
            }
        }
        
        setupModalHandlers() {
            // Close button
            const closeBtn = this.modal?.querySelector('.holographic-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal());
            }
            
            // Overlay click
            const overlay = this.modal?.querySelector('.modal-overlay');
            if (overlay) {
                overlay.addEventListener('click', () => this.closeModal());
            }
            
            // Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') this.closeModal();
            });
            
            // Make close function global for HTML onclick
            window.closeModal = () => this.closeModal();
        }
        
        setupInputAnimations() {
            const inputs = this.form?.querySelectorAll('.holographic-input');
            
            inputs?.forEach(input => {
                input.addEventListener('focus', () => {
                    input.style.transform = 'translateY(-2px) scale(1.02)';
                    input.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.8)';
                });
                
                input.addEventListener('blur', () => {
                    input.style.transform = 'translateY(0) scale(1)';
                    if (input.value.trim() === '') {
                        input.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.3)';
                    } else {
                        input.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.6)';
                    }
                });
                
                input.addEventListener('input', () => {
                    if (input.value.trim() !== '') {
                        input.style.borderColor = '#ffffff';
                        input.style.boxShadow = '0 0 25px rgba(255, 255, 255, 0.7)';
                    }
                });
            });
        }
    }
    
    // =================== 3D ANIMATIONS ===================
    class Animation3D {
        constructor() {
            this.mouseX = 0;
            this.mouseY = 0;
            this.init();
        }
        
        init() {
            // Mouse tracking for 3D effects
            document.addEventListener('mousemove', (e) => {
                this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
                this.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
            });
            
            this.setupCardAnimations();
            this.setupScrollAnimations();
        }
        
        setupCardAnimations() {
            const cards = document.querySelectorAll('.holographic-card, .floating-hologram, .holographic-project');
            
            cards.forEach(card => {
                card.addEventListener('mouseenter', (e) => {
                    const rect = card.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    
                    const rotateX = (e.clientY - centerY) / 10;
                    const rotateY = (centerX - e.clientX) / 10;
                    
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(50px)`;
                });
                
                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
                });
                
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    
                    const rotateX = (e.clientY - centerY) / 15;
                    const rotateY = (centerX - e.clientX) / 15;
                    
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(50px)`;
                });
            });
        }
        
        setupScrollAnimations() {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        
                        // Stagger animation for child elements
                        const children = entry.target.querySelectorAll('.skill-badge, .tech-tag, .timeline-item');
                        children.forEach((child, index) => {
                            setTimeout(() => {
                                child.classList.add('animate-in');
                            }, index * 100);
                        });
                    }
                });
            }, observerOptions);
            
            // Observe elements
            const animateElements = document.querySelectorAll(`
                .floating-hologram,
                .floating-skill-pod,
                .holographic-project,
                .floating-certificate,
                .floating-leadership,
                .holographic-contact-card
            `);
            
            animateElements.forEach(el => {
                observer.observe(el);
            });
        }
    }
    
    // =================== PERFORMANCE MONITOR ===================
    class PerformanceMonitor {
        constructor() {
            this.fps = 0;
            this.lastTime = performance.now();
            this.frameCount = 0;
            
            this.init();
        }
        
        init() {
            this.monitorFPS();
            this.optimizeForDevice();
        }
        
        monitorFPS() {
            const now = performance.now();
            this.frameCount++;
            
            if (now - this.lastTime >= 1000) {
                this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
                this.frameCount = 0;
                this.lastTime = now;
                
                // Adjust quality based on FPS
                if (this.fps < 30) {
                    this.reduceAnimations();
                }
            }
            
            requestAnimationFrame(() => this.monitorFPS());
        }
        
        optimizeForDevice() {
            // Reduce effects on low-end devices
            if (isMobile || navigator.hardwareConcurrency < 4) {
                document.body.classList.add('low-performance');
                this.reduceParticleCount();
            }
        }
        
        reduceAnimations() {
            const heavyAnimations = document.querySelectorAll('.geo-shape, .shape-3d');
            heavyAnimations.forEach(el => {
                el.style.animationDuration = '60s';
            });
        }
        
        reduceParticleCount() {
            const particleElements = document.querySelectorAll('.particle-system > *');
            particleElements.forEach((el, index) => {
                if (index % 2 === 0) el.remove();
            });
        }
    }
    
    // =================== INITIALIZATION ===================
    function initializePortfolio() {
        console.log('🚀 Initializing Advanced 3D Portfolio...');
        
        // CRITICAL: Ensure external links work FIRST
        ensureExternalLinksWork();
        
        // Initialize custom cursor
        if (!isMobile) {
            new CustomCursor();
        }
        
        // Initialize Matrix rain effect
        if (supportsWebGL && !prefersReducedMotion) {
            new MatrixRain();
        }
        
        // Initialize particle system
        if (!prefersReducedMotion) {
            new ParticleSystem();
        }
        
        // Initialize 3D animations
        new Animation3D();
        
        // Initialize navigation - CRITICAL FIX
        new NavigationSystem();
        
        // Initialize contact form
        new ContactFormSystem();
        
        // Initialize performance monitoring
        new PerformanceMonitor();
        
        // Setup typewriter effects
        setTimeout(() => {
            const typewriterElement = document.querySelector('.typewriter');
            if (typewriterElement) {
                const text = typewriterElement.getAttribute('data-text');
                if (text) {
                    const typewriter = new TypewriterEffect(typewriterElement, text, 60);
                    typewriter.start();
                }
            }
        }, 1500);
        
        // Setup glitch effects
        setTimeout(() => {
            const glitchElements = document.querySelectorAll('.glitch-effect, .glitch-text, .glitch-project-title');
            glitchElements.forEach(el => {
                const glitch = new GlitchEffect(el);
                glitch.startRandomGlitch();
            });
        }, 2000);
        
        // Setup scroll-triggered animations
        setupScrollAnimations();
        
        // Setup interactive elements
        setupInteractiveElements();
        
        // Setup entrance animations
        setTimeout(() => {
            document.body.classList.add('loaded');
            triggerEntranceAnimations();
        }, 1000);
        
        // Re-ensure links work after everything is loaded
        setTimeout(() => {
            ensureExternalLinksWork();
        }, 3000);
        
        console.log('✨ Advanced 3D Portfolio fully initialized!');
        console.log('🎯 Features activated:');
        console.log('  ✅ Fixed navigation system');
        console.log('  ✅ External links verified');
        console.log('  ✅ Custom cursor with particle trails');
        console.log('  ✅ Matrix rain background animation');
        console.log('  ✅ 3D floating particle system');
        console.log('  ✅ Interactive holographic cards');
        console.log('  ✅ Glitch text effects');
        console.log('  ✅ WhatsApp contact form integration');
        console.log('  ✅ Performance optimization system');
    }
    
    function setupScrollAnimations() {
        // Parallax effects
        let ticking = false;
        
        function updateParallax() {
            const scrollY = window.pageYOffset;
            
            // Hero parallax
            const heroElements = document.querySelectorAll('.floating-3d-shapes > *');
            heroElements.forEach((el, index) => {
                const speed = 0.5 + (index * 0.1);
                const yPos = scrollY * speed;
                const rotation = scrollY * 0.1;
                el.style.transform = `translateY(${yPos}px) rotate(${rotation}deg)`;
            });
            
            // Background geometric shapes
            const geoShapes = document.querySelectorAll('.geo-shape');
            geoShapes.forEach((shape, index) => {
                const speed = 0.2 + (index * 0.05);
                const yPos = scrollY * speed;
                shape.style.transform = `translateY(${yPos}px)`;
            });
            
            ticking = false;
        }
        
        function requestParallaxUpdate() {
            if (!ticking && isPageVisible) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', requestParallaxUpdate, { passive: true });
    }
    
    function setupInteractiveElements() {
        // Skill badges interaction
        const skillBadges = document.querySelectorAll('.orbiting-skill');
        skillBadges.forEach(badge => {
            badge.addEventListener('mouseenter', () => {
                badge.style.transform = 'translateY(-10px) scale(1.1) rotateX(15deg)';
                badge.style.boxShadow = '0 10px 30px rgba(255, 255, 255, 0.5)';
            });
            
            badge.addEventListener('mouseleave', () => {
                badge.style.transform = 'translateY(0) scale(1) rotateX(0deg)';
                badge.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.3)';
            });
        });
        
        // Project cards interaction
        const projectCards = document.querySelectorAll('.holographic-project');
        projectCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                // Add scanning effect
                const scanLines = card.querySelector('.project-scan-lines');
                if (scanLines) {
                    scanLines.style.animationDuration = '0.5s';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                const scanLines = card.querySelector('.project-scan-lines');
                if (scanLines) {
                    scanLines.style.animationDuration = '3s';
                }
            });
        });
        
        // Social links interaction
        const socialLinks = document.querySelectorAll('.social-3d');
        socialLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                const particles = link.querySelector('.link-particle-trail');
                if (particles) {
                    particles.style.animation = 'particleTrail 0.5s ease-out infinite';
                }
            });
        });
    }
    
    function triggerEntranceAnimations() {
        // Hero elements entrance
        const heroElements = document.querySelectorAll('.hero-name, .hero-title, .hero-contact');
        heroElements.forEach((el, index) => {
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0) rotateX(0deg)';
                el.style.transition = 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            }, index * 300);
        });
        
        // Navigation entrance
        setTimeout(() => {
            const nav = document.querySelector('.floating-nav');
            if (nav) {
                nav.style.opacity = '1';
                nav.style.transform = 'translateX(-50%) translateY(0)';
            }
        }, 500);
        
        // Section titles entrance
        const sectionTitles = document.querySelectorAll('.section-title');
        const titleObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'titleMorph 1s ease forwards';
                }
            });
        }, { threshold: 0.5 });
        
        sectionTitles.forEach(title => {
            titleObserver.observe(title);
        });
    }
    
    function startAnimations() {
        if (animationFrameId) return;
        
        function animate() {
            if (isPageVisible && !prefersReducedMotion) {
                // Add any continuous animations here
                animationFrameId = requestAnimationFrame(animate);
            }
        }
        
        animate();
    }
    
    // Error handling
    window.addEventListener('error', (e) => {
        console.error('Portfolio Error:', e.error);
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled Promise Rejection:', e.reason);
    });
    
    // Initialize everything
    initializePortfolio();
    startAnimations();
    
    // Expose some functions globally for debugging
    if (typeof window !== 'undefined') {
        window.portfolioDebug = {
            isPageVisible,
            isMobile,
            supportsWebGL,
            prefersReducedMotion,
            ensureExternalLinksWork
        };
    }
});

// CSS for dynamic elements (added via JavaScript)
const dynamicStyles = `
    /* Initial states for animations */
    .hero-name, .hero-title, .hero-contact {
        opacity: 0;
        transform: translateY(50px) rotateX(15deg);
    }
    
    .floating-nav {
        opacity: 0;
        transform: translateX(-50%) translateY(-20px);
        transition: all 0.5s ease;
    }
    
    body.loaded .floating-nav {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
    
    /* Animation classes */
    .animate-in {
        animation: slideInUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(50px) rotateX(15deg);
        }
        to {
            opacity: 1;
            transform: translateY(0) rotateX(0deg);
        }
    }
    
    /* Low performance mode */
    .low-performance * {
        animation-duration: 10s !important;
        transition-duration: 0.2s !important;
    }
    
    .low-performance .geo-shape,
    .low-performance .shape-3d {
        animation: none !important;
    }
    
    /* Cursor trail particles */
    .cursor-trail-particle {
        position: fixed;
        pointer-events: none;
        z-index: 9998;
        border-radius: 50%;
        background: #ffffff;
        box-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
    }
    
    /* Enhanced hover states */
    .nav-item:hover .nav-icon {
        animation: iconBounce 0.6s ease;
    }
    
    @keyframes iconBounce {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-5px) scale(1.2); }
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .cursor-dot, .cursor-outline, .cursor-trail {
            display: none;
        }
        
        .floating-nav {
            width: 95%;
        }
        
        .nav-text {
            display: none;
        }
        
        .holographic-card {
            transform: none !important;
        }
        
        .floating-hologram:hover {
            transform: translateY(-10px) !important;
        }
    }
    
    /* Print styles */
    @media print {
        .matrix-bg, .geometric-bg, .animated-background, 
        .floating-nav, .custom-cursor, .particle-system {
            display: none !important;
        }
        
        body {
            background: white !important;
            color: black !important;
        }
    }
`;

// Inject dynamic styles
const styleSheet = document.createElement('style');
styleSheet.textContent = dynamicStyles;
document.head.appendChild(styleSheet);