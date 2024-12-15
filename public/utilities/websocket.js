let websocket = null;

function connectWebSocket() {
    console.log('Attempting to connect to WebSocket...');
    
    websocket = new WebSocket('wss://treefrog-shining-unlikely.ngrok-free.app');

    websocket.onopen = () => {
        console.log('WebSocket connection established');
        // Send initial start message
        const startMessage = {
            type: "start",
            command: "source ~/venv/bin/activate && interpreter --os"
        };
        
        websocket.send(JSON.stringify(startMessage));
        console.log('Start message sent:', startMessage);
    };

    websocket.onmessage = (event) => {
        console.log('Received message:', event.data);
        // Handle incoming messages here
    };

    websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    websocket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
    };
}


// new computer command function
async function executeComputerCommand(command) {
    let wsResponse = "";  // Initialize response aggregator
    

    try {
        // Send command to websocket
        const message = {
            type: "input",
            input: command
        };
        websocket.send(JSON.stringify(message));

        // Create promise to handle websocket responses
        await new Promise((resolve, reject) => {
            const messageHandler = (event) => {
                wsResponse += event.data;  // Aggregate responses
                let mainOutput;
                try {
                    mainOutput = JSON.parse(event.data);
                    console.log(mainOutput);
                    // Check for either command prompt or exit message
                    if (event.data.includes("> ") || (event.type === "exit")) {

                        const responseLines = wsResponse.split('\n');
                        const last30Lines = responseLines.slice(-30).join('\n');

                        const toolCallResults = {
                            status: "success",
                            response: JSON.stringify(last30Lines)
                        };
                        
                        websocket.removeEventListener('message', messageHandler);
                        resolve(toolCallResults);
                    }
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            };

            // Add temporary message handler
            websocket.addEventListener('message', messageHandler);
            
            // // Optional: Add timeout
            // setTimeout(() => {
            //     websocket.removeEventListener('message', messageHandler);
            //     reject(new Error('WebSocket response timeout'));
            // }, 30000);  // 30 second timeout
        }).then(toolCallResults => {
            console.log(toolCallResults);
            return toolCallResults;
        });

    } catch (error) {
        console.error('Error in executeComputerCommand:', error);
        return {
            "status": "error",
            "response": "There was an error with computer connect. Either your computer is turned off or the connection could not be established."
        }
    }
}


document.addEventListener('DOMContentLoaded', connectWebSocket);

