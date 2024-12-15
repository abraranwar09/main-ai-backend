// Generate a random session ID and save it to local storage
window.addEventListener('load', () => {
    const timestamp = Date.now();
    const sessionId = `session_${timestamp}`;
    localStorage.setItem('session_id', sessionId);

    // Initialize Lottie animation for the main content
    var animation = lottie.loadAnimation({
        container: document.getElementById('lottieAnimation'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '../assets/loader2.json' // Path to your Lottie animation file
    });

    // Initialize Lottie animation for the background
    var bgAnimation = lottie.loadAnimation({
        container: document.getElementById('bgAnimation'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '../assets/bg.json' // Path to your background Lottie animation file
    });

    // Check if there are messages in the main container
    function checkMessages() {
        const mainContainer = document.getElementById('mainContainer');
        const loadingScreen = document.getElementById('loadingScreen');
        // Exclude the skeletonLoader from the check
        const hasMessages = Array.from(mainContainer.children).some(child => 
            child.style.display !== 'none' && child.id !== 'skeletonLoader'
        );
        if (!hasMessages) {
            loadingScreen.style.display = 'flex';
            mainContainer.style.display = 'none';
        } else {
            loadingScreen.style.display = 'none';
            mainContainer.style.display = 'block';
        }
    }

    // Call checkMessages on page load
    checkMessages();
});

document.getElementById('showInput').addEventListener('click', () => {
    const messageInput = document.getElementById('messageInputContainer');
    
    if (messageInput.classList.contains('show')) {
        messageInput.classList.remove('animate__slideInUp');
        messageInput.classList.add('animate__slideOutDown');
    } else {
        messageInput.classList.remove('animate__slideOutDown');
        messageInput.classList.add('animate__slideInUp');
    }
    
    messageInput.classList.toggle('show');
    setTimeout(() => {
        messageInput.classList.toggle('hide');
    }, 500);
});

// Add hover effects to buttons
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('mouseenter', () => {
        button.style.opacity = '0.8';
    });
    button.addEventListener('mouseleave', () => {
        button.style.opacity = '1';
    });
});

const messageInput = document.getElementById('messageInput');

messageInput.addEventListener('input', () => {
    // Reset the height to allow shrinking
    messageInput.style.height = 'auto';
    // Set the height to the scroll height to expand
    messageInput.style.height = messageInput.scrollHeight + 'px';
});
