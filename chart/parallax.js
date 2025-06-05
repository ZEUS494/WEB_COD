document.addEventListener('DOMContentLoaded', () => {
    const starCount = 350;
    const starsContainer = document.getElementById('stars');

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        const size = Math.random() * 3 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.dataset.parallaxFactor = (size / 4).toFixed(2);
        
        star.style.left = `${Math.random() * 100}vw`;
        star.style.top = `${Math.random() * 100}vh`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        
        starsContainer.appendChild(star);
    }

    document.addEventListener('mousemove', (e) => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const deltaX = (e.clientX - centerX) / centerX;
        const deltaY = (e.clientY - centerY) / centerY;

        document.querySelectorAll('.star').forEach(star => {
            const factor = parseFloat(star.dataset.parallaxFactor);
            const offsetX = deltaX * factor * 15;
            const offsetY = deltaY * factor * 15;
            star.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        });

        document.querySelectorAll('.chart').forEach(chart => {
            const factor = parseFloat(chart.dataset.parallaxFactor);
            const offsetX = deltaX * factor * 30;
            const offsetY = deltaY * factor * 30;
            chart.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        });
    });

    const bars = document.querySelectorAll('.bar div');
    bars.forEach(bar => {
        const initialHeight = bar.style.height;
        bar.style.height = '0';
        
        setTimeout(() => {
            bar.style.transition = 'height 1s ease';
            bar.style.height = initialHeight;
        }, 100);
    });
});