let socket;

export async function startWebSocket(token) {
    socket = new WebSocket("ws://localhost:3000")
    socket.addEventListener("open", () => {
        console.log("connected to websocket server");
        socket.send(JSON.stringify({
            type: "auth",
            token:token
        }))
    })

    socket.onerror = function (error) {
        console.log("Websocket error: "+error);  
    }

    socket.addEventListener('message', async (event) => {
        let data;
        if (event.data instanceof Blob){
            const text = await event.data.text()
            data=JSON.parse(text)
        } else {
            data = JSON.parse(event.data)
        }
        if (data.event === 'new-rating') {
            window.dispatchEvent(new CustomEvent("new-rating",{detail:data}))
        }
    })
}

export function getSocket() {
    return socket
}