        // Add hover effects to buttons
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.opacity = '0.8';
            });
            button.addEventListener('mouseleave', () => {
                button.style.opacity = '1';
            });
        });
