// Theme switching functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeDropdown = document.getElementById('theme-dropdown');
    const body = document.body;
    
    // Load saved theme from localStorage or default to 'classic'
    const savedTheme = localStorage.getItem('latinLearnTheme') || 'classic';
    setTheme(savedTheme);
    themeDropdown.value = savedTheme;
    
    // Listen for theme changes
    themeDropdown.addEventListener('change', function() {
        const selectedTheme = this.value;
        setTheme(selectedTheme);
        localStorage.setItem('latinLearnTheme', selectedTheme);
    });
    
    function setTheme(theme) {
        // Remove all theme classes
        body.classList.remove('theme-classic', 'theme-modern', 'theme-vibrant', 'theme-ancient', 'theme-academic');
        
        // Add selected theme class
        body.classList.add('theme-' + theme);
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add animation on scroll for feature cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all feature cards, path steps, and testimonial cards
    document.querySelectorAll('.feature-card, .path-step, .testimonial-card').forEach(card => {
        observer.observe(card);
    });
});
