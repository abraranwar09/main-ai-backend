async function handleToolCalls(data, skeletonLoader) {
    if (data.finish_reason === 'tool_calls') {
        const toolCallPromises = data.tool_calls.map(async (toolCall) => {
            const functionName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments);
            
            let functionResponse;
            switch (functionName) {
                case 'open_google':
                    functionResponse = await openGoogle(args.query);
                    break;
                case 'generateProfile':
                    functionResponse = await generateProfile(args.taskDescription, args.industry, args.additionalRequirements, args.model);
                    break;
                case 'getCalendarEvents':
                    functionResponse = await getCalendarEvents(args.timePeriod, args.query);
                    break;
                case 'saveEvent':
                    functionResponse = await saveEvent(args.summary, args.location, args.description, args.start, args.end);
                    break;
                case 'listGmailMessages':
                    functionResponse = await listGmailMessages(args.maxResults, args.query);
                    break;
                case 'getGmailMessage':
                    functionResponse = await getGmailMessage(args.messageId);
                    break;
                case 'sendGmailMessage':
                    functionResponse = await sendGmailMessage(args.to, args.subject, args.body, args.cc, args.bcc, args.isHtml);
                    break;
                case 'performGoogleSearch':
                    functionResponse = await performGoogleSearch(args.query);
                    break;
                case 'usePerplexity':
                    functionResponse = await usePerplexity(args.query);
                    break;
                case 'checkKnowledgeBase':
                    functionResponse = await checkKnowledgeBase(args.query);
                    break;
                case 'scrapeWeb':
                    functionResponse = await scrapeWeb(args.url);
                    break;
                case 'executeComputerCommand':
                    functionResponse = await executeComputerCommand(args.command);
                    break;
                default:
                    console.warn(`Unhandled function name: ${functionName}`);
                    return null;
            }
            
            return {
                tool_call_id: toolCall.id,
                function_name: functionName,
                function_response: functionResponse
            };
        });

        // Execute all tool calls in parallel and get results
        const toolResults = await Promise.all(toolCallPromises);
        
        // Submit all results together
        const sessionId = localStorage.getItem('session_id');
        const response = await fetch('/ai/tool-response', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                session_id: sessionId,
                tool_responses: toolResults
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        if (responseData.response) {
            skeletonLoader.remove(); // Remove skeleton loader after displaying bot message
            displayBotMessage(responseData.response);
        }
    }
}
