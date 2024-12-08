//test tool to open google search in a new tab
async function openGoogle(query) {
    console.log(query);
    // Open new tab with Google search
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
    console.log(`Google search opened with query: ${query}`);

    return {
        "status": "success",
        "message": `Google search completed for ${query}`
    };
}

// Function to get calendar events
async function getCalendarEvents(timePeriod, query) {
    const authToken = localStorage.getItem('authToken');
    const calendarId = localStorage.getItem('email');
    const userId = localStorage.getItem('userId');

    const response = await fetch("/google/calendar/events", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            accessToken: authToken,
            calendarId: calendarId,
            timePeriod: timePeriod,
            userId: userId
        })
    });

    if (!response.ok) {
        return {
            "status": "error",
            "message": `There was an error getting your calendar events. Please try again later or check your config.`
        };
    }

    const data = await response.json();
    return data;
}

//function to save calendar events
async function saveEvent(summary, location, description, start, end) {
    const accessToken = localStorage.getItem('authToken');
    const calendarId = localStorage.getItem('email');
    const userId = localStorage.getItem('userId');

    const response = await fetch("/google/calendar/save-event", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            accessToken: accessToken,
            calendarId: calendarId,
            summary: summary,
            location: location,
            description: description,
            start: start,
            end: end,
            userId: userId
        })
    });

    if (!response.ok) {
        return {
            "status": "error",
            "message": `There was an error saving your calendar event. Please try again later or check your config.`
        };
    }

    const data = await response.json();
    return data;
}

// Function to list Gmail messages
async function listGmailMessages(maxResults, query) {
    const accessToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    try {
        const response = await fetch("/google/gmail/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                accessToken,
                maxResults,
                query,
                userId
            })
        });

        if (!response.ok) {
            return {
                "status": "error",
                "message": `There was an error listing your emails. Please try again later or check your config.`
            };
        }

        const data = await response.json();
        return {
            "emails": data
        };
    } catch (error) {
        console.error('Error fetching emails:', error);
        return {
            "status": "error",
            "message": `There was an error listing your emails. Please try again later or check your config.`
        };
    }
}

// Function to get specific Gmail message details
async function getGmailMessage(messageId) {
    const accessToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    try {
        const response = await fetch(`/google/gmail/message/${messageId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                accessToken,
                userId
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error fetching email details:', error);
        return {
            "status": "error",
            "message": `There was an error getting your email details. Please try again later or check your config.`
        };
    }
}

// Function to send Gmail message
async function sendGmailMessage(to, subject, body, cc, bcc, isHtml) {
    const accessToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    try {
        const response = await fetch("/google/gmail/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                accessToken: accessToken,
                to: to,
                subject: subject,
                body: body,
                isHtml: isHtml,
                userId: userId
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error sending email:', error);
        return {
            "status": "error",
            "message": `There was an error sending your email. Please try again later or check your config.`
        };
    }
}

// Function to perform Google Custom Search
async function performGoogleSearch(query) {
    const userId = localStorage.getItem('userId');

    try {
        const response = await fetch("/google/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query,
                userId
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error performing Google search:', error);
        return {
            "status": "error",
            "message": `There was an error performing the Google search. Please try again later.`
        };
    }
}

async function usePerplexity(query) {
    const userId = localStorage.getItem('userId');

    try {
        const response = await fetch("/perplexity/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                query,
                userId 
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error using Perplexity:', error);
        return {
            "status": "error",
            "message": `There was an error performing the Perplexity search. Please try again later.`
        };
    }
}

async function checkKnowledgeBase(query) {
    const userId = localStorage.getItem('userId');

    try {
        const response = await fetch("https://coreapi.inovasolutions.ai/v1/workflows/run", {
            method: "POST",
            headers: {
                "Authorization": "Bearer app-X8irMeOKWmXoKymsp1sJqXku",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: {
                    query: query
                },
                response_mode: "blocking",
                user: userId
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error checking knowledge base:', error);
        return {
            "status": "error",
            "message": `There was an error checking the knowledge base. Please try again later.`
        };
    }
}

async function scrapeWeb(url) {
    const userId = localStorage.getItem('userId');

    try {
        const response = await fetch("/ai/scrape", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                url,
                userId 
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error scraping web:', error);
        return {
            "status": "error",
            "message": `There was an error scraping the webpage. Please try again later.`
        };
    }
}









