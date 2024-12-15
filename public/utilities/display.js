function displayUserMessage(message) {
    const mainContainer = document.getElementById('mainContainer');
    const userMessageTemplate = `
        <div class="user-message">
            <div class="flex justify-end">
                <div class="bg-white/10 rounded-2xl px-6 py-3 text-lg">
                    ${message}
                </div>
            </div>
        </div>
    `;
    mainContainer.insertAdjacentHTML('beforeend', userMessageTemplate);
    mainContainer.scrollTop = mainContainer.scrollHeight;
}

function displayBotMessage(message) {
    const mainContainer = document.getElementById('mainContainer');
    const botMessageTemplate = `
        <div class="bot-message">
            <div class="flex gap-4">
                <div class="bot-avatar w-12 h-12 rounded-full flex items-center justify-center relative flex-shrink-0">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div class="message-bubble rounded-2xl p-4 max-w-[80%]">
                    <p class="text-lg">${message}</p>
                    <div class="flex gap-3 mt-4">
                        <button class="bg-white/10 px-4 py-2 rounded-full flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>Copy</span>
                        </button>
                        <button onClick="playAudio(event)" class="bg-white/10 px-4 py-2 rounded-full flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 3l14 9-14 9V3z" />
                            </svg>
                            <span>Play</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    mainContainer.insertAdjacentHTML('beforeend', botMessageTemplate);
    mainContainer.scrollTop = mainContainer.scrollHeight;
}


