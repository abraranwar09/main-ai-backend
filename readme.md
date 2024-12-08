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


## 🖥️ Frontend Implementation

### Tool Handling System

#### Tool State Management
```javascript
function getActiveToolTypes() {
    const activeToggles = document.querySelectorAll('.toggle.active, .tool-toggle.active');
    return Array.from(activeToggles).map(toggle => toggle.dataset.tool);
}

// Tool states are tracked in the UI and passed to backend
const toolStates = {};
document.querySelectorAll('.tool-toggle').forEach(toggle => {
    const toolType = toggle.getAttribute('data-tool');
    toolStates[toolType] = toggle.classList.contains('active');
});
```

#### Message Handling
```javascript
async function sendMessage() {
    // ... existing code ...
    const requestBody = {
        session_id: session_id,
        user_id: userId,
        message: message,
        tools: activeTools,
        tool_states: toolStates,
        custom_prompt: localStorage.getItem('custom_prompt'),
        custom_temp: localStorage.getItem('custom_temp')
    };
    
    // Handle different response types
    if (data.finish_reason === 'stop') {
        displayMessage(data.response, 'ai-message');
    } else if (data.finish_reason === 'tool_calls') {
        await handleToolCalls(data, skeletonLoader);
    }
}
```

### Session Management

#### Initial Session Setup
```javascript
window.onload = async function() {
    const session_id = generateUUID();
    localStorage.setItem('session_id', session_id);
    
    // Initialize timezone information
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const today = new Date().toLocaleString('en-US', { timeZone: userTimeZone });
    
    // Set up context reprompt
    const reprompt = `Hidden Context: Timezone ${userTimeZone}, Current time ${today}`;
}
```

### UI Components

#### Chat Interface
```html
<section class="chat-section">
    <main class="chat-content">
        <!-- Message display area -->
    </main>
    <footer class="chat-input">
        <textarea class="message-input"></textarea>
        <button class="send-button">Send</button>
    </footer>
</section>
```

#### Tool Toggle Interface
```html
<div class="tools-list">
    <div class="tool-item">
        <div class="tool-info">
            <img src="tool-icon.png" class="tool-icon">
            <div class="tool-name">Tool Name</div>
        </div>
        <div class="tool-toggle" data-tool="tool-id"></div>
    </div>
</div>
```

## 🔧 Technical Implementation

### Tool System Architecture

#### Tool Handler
The tool handler manages parallel execution of AI tool calls:
- Processes multiple tool calls simultaneously using `Promise.all`
- Handles tool call responses and feeds them back to the AI
- Manages skeleton loading states during tool execution

```javascript
const toolResults = await Promise.all(toolCallPromises);
const response = await fetch('/ai/tool-response', {
    method: 'POST',
    body: JSON.stringify({
        session_id: sessionId,
        tool_responses: toolResults
    })
});
```

#### Tool Executor
Implements individual tool functionalities:
- Knowledge Base queries via external API
- Web scraping using Puppeteer
- Google service integrations
- Perplexity AI searches

### Database Structure

#### Chat Sessions
MongoDB collections maintain chat history and session data:

```javascript
const messageSchema = {
    role: String,
    content: String,
    name: String,
    function_call: Mixed,
    tool_calls: [Mixed],
    tool_call_id: String
}
```

#### User Model
Stores user authentication and token data:

```javascript
const userSchema = {
    email: String,
    googleId: String,
    accessToken: String,
    refreshToken: String,
    // ... other fields
}
```

### Additional Endpoints

#### History Management
- `GET /ai/history/:session_id`
  - Retrieves complete chat history for a session
  - Includes tool calls and responses
  - Supports pagination

- `GET /ai/history/list/:user_id`
  - Lists all chat sessions for a user
  - Returns session metadata and last message

#### AI Utilities
- `POST /ai/scrape`
  - Web scraping endpoint using Puppeteer
  - Handles JavaScript-rendered content
  - Returns cleaned and formatted text

- `GET /ai/suggest`
  - AI-powered content suggestions
  - Uses chat context for relevant recommendations
  - Supports custom suggestion parameters

### Integration Examples

#### Chat Implementation

```javascript
async function sendMessage() {
    const requestBody = {
        session_id: session_id,
        user_id: userId,
        message: message,
        tools: window.toolsModule.tools,
        custom_prompt: localStorage.getItem('custom_prompt'),
        custom_temp: localStorage.getItem('custom_temp')
    };
    
    const response = await fetch('/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });
}
```

#### Tool Response Handling

```javascript
async function handleToolCalls(data, skeletonLoader) {
    const toolResults = await Promise.all(toolCallPromises);
    const response = await fetch('/ai/tool-response', {
        method: 'POST',
        body: JSON.stringify({
            session_id: sessionId,
            tool_responses: toolResults
        })
    });
    
    if (response.ok) {
        displayMessage(responseData.response, 'ai-message');
    }
}
```

### Authentication Flow

1. **Google OAuth2.0**
   - Initial authentication via `/auth/google`
   - Callback handling and token storage
   - Automatic token refresh mechanism

2. **Session Management**
   - Express sessions for state management
   - MongoDB session storage
   - Secure token handling

### Error Handling

The system implements comprehensive error handling:
- Network request failures
- Tool execution errors
- API rate limiting
- Authentication failures
- Database connection issues

### Performance Considerations

1. **Parallel Processing**
   - Tool calls execute simultaneously
   - Response aggregation and processing
   - Efficient memory management

2. **Database Optimization**
   - Indexed queries for chat history
   - Efficient session storage
   - Periodic cleanup of old sessions

3. **API Management**
   - Rate limiting implementation
   - Request queuing
   - Response caching where appropriate


## 🔒 Security

- OAuth2.0 authentication
- Session management
- Secure token handling
- Rate limiting (recommended to implement)
- Input validation
- Secure environment variable management


## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Important Notes

- Ensure proper error handling in production
- Implement rate limiting for API endpoints
- Regular token refresh for Google OAuth
- Monitor API usage and costs
- Regular security audits recommended



