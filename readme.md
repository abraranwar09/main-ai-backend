# RebelForce / Ohana Unified AI Backend with Parallel Tool Calling

A powerful and flexible AI backend system that integrates with OpenAI's GPT models and provides parallel tool calling capabilities. This system serves as a foundation for building AI-powered applications with various integrated services and tools.

## 🌟 Features

- **Parallel Tool Calling**: Execute multiple AI tools simultaneously for improved performance
- **Google Integration**: Full suite of Google services (Gmail, Calendar, Search)
- **Web Scraping**: Built-in web scraping capabilities using Puppeteer
- **Perplexity AI Integration**: Alternative AI model integration
- **Session Management**: Persistent chat sessions with MongoDB storage
- **OAuth Authentication**: Secure Google OAuth2.0 authentication
- **Custom Prompting**: Support for custom system prompts and temperature settings
- **Automatic Chat Naming**: AI-powered chat session naming
- **Knowledge Base Integration**: Custom knowledge base querying capabilities

## 🛠️ Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Passport.js with Google OAuth2.0
- **AI Services**: 
  - OpenAI GPT-4
  - Perplexity AI
- **Additional Tools**:
  - Puppeteer for web scraping
  - Google APIs (Gmail, Calendar, Search)
  - Custom knowledge base integration

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB instance
- Google Cloud Platform account with OAuth2.0 credentials
- OpenAI API key
- Perplexity API key
- Google Custom Search API credentials

## 🔧 Environment Variables

Create a `.env` file with the following variables:

env
```
MONGODB_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_SEARCH_API_KEY=your_google_search_api_key
GOOGLE_SEARCH_ENGINE_ID=your_google_search_engine_id
PORT=3001
```

## 🚀 Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```
3. Set up environment variables
4. Start the server:

```bash
npm start
```

For development:

```bash
npm run dev
```

## 📚 API Endpoints

### Authentication
- `GET /auth/google`: Initiate Google OAuth2.0 login
- `GET /auth/google/callback`: OAuth2.0 callback handler

### AI Interactions
- `POST /ai/chat`: Main chat endpoint with tool calling support
- `POST /ai/tool-response`: Handle tool execution responses
- `GET /ai/history/:session_id`: Retrieve chat history
- `GET /ai/history/list/:user_id`: List user's chat histories
- `GET /ai/suggest`: Get AI-powered suggestions
- `POST /ai/scrape`: Web scraping endpoint

### Google Services
- `POST /google/calendar/events`: Fetch calendar events
- `POST /google/calendar/save-event`: Create calendar event
- `POST /google/gmail/messages`: List Gmail messages
- `POST /google/gmail/message/:id`: Get specific email
- `POST /google/gmail/send`: Send email
- `POST /google/search`: Perform Google search

### Perplexity AI
- `POST /perplexity/chat`: Alternative AI chat endpoint

## 🛠️ Available Tools

1. **Calendar Management**
   - View events
   - Create events
   - Query calendar data

2. **Email Operations**
   - List emails
   - Read email content
   - Send emails

3. **Search and Research**
   - Google Custom Search
   - Web scraping
   - Perplexity AI queries
   - Knowledge base queries

4. **Custom Tools**
   - Extensible tool system
   - Parallel execution support
   - Custom tool response handling

## 💡 Usage Example

```javascript
// Example chat request with tool calling
const response = await fetch('/ai/chat', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        message: "Schedule a meeting for tomorrow and send an email about it",
        session_id: "user_session_id",
        user_id: "user_id",
        tools: toolsArray
    })
});
```

## 🔒 Security

- OAuth2.0 authentication
- Session management
- Secure token handling
- Rate limiting (recommended to implement)
- Input validation
- Secure environment variable management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for GPT models
- Perplexity AI for alternative AI processing
- Google Cloud Platform for API services
- MongoDB for database services

## ⚠️ Important Notes

- Ensure proper error handling in production
- Implement rate limiting for API endpoints
- Regular token refresh for Google OAuth
- Monitor API usage and costs
- Regular security audits recommended
```

This README provides a comprehensive overview of your project, its features, setup instructions, and usage guidelines. The structure follows best practices for documentation and includes all necessary information for developers to understand and use the system.

Would you like me to expand on any particular section or add more specific technical details?


