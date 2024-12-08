const express = require('express');
const { google } = require('googleapis');
const router = express.Router();
const axios = require('axios');
const checkAndRefreshToken = require('../middlewares/checkAndRefreshToken');


// Apply to all routes that need Google API access
router.use(checkAndRefreshToken);



router.get('/calendar/list', async (req, res) => {
    try {
        const accessToken = req.body.accessToken;
        const email = req.body.email;
        const userId = req.body.userId;
        console.log(userId);
        

        // Initialize the Google Calendar API client
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const calendar = google.calendar({ version: 'v3', auth });

        // Use the Google Calendar API to list calendars
        calendar.calendarList.list({}, (err, response) => {
            if (err) {
                console.error('The API returned an error: ' + err);
                return res.status(500).send('Error retrieving calendar events: ' + err.message);
            }
            const calendars = response.data.items;
            calendars.forEach(calendar => {
               if(calendar.id === email){
                res.json(calendar);
               }
            });

            // res.json(calendars);
        });

    } catch (error) {
        res.status(500).send('Error retrieving calendar events: ' + error.message);
    }
});

router.post('/calendar/events', async (req, res) => {
    try {
        const accessToken = req.body.accessToken;
        console.log('Access Token:', accessToken);
        const calendarId = req.body.calendarId;
        const timePeriod = req.body.timePeriod;

        // Initialize the Google Calendar API client
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const calendar = google.calendar({ version: 'v3', auth });

        // Calculate the time range based on the timePeriod
        const now = new Date();
        let timeMin, timeMax;

        switch (timePeriod) {
            case 'last 30 days':
                timeMin = new Date(now);
                timeMin.setDate(now.getDate() - 30);
                timeMin.setHours(0, 0, 0, 0); // Start of the day 30 days ago
                timeMax = new Date(now.setHours(23, 59, 59, 999)); // End of today
                break;
            case 'last week':
                timeMin = new Date(now);
                timeMin.setDate(now.getDate() - 7);
                timeMax = new Date(now.setHours(23, 59, 59, 999)); // End of today
                break;
            case 'today':
                timeMin = new Date(now.setHours(0, 0, 0, 0));
                timeMax = new Date(now.setHours(23, 59, 59, 999));
                break;
            case 'next week':
                timeMin = new Date(now.setHours(0, 0, 0, 0)); // Start of today
                timeMax = new Date(now);
                timeMax.setDate(now.getDate() + 7);
                timeMax.setHours(23, 59, 59, 999); // End of the last day of the next week
                break;
            case 'next 30 days':
                timeMin = new Date(now.setHours(0, 0, 0, 0)); // Start of today
                timeMax = new Date(now);
                timeMax.setDate(now.getDate() + 30);
                timeMax.setHours(23, 59, 59, 999); // End of the last day of the next 30 days
                break;
            default:
                return res.status(400).send('Invalid time period specified.');
        }

        // Use the Google Calendar API to list events
        calendar.events.list({
            calendarId: calendarId,
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        }, (err, response) => {
            if (err) {
                console.error('The API returned an error: ' + err);
                return res.status(500).send('Error retrieving calendar events: ' + err.message);
            }
            const events = response.data.items;
            if (events.length) {
                res.json(events);
            } else {
                res.status(404).send('No events found in the specified time range.');
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).send('Error retrieving calendar events: ' + error.message);
    }
});

router.post('/calendar/save-event', async (req, res) => {
    try {
        const { accessToken, calendarId, summary, location, description, start, end } = req.body;

        // Initialize the Google Calendar API client
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const calendar = google.calendar({ version: 'v3', auth });

        // Define the event object
        const event = {
            summary: summary,
            location: location,
            description: description,
            start: {
                dateTime: start, // e.g., '2023-10-01T09:00:00-07:00'
                timeZone: 'America/Los_Angeles', // Adjust the time zone as needed
            },
            end: {
                dateTime: end, // e.g., '2023-10-01T17:00:00-07:00'
                timeZone: 'America/Los_Angeles', // Adjust the time zone as needed
            },
        };

        // Use the Google Calendar API to insert the event
        calendar.events.insert({
            calendarId: calendarId,
            resource: event,
        }, (err, event) => {
            if (err) {
                console.error('The API returned an error: ' + err);
                return res.status(500).send('Error creating calendar event: ' + err.message);
            }
            res.status(201).json(event.data);
        });

    } catch (error) {
        res.status(500).send('Error creating calendar event: ' + error.message);
    }
});

router.post('/gmail/messages', async (req, res) => {
    try {
        const accessToken = req.body.accessToken;
        const maxResults = req.body.maxResults || 10; // Default to 10 messages
        const query = req.body.query || ''; // Optional search query

        // Initialize the Gmail API client
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const gmail = google.gmail({ version: 'v1', auth });

        // First, list message IDs
        const messageList = await gmail.users.messages.list({
            userId: 'me',
            maxResults: maxResults,
            q: query
        });

        if (!messageList.data.messages || messageList.data.messages.length === 0) {
            return res.status(404).json({ message: 'No emails found' });
        }

        // Get detailed information for each message
        const messages = await Promise.all(
            messageList.data.messages.map(async (message) => {
                const response = await gmail.users.messages.get({
                    userId: 'me',
                    id: message.id,
                    format: 'full'
                });

                const headers = response.data.payload.headers;
                return {
                    id: response.data.id,
                    threadId: response.data.threadId,
                    subject: headers.find(header => header.name === 'Subject')?.value || '(no subject)',
                    from: headers.find(header => header.name === 'From')?.value || '',
                    date: headers.find(header => header.name === 'Date')?.value || '',
                    snippet: response.data.snippet,
                };
            })
        );

        res.json(messages);

    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).send('Error fetching emails: ' + error.message);
    }
});

router.post('/gmail/message/:id', async (req, res) => {
    try {
        const accessToken = req.body.accessToken;
        const messageId = req.params.id;

        // Initialize the Gmail API client
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const gmail = google.gmail({ version: 'v1', auth });

        // Get the full message details
        const response = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: 'full'
        });

        const message = response.data;
        const headers = message.payload.headers;
        
        // Helper function to decode base64 content
        const decodeBase64 = (data) => {
            return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
        };

        // Helper function to get message body
        const getBody = (payload) => {
            if (payload.body.data) {
                return decodeBase64(payload.body.data);
            }

            if (payload.parts) {
                for (const part of payload.parts) {
                    if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
                        return part.body.data ? decodeBase64(part.body.data) : '';
                    }
                }
            }

            return '';
        };

        // Get attachments if any
        const getAttachments = (payload) => {
            const attachments = [];
            
            const processPayloadForAttachments = (part) => {
                if (part.filename && part.filename.length > 0) {
                    attachments.push({
                        filename: part.filename,
                        mimeType: part.mimeType,
                        size: part.body.size,
                        attachmentId: part.body.attachmentId
                    });
                }
                
                if (part.parts) {
                    part.parts.forEach(processPayloadForAttachments);
                }
            };

            processPayloadForAttachments(payload);
            return attachments;
        };

        // Construct the formatted message
        const formattedMessage = {
            id: message.id,
            threadId: message.threadId,
            labelIds: message.labelIds,
            snippet: message.snippet,
            historyId: message.historyId,
            internalDate: message.internalDate,
            headers: {
                subject: headers.find(header => header.name === 'Subject')?.value || '(no subject)',
                from: headers.find(header => header.name === 'From')?.value || '',
                to: headers.find(header => header.name === 'To')?.value || '',
                date: headers.find(header => header.name === 'Date')?.value || '',
                cc: headers.find(header => header.name === 'Cc')?.value || '',
                bcc: headers.find(header => header.name === 'Bcc')?.value || ''
            },
            body: getBody(message.payload),
            attachments: getAttachments(message.payload)
        };

        res.json(formattedMessage);

    } catch (error) {
        console.error('Error fetching email:', error);
        res.status(500).send('Error fetching email: ' + error.message);
    }
});

