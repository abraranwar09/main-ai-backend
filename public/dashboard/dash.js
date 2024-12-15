
document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.logo, .card, .feature-item, h1, .bottom-nav');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        setTimeout(() => {
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });
});


// General Chat Card
document.getElementById('generalChatCard').addEventListener('click', () => {
    window.location.href = '/chat';
});