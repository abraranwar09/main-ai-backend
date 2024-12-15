const express = require('express');
const fileUpload = require('express-fileupload');
const router = express.Router();
const {OpenAI, toFile} = require('openai');
const mongoose = require('mongoose');
const { generateChatName } = require('../utils/nameGenerator');
const ChatHistory = require('../models/chatHistoryModel');
const puppeteer = require('puppeteer');


// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});   

// Middleware to parse JSON bodies
router.use(express.json());

// Middleware to handle file uploads
router.use(fileUpload());

// Chat endpoint
router.post('/chat', async (req, res) => {
    try {
        const { message, session_id, tools, user_id, custom_prompt, custom_temp } = req.body;

        if (!message || !user_id) {
            return res.status(400).json({
                error: 'Message and user_id are required'
            });
        }

        // Find or create chat history
        let chatHistory = await ChatHistory.findOne({ session_id, user_id });
        if (!chatHistory) {
            const chatName = await generateChatName(message);
            chatHistory = new ChatHistory({ 
                user_id,
                session_id,
                name: chatName,
                messages: [{
                    "role": "system", 
                    "content": custom_prompt || `
                        Your name is OhanaPal. You are a helpful assistant. You can use your tools to help the user with their queries.
                        Format your responses as structured HTML with the appropriate tags and styling like lists, paragraphs, etc. 
                        Only respond in HTML no markdown. You have the ability to run parallel tool calls.
                    `
                }]
            });
        }

        // Add user message to history
        chatHistory.messages.push({
            role: 'user',
            content: message
        });

        // Clean messages before sending to OpenAI
        const cleanedMessages = chatHistory.messages.map(msg => {
            const cleanMsg = {
                role: msg.role,
                content: msg.content
            };
            
            // Only include additional fields if they have values
            if (msg.name) cleanMsg.name = msg.name;
            if (msg.function_call) cleanMsg.function_call = msg.function_call;
            if (msg.tool_calls && msg.tool_calls.length > 0) {
                cleanMsg.tool_calls = msg.tool_calls;
            }
            if (msg.tool_call_id) cleanMsg.tool_call_id = msg.tool_call_id;
            
            return cleanMsg;
        });

        // Prepare messages for OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: cleanedMessages,
            temperature: custom_temp ? parseFloat(custom_temp) : 0.7,
            ...(tools && tools.length > 0 ? {
                tools: tools,
                parallel_tool_calls: true
            } : {})
        });

        // Get the assistant's response and completion details
        const assistantResponse = completion.choices[0].message;
        const finishReason = completion.choices[0].finish_reason;

        // Add assistant response to history
        chatHistory.messages.push(assistantResponse);

        // Update timestamp
        chatHistory.updated_at = new Date();

        // Save to database
        await chatHistory.save();

        // Prepare response based on finish_reason
        const responseData = {
            session_id,
            finish_reason: finishReason
        };

        if (finishReason === 'tool_calls') {
            responseData.tool_calls = assistantResponse.tool_calls;
            responseData.response = null; // No content when it's a tool call
        } else {
            responseData.response = assistantResponse.content;
            responseData.tool_calls = null;
        }

        // Send response
        res.json(responseData);

    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Tool call response endpoint
router.post('/tool-response', async (req, res) => {
    try {
        const { session_id, tool_responses } = req.body;
        // console.log('Received tool responses:', JSON.stringify(tool_responses, null, 2));
        
        // Find chat history
        let chatHistory = await ChatHistory.findOne({ session_id });
        if (!chatHistory) {
            return res.status(404).json({ error: 'Chat history not found' });
        }

        // Find the last assistant message with tool calls
        const lastAssistantMessage = [...chatHistory.messages]
            .reverse()
            .find(msg => msg.role === 'assistant' && msg.tool_calls);

        if (!lastAssistantMessage) {
            return res.status(400).json({ error: 'No tool call message found' });
        }

        console.log('Last assistant message:', JSON.stringify(lastAssistantMessage, null, 2));

        // Add tool responses in the correct format
        tool_responses.forEach(response => {
            chatHistory.messages.push({
                role: 'tool',
                content: typeof response.function_response === 'string' 
                    ? response.function_response 
                    : JSON.stringify(response.function_response),
                tool_call_id: response.tool_call_id,
                name: response.function_name // Add function name to match OpenAI's format
            });
        });

        // console.log('Messages before OpenAI call:', JSON.stringify(chatHistory.messages, null, 2));

        // Clean messages before sending to OpenAI
        const cleanedMessages = chatHistory.messages.map(msg => {
            const cleanMsg = {
                role: msg.role,
                content: msg.content
            };
            
            // Only include additional fields if they have values
            if (msg.name) cleanMsg.name = msg.name;
            if (msg.function_call) cleanMsg.function_call = msg.function_call;
            if (msg.tool_calls && msg.tool_calls.length > 0) {
                cleanMsg.tool_calls = msg.tool_calls;
            }
            if (msg.tool_call_id) cleanMsg.tool_call_id = msg.tool_call_id;
            
            return cleanMsg; // {{ }}
        });

        // console.log('Cleaned messages:', JSON.stringify(cleanedMessages, null, 2));

        // Get OpenAI's response to all tool results
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: cleanedMessages,
            temperature: 0.7
        });

        // Get the assistant's response and completion details
        const assistantResponse = completion.choices[0].message;
        const finishReason = completion.choices[0].finish_reason;

        // Add assistant response to history
        chatHistory.messages.push(assistantResponse);

        // Update timestamp
        chatHistory.updated_at = new Date();

        // Save to database
        await chatHistory.save();

        // Prepare response based on finish_reason
        const responseData = {
            session_id,
            finish_reason: finishReason
        };

        if (finishReason === 'tool_calls') {
            responseData.tool_calls = assistantResponse.tool_calls;
            responseData.response = null;
        } else {
            responseData.response = assistantResponse.content;
            responseData.tool_calls = null;
        }

        // Send response
        res.json(responseData);

    } catch (error) {
        console.error('Tool Response API Error:', error);
        console.error('Error details:', error.response?.data || error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get chat history endpoint
router.get('/history/:session_id', async (req, res) => {
    try {
        const { session_id } = req.params;
        const chatHistory = await ChatHistory.findOne({ session_id });
        
        if (!chatHistory) {
            return res.status(404).json({ error: 'Chat history not found' });
        }

        res.json(chatHistory);
    } catch (error) {
        console.error('History API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/history/list/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        const { last_n_items } = req.query;  // Get the query parameter

        // Create base query and sort
        let query = ChatHistory.find({ user_id })
            .sort({ updated_at: -1 });

        // Apply limit if last_n_items is provided and is a valid number
        if (last_n_items && !isNaN(last_n_items)) {
            query = query.limit(parseInt(last_n_items));
        }

        const chatHistories = await query;

        if (!chatHistories || chatHistories.length === 0) {
            return res.status(404).json({ error: 'No chat histories found for this user' });
        }

        res.json(chatHistories);
    } catch (error) {
        console.error('List History API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Suggestions endpoint
router.get('/suggest', async (req, res) => {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { 
                    role: "system", 
                    content: "You return three suggestions as JSON data. You will suggest a topic to research, a topic to stay updated on (latest news, current events), and a topic to learn." 
                },
                {
                    role: "user",
                    content: "Generate three suggestions now!",
                }
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "suggestions_schema",
                    schema: {
                        type: "object",
                        properties: {
                            research_topic: {
                                description: "A suggested topic for the user to research. Example: Overview of the solar panel industry.",
                                type: "string"
                            },
                            update_topic: {
                                description: "A suggested topic for the user to stay updated on. Example: Latest news on the stock market.",
                                type: "string"
                            },
                            learn_topic: {  
                                description: "A suggested topic for the user to learn. Example: How to code in Python.",
                                type: "string"
                            }
                        },
                        additionalProperties: false
                    }
                }
            }
        });

        res.json(JSON.parse(completion.choices[0].message.content));

    } catch (error) {
        console.error('Suggestions API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Web scraping endpoint
router.post('/scrape', async (req, res) => {
    let browser;
    try {
        console.log('[Scrape] Starting scrape request:', { url: req.body.url });
        const { url } = req.body;
        const CHARACTER_LIMIT = 6000;

        if (!url) {
            console.log('[Scrape] Error: No URL provided');
            return res.status(400).json({ error: 'URL is required' });
        }

        // Launch browser
        console.log('[Scrape] Launching browser...');
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            executablePath: '/usr/bin/chromium-browser'
        });
        console.log('[Scrape] Browser launched successfully');
        
        const page = await browser.newPage();
        console.log('[Scrape] New page created');
        
        // Set timeout and navigate to page
        console.log('[Scrape] Navigating to URL:', url);
        await page.setDefaultNavigationTimeout(10000);
        await page.goto(url, { waitUntil: 'networkidle0' });
        console.log('[Scrape] Successfully loaded page');

        // Extract text from specified tags
        console.log('[Scrape] Starting content extraction');
        const content = await page.evaluate(() => {
            const tagsToScrape = ['p', 'h1', 'h2', 'h3'];
            const elements = document.querySelectorAll(tagsToScrape.join(','));
            const result = Array.from(elements)
                .map(element => element.textContent.trim())
                .filter(text => text)
                .join('\n');
            return result;
        });
        console.log('[Scrape] Content extracted, length:', content.length);

        // Truncate content if necessary
        const truncatedContent = content.slice(0, CHARACTER_LIMIT);
        console.log('[Scrape] Content truncated to length:', truncatedContent.length);

        await browser.close();
        console.log('[Scrape] Browser closed successfully');
        
        res.json({ content: truncatedContent || "No matching tags found" });
        console.log('[Scrape] Response sent successfully');

    } catch (error) {
        console.error('[Scrape] Error details:', {
            message: error.message,
            stack: error.stack,
            url: req.body.url,
            browserState: browser ? 'initialized' : 'not initialized'
        });
        
        if (browser) {
            try {
                await browser.close();
                console.log('[Scrape] Browser closed after error');
            } catch (closeError) {
                console.error('[Scrape] Error closing browser:', closeError.message);
            }
        }
        
        res.status(500).json({ 
            error: 'Scraping failed', 
            details: error.message 
        });
    }
});

// Speech-to-text endpoint
router.post('/speech-to-text', async (req, res) => {
    try {
        // Extract Base64 encoded data from the request
        const { audioData } = req.body;

        if (!audioData) {
            return res.status(400).json({ error: 'Base64 audio data is required' });
        }

        // Decode Base64 to binary
        const audioBuffer = Buffer.from(audioData, "base64");

        // Use OpenAI API to transcribe the audio
        const transcription = await openai.audio.transcriptions.create({
            file: await toFile(audioBuffer, "audio.mp3", {
                contentType: "audio/mpeg",
            }),
            model: "whisper-1",
        });

        // Send the transcription text as response
        res.json({ transcription: transcription.text });

    } catch (error) {
        console.error("Error during transcription:", error);
        res.status(500).json({ error: 'Error during transcription' });
    }
});

// ... existing code ...

// Text-to-Speech endpoint
router.post('/text-to-speech', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Create speech from text using OpenAI
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: text,
        });

        // Convert the response to a buffer
        const buffer = Buffer.from(await mp3.arrayBuffer());

        // Set headers for audio file response
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Disposition': 'attachment; filename="speech.mp3"',
        });

        // Send the audio file
        res.send(buffer);

    } catch (error) {
        console.error('Text-to-Speech API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ... existing code ...

// Clean HTML endpoint
router.post('/clean-html', async (req, res) => {
    try {
        const { htmlText } = req.body;

        if (!htmlText) {
            return res.status(400).json({ error: 'htmlText is required' });
        }

        // Ensure htmlText is a string
        const htmlTextString = JSON.stringify(htmlText);

        // Use OpenAI to clean HTML and return plain text
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { 
                    role: "system", 
                    content: "You are a helpful assistant that removes all HTML tags from the input and returns plain text. Do not output any other formatting like markdown. Only output plain text"
                },
                {
                    role: "user",
                    content: htmlTextString // Ensure this is a string
                }
            ],
            temperature: 0.0 // Use a low temperature for deterministic output
        });

        const plainText = completion.choices[0].message.content;
        console.log('plantext', plainText);
        

        // Send the plain text as response
        res.json({ plainText });

    } catch (error) {
        console.error('Clean HTML API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ... existing code ...


module.exports = router;