router.post('/gmail/send', async (req, res) => {
    try {
        const {
            accessToken,
            to,
            subject,
            body,
            cc,
            bcc,
            isHtml = false,
        } = req.body;

        // Initialize the Gmail API client
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });
        const gmail = google.gmail({ version: 'v1', auth });

        // Construct email headers
        let email = [
            'Content-Type: ' + (isHtml ? 'text/html' : 'text/plain') + '; charset="UTF-8"',
            'MIME-Version: 1.0',
            'Content-Transfer-Encoding: 7bit',
            'to: ' + to,
            'subject: ' + subject,
        ];

        // Add CC if provided
        if (cc) {
            email.push('cc: ' + cc);
        }

        // Add BCC if provided
        if (bcc) {
            email.push('bcc: ' + bcc);
        }

        // Add empty line to separate headers from body
        email.push('');

        // Add the body
        email.push(body);

        // Convert the email to base64 format
        const encodedEmail = Buffer.from(email.join('\r\n'))
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        // Send the email
        const response = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedEmail
            }
        });

        res.status(200).json({
            message: 'Email sent successfully',
            messageId: response.data.id
        });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Error sending email: ' + error.message);
    }
});

router.post('/search', async (req, res) => {
    try {
        const { query } = req.body;
        const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
        const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
        const url = 'https://www.googleapis.com/customsearch/v1';

        const response = await axios.get(url, {
            params: {
                key: apiKey,
                cx: searchEngineId,
                q: query
            }
        });

        const results = response.data.items.map(item => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
            extra_info: item.pagemap
        }));

        res.json(results);

    } catch (error) {
        console.error('Error performing search:', error);
        res.status(500).send('Error performing search: ' + error.message);
    }
});











module.exports = router;


