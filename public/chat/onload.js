document.addEventListener('DOMContentLoaded', () => {
    // Generate a session_id using the current timestamp
    const sessionId = `session_${Date.now()}`;
    // Save the session_id to local storage
    localStorage.setItem('session_id', sessionId);

    const toolToggles = document.querySelectorAll('.tool-toggle');

    // Fetch and update suggestion cards
    fetch('/ai/suggest')
        .then(response => response.json())
        .then(data => {
            // Update card contents
            const updateCard = document.getElementById('updateCard');
            const researchCard = document.getElementById('researchCard');
            const learnCard = document.getElementById('learnCard');

            if (updateCard) {
                updateCard.querySelector('p').textContent = data.update_topic;
            }
            if (researchCard) {
                researchCard.querySelector('p').textContent = data.research_topic;
            }
            if (learnCard) {
                learnCard.querySelector('p').textContent = data.learn_topic;
            }
        })
        .catch(error => console.error('Error fetching suggestions:', error));

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    toolToggles.forEach(toolToggle => {
        toolToggle.addEventListener('click', () => {
            toolToggle.classList.toggle('active');
        });
    });
});