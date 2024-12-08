const chatContent = document.querySelector('.chat-content');
const initialContent = document.querySelector('.initial-content');
const messageInput = document.querySelector('.message-input');
const sendButton = document.querySelector('.send-button');

function displayMessage(content, messageType) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', messageType, 'animate__animated', 'animate__fadeIn');
    messageElement.innerHTML = `<p>${content}</p>`;
    chatContent.appendChild(messageElement);

    // scroll to bottom
    chatContent.scrollTop = chatContent.scrollHeight;
}

