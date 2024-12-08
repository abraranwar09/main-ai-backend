document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    const historyList = document.getElementById('historyList');
    const chatContent = document.querySelector('.chat-content');

    // Add loading spinner
    historyList.className = 'history-list history-list-loading';
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    historyList.appendChild(spinner);

    if (userId) {
        fetch(`/ai/history/list/${userId}?last_n_items=20`)
            .then(response => response.json())
            .then(data => {
                // Remove loading spinner
                historyList.innerHTML = '';
                historyList.className = 'history-list';

                data.forEach(item => {
                    const historyItem = document.createElement('div');
                    historyItem.className = 'history-item';
                    historyItem.setAttribute('data-sessionid', item.session_id);

                    const historyIcon = document.createElement('div');
                    historyIcon.className = 'history-icon';
                    historyIcon.textContent = '💬';

                    const historyName = document.createElement('div');
                    historyName.className = 'history-name';
                    historyName.textContent = item.name;

                    historyItem.appendChild(historyIcon);
                    historyItem.appendChild(historyName);
                    historyList.appendChild(historyItem);

                    // Add click event listener to each history item
                    historyItem.addEventListener('click', () => {
                        // Clear the chat content
                        chatContent.innerHTML = '';

                        // Fetch messages for the selected session
                        const sessionId = historyItem.getAttribute('data-sessionid');
                        localStorage.setItem('session_id', sessionId);
                        fetch(`/ai/history/${sessionId}`)
                            .then(response => response.json())
                            .then(sessionData => {
                                // Restore tool states
                                const toolToggles = document.querySelectorAll('.tool-toggle');
                                toolToggles.forEach(toggle => {
                                    const toolType = toggle.getAttribute('data-tool');
                                    if (sessionData.tool_states && sessionData.tool_states[toolType] !== undefined) {
                                        toggle.classList.toggle('active', sessionData.tool_states[toolType]);
                                    } else {
                                        toggle.classList.remove('active');
                                    }
                                });

                                // Display messages
                                sessionData.messages.forEach(message => {
                                    if (message.role === 'user') {
                                        const messageContent = message.content.split("Hidden Context")[0];
                                        displayMessage(messageContent, 'user-message');
                                    } else if (message.role === 'assistant' && message.content !== null) {
                                        displayMessage(message.content, 'ai-message');
                                    }
                                });
                            })
                            .catch(error => console.error('Error fetching session data:', error));
                    });
                });
            })
            .catch(error => {
                console.error('Error fetching history:', error);
                // Show error state if fetch fails
                historyList.innerHTML = '<div style="color: var(--secondary-text); text-align: center; padding: 20px;">Failed to load chat history</div>';
            });
    } else {
        console.error('User ID not found in localStorage');
    }

    document.getElementById('newChatButton').addEventListener('click', () => {
        window.location.reload();
    });
});

