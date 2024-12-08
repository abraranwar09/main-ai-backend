const OpenAI = require('openai');
require('dotenv').config();

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function generateChatName(message) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4", 
            messages: [
                {
                    role: "system", 
                    content: "You are a helpful assistant that generates names for chat conversations based on the users first message. Keep names concise and relevant."
                },
                {
                    role: "user", 
                    content: `Generate a name for this new chat conversation: ${message}`
                }
            ],
            temperature: 0.7,
            max_tokens: 60
        });

        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating chat name:', error);
        return message.substring(0, 20); // Fallback to original behavior
    }
}

module.exports = { generateChatName };
