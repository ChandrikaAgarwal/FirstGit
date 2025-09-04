const jwt=require("jsonwebtoken")
module.exports = (wss) => {
    wss.on('connection', (ws) => {
        console.log("New websocket connection!");
        ws.on("message", (message) => {
            console.log(`Message recieved: ${message}`);
            const data = JSON.parse(message)
            if (data.type === "auth") {
                const decoded = jwt.verify(data.token, process.env.SECRET_KEY)
                ws.userId = decoded.id
                ws.send(JSON.stringify({event:'auth-success'}))
            }
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message)
                }
            })
        })
        ws.on('close', () => {
            console.log("WebSocket connection closed");
            
        })
    })
}