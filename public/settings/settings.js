// Load settings from localStorage when page loads
document.addEventListener('DOMContentLoaded', () => {
    const systemPrompt = localStorage.getItem('custom_prompt');
    const temperature = localStorage.getItem('custom_temp');
    const temperatureInput = document.getElementById('temperature');

    // Set values if they exist
    if (systemPrompt) {
        document.getElementById('system-prompt').value = systemPrompt;
    }
    if (temperature) {
        temperatureInput.value = temperature;
    }

    // Add temperature input validation
    temperatureInput.addEventListener('input', () => {
        let value = parseFloat(temperatureInput.value);
        if (value > 2) temperatureInput.value = 2;
        if (value < 0) temperatureInput.value = 0;
    });
});

// Create alert element function
function createAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 1rem;
        border-radius: 0.375rem;
        background-color: #def7ec;
        border: 1px solid #31c48d;
        color: #046c4e;
        z-index: 1000;
        transition: opacity 0.5s ease-in-out;
    `;
    alert.textContent = message;
    return alert;
}

// Handle save settings
document.querySelector('.btn-microsoft').addEventListener('click', () => {
    const systemPrompt = document.getElementById('system-prompt').value;
    const temperature = document.getElementById('temperature').value;

    // Save to localStorage (or remove if empty)
    if (systemPrompt.trim()) {
        localStorage.setItem('custom_prompt', systemPrompt);
    } else {
        localStorage.removeItem('custom_prompt');
    }

    if (temperature.trim()) {
        localStorage.setItem('custom_temp', temperature);
    } else {
        localStorage.removeItem('custom_temp');
    }

    // Show success alert
    const alert = createAlert('Settings saved successfully!');
    document.body.appendChild(alert);

    // Remove alert after 3 seconds
    setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 500);
    }, 3000);
});
