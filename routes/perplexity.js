const express = require('express');
// const jwt = require('jsonwebtoken');
// const User = require('../models/userModel');
const router = express.Router();
require('dotenv').config();

// Add OpenAI package
const OpenAI = require('openai');

// Create chat completion endpoint
router.post('/chat', async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        const client = new OpenAI({
            apiKey: process.env.PERPLEXITY_API_KEY,
            baseURL: 'https://api.perplexity.ai'
        });

        const response = await client.chat.completions.create({
            model: "llama-3.1-sonar-large-128k-online",
            messages: [
                {
                    "role": "user", 
                    "content": query
                }
            ]
        });

        res.json({
            "status": "successfully called perplexity",
            "response": response.choices[0].message.content
        });
    } catch (error) {
        console.error('Perplexity API Error:', error);
        res.status(500).json({ error: 'Failed to get response from Perplexity' });
    }
});

module.exports = router;