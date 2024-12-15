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

//computer control function

async function executeComputerCommand(command) {
    // Create a modal container
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';

    // Create a popup content
    const popupContent = document.createElement('div');
    popupContent.style.width = '90%';
    popupContent.style.height = '90%';
    popupContent.style.backgroundColor = 'white';
    popupContent.style.borderRadius = '10px';
    popupContent.style.overflow = 'hidden';
    popupContent.style.position = 'relative';

    // Create an iframe
    const iframe = document.createElement('iframe');
    iframe.src = 'http://localhost:6080/vnc.html';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';

    // Append iframe to popup content
    popupContent.appendChild(iframe);

    // Append popup content to modal
    modal.appendChild(popupContent);

    // Append modal to body
    document.body.appendChild(modal);

    // Close modal when clicking outside of the popup content
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });

    try {
        const response = await fetch("http://localhost:3000/run-command", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ command })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        console.log(response);
        const data = await response.text();

        const structuredData = {
            "status": "success",
            "message": data
        }

        // Close the modal before returning data
        document.body.removeChild(modal);

        return structuredData;

    } catch (error) {
        console.error('Error executing computer command:', error);

        // Close the modal in case of error
        document.body.removeChild(modal);

        return {
            "status": "error",
            "message": `There was an error executing the computer command. Please try again later.`
        };
    }
}






