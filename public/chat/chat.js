const temperature = 0.5;

const today = new Date();
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
console.log('User Timezone:', userTimeZone);

const formattedToday = today.toLocaleString('en-US', { timeZone: userTimeZone }).replace(',', '');  

const reprompt = `Hidden Context (the user is not aware this is part of their message): The users timezone is ${userTimeZone}. The current date/time is ${formattedToday}.`;

const systemPrompt = `
Your name is OhanaPal. You are a helpful assistant. You can help the user with their questions and tasks. You can also use tools to help the user with their tasks. Format your responses as structured HTML with the appropriate tags and styling like lists, paragraphs, etc. 
Only respond in HTML no markdown. You have the ability to run parallel tool calls.
`;

let mediaRecorder;
let audioChunks = [];

// Function to start recording
async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
    };

    mediaRecorder.start();
}

// Function to stop recording and process audio
async function stopRecording() {
    return new Promise((resolve, reject) => {
        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Audio = reader.result.split(',')[1];
                try {
                    const response = await fetch('/ai/speech-to-text', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ audioData: base64Audio })
                    });
                    const data = await response.json();
                    resolve(data.transcription);
                } catch (error) {
                    console.error('Error during transcription:', error);
                    reject(error);
                }
            };
            reader.readAsDataURL(audioBlob);
        };

        mediaRecorder.stop();
    });
}

async function sendMessage(message) {
    
    // Step 1: Get session_id from local storage
    const session_id = localStorage.getItem('session_id');
    const userId = localStorage.getItem('userId'); // Assuming user_id is stored in local storage
    
    // Step 2: Send a request to the AI
    const requestBody = {
        session_id: session_id,
        user_id: userId,
        message: message + reprompt,
        tools: tools,
        custom_prompt: systemPrompt,
        custom_temp: temperature
    };

    try {
        const response = await fetch('/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (data.finish_reason === 'stop') {
            console.log(data);
            return data;
        } else if (data.finish_reason === 'tool_calls') {
            console.log(data);
            return data;
            // await handleToolCalls(data);
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('sendButton');
    const messageInput = document.getElementById('messageInput');
    const talkButton = document.getElementById('talkButton'); // Assuming talkButton is defined

    // Function to handle sending message
    async function handleSendMessage(message) {
        if (message) {
            displayUserMessage(message);

            // Check and hide the loading screen if visible
            const loadingScreen = document.getElementById('loadingScreen');
            const mainContainer = document.getElementById('mainContainer');
            if (loadingScreen.style.display === 'flex') {
                loadingScreen.style.display = 'none';
                mainContainer.style.display = 'block';
            }

            // Insert skeleton loader after the user message
            const skeletonLoader = document.createElement('div');
            skeletonLoader.id = 'skeletonLoader';
            skeletonLoader.className = 'skeleton-loader';
            skeletonLoader.innerHTML = `
                <div class="skeleton-avatar"></div>
                <div class="skeleton-text"></div>
            `;
            mainContainer.appendChild(skeletonLoader);

            // Scroll to the bottom to show the skeleton loader
            mainContainer.scrollTop = mainContainer.scrollHeight;

            const data = await sendMessage(message);

            if (data.finish_reason === 'tool_calls') {
                console.log(data);
                await handleToolCalls(data, skeletonLoader);
            } else if (data.finish_reason === 'stop') {
                skeletonLoader.remove();
                displayBotMessage(data.response);
            }
        }
    }

    // Event listener for talk button click to toggle recording
    talkButton.addEventListener('click', async () => {
        talkButton.classList.toggle('fire-animation');
        document.getElementById('actionMessage').classList.toggle('hide');
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            const transcription = await stopRecording();
            if (transcription) {
                await handleSendMessage(transcription);
            }
        } else {
            audioChunks = [];
            await startRecording();
        }
    });

    // Event listener for send button click
    sendButton.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message) {
            messageInput.value = '';
            handleSendMessage(message);
        }
    });

    // Event listener for Enter key press
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevents new line in textarea
            const message = messageInput.value.trim();
            if (message) {
                messageInput.value = '';
                handleSendMessage(message);
            }
        }
    });
});

async function playAudio(event) {
    try {
        console.log('playAudio function called');

        // Step 1: Get the message from the message-bubble
        const button = event.currentTarget;
        console.log('Button:', button);

        const messageBubble = button.closest('.message-bubble');
        console.log('Message Bubble:', messageBubble);

        const message = messageBubble.outerHTML;
        console.log('message', message);

        const splitMessage = message.split('Copy')[0];
        console.log('splitMessage', splitMessage);

        // Show spinner before audio playback
        button.innerHTML = `
            <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M15.95 15.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M15.95 8.05l2.83-2.83" stroke="currentColor" stroke-width="2"></path>
            </svg>
            <span>Loading...</span>
        `;

        // Step 2: Send message to /ai/clean-html
        const cleanHtmlResponse = await fetch('/ai/clean-html', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ htmlText: splitMessage })
        });

        const cleanHtmlData = await cleanHtmlResponse.json();
        console.log('Clean HTML Data:', cleanHtmlData);

        const plainText = cleanHtmlData.plainText;
        console.log('Plain Text:', plainText);

        // Step 3: Send plainText to /ai/text-to-speech
        const ttsResponse = await fetch('/ai/text-to-speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: plainText })
        });
        console.log('TTS Response:', ttsResponse);

        const audioBlob = await ttsResponse.blob();
        console.log('Audio Blob:', audioBlob);

        const audioUrl = URL.createObjectURL(audioBlob);
        console.log('Audio URL:', audioUrl);

        const audio = new Audio(audioUrl);
        console.log('Audio Object:', audio);

        // Step 5: Play audio file
        audio.play();
        console.log('Audio playing');

        // Change to pause button with pause SVG
        button.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10 9v6m4-6v6" />
            </svg>
            <span>Pause</span>
        `;

        button.onclick = () => {
            if (audio.paused) {
                audio.play();
                console.log('Audio resumed');
                button.innerHTML = `
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M10 9v6m4-6v6" />
                    </svg>
                    <span>Pause</span>
                `;
            } else {
                audio.pause();
                console.log('Audio paused');
                button.innerHTML = `
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M5 3l14 9-14 9V3z" />
                    </svg>
                    <span>Play</span>
                `;
            }
        };

        // Step 7: Once playback is done, return the play button to normal
        audio.onended = () => {
            console.log('Audio ended');
            button.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M5 3l14 9-14 9V3z" />
                </svg>
                <span>Play</span>
            `;
        };

    } catch (error) {
        console.error('Error in playAudio:', error);
    }
}
