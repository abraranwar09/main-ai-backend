document.getElementById('google-login-button').addEventListener('click', function() {
   console.log('Google login button clicked');
    // Redirect to the Google authentication route
    window.location.href = '/auth/google';
  });