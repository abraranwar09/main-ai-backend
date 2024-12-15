document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const togglePassword = document.querySelector('#togglePassword');
    const passwordInput = document.querySelector('#password');

    togglePassword.addEventListener('click', () => {
        // Toggle the type attribute
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Reverse the icon logic
        const iconSrc = type === 'password' ? '../assets/eye-closed.png' : '../assets/eye.png';
        togglePassword.setAttribute('src', iconSrc);
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission

        const email = document.querySelector('#email').value;
        const password = passwordInput.value;

        try {
            const response = await fetch('/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('email', data.email);
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('userName', data.userName);
                showAlert('User created successfully', 'success');
                window.location.href = '/';
            } else {
                const errorText = await response.text();
                showAlert('Error creating user: ' + errorText, 'error');
            }
        } catch (error) {
            showAlert('Error creating user: ' + error.message, 'error');
        }
    });

    function showAlert(message, type) {
        const alertContainer = document.createElement('div');
        alertContainer.className = type === 'success' 
            ? 'bg-blue-100 border-t border-b border-blue-500 text-blue-700 px-4 py-3' 
            : 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative';
        alertContainer.setAttribute('role', 'alert');

        const alertContent = type === 'success' 
            ? `<p class="font-bold">Success</p><p class="text-sm">${message}</p>`
            : `<strong class="font-bold">Holy smokes!</strong><span class="block sm:inline">${message}</span>`;

        alertContainer.innerHTML = alertContent;

        // Append the alert to the alert container at the top of the page
        document.getElementById('alert-container').appendChild(alertContainer);

        setTimeout(() => {
            alertContainer.remove();
        }, 5000); // Remove alert after 5 seconds
    }
});


