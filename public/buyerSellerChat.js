const buyerSellerchatPage = document.querySelector('#buyerSellerChat')
const token = localStorage.getItem("token")
const apiUrl = "http://localhost:5000"
let socket = new WebSocket('ws://localhost:5000')
if (buyerSellerchatPage) {
    const pathParts=window.location.pathname.split('/')
    let bookId=pathParts[pathParts.length-1]
    const buyers = document.querySelector("#buyers")
    const usersListPanel = document.querySelector("#userListPanel")
    const userList = document.querySelector("#userList")
    const chatWindow = document.querySelector("#chatWindow")
    const chatMessages = document.querySelector("#chatMessages")
    const messagesUl = document.querySelector("#messagesUl")
    let currentUser;
    window.addEventListener("DOMContentLoaded", async () => {
        await getChatList()
        await contactsCSS() 
        await startWebSocket()
    })
    async function getChatList() {
        const getList = await axios.get(`${apiUrl}/api/chat/${bookId}`, {
            headers: {
               'Authorization':`Bearer ${token}`
           }
        })

        console.log("chat List: ", getList);
        await displayChatList(getList.data.list, getList.data.isSeller)
        
        
        
    }
    async function contactsCSS() {
        buyers.addEventListener("click", async () => {
            if (usersListPanel.classList.contains("hidden")) {
                usersListPanel.classList.remove("hidden")
            } else {
                usersListPanel.classList.add("hidden")
            }
        })
    }
    
    
 
    async function displayChatList(chatList, isSeller) {
        if (isSeller) {
            chatList.forEach(chat => {
                const buyerLi=document.createElement('li')
                buyerLi.className = "buyerLi p-2 cursor-pointer bg-indigo-100 rounded m-3"
                buyerLi.textContent=chat.buyerName
                buyerLi.dataset.buyerId = chat.buyerId
                buyerLi.dataset.bookId = chat.bookId
                buyerLi.setAttribute("data-bookname", chat.bookTitle)
                userList.appendChild(buyerLi)
                
            })
        } else {
            const buyers = document.querySelector("#buyers")
            const spanOfBuyers = buyers.querySelector("span.link-text")
            spanOfBuyers.textContent = "Seller"
            userList.innerHTML=""
            
                const sellerLi = document.createElement('li')
                sellerLi.className = "buyerLi p-2 cursor-pointer bg-indigo-100 rounded m-3"
                sellerLi.textContent = chatList.sellerName
                sellerLi.dataset.buyerId = chatList.sellerId
                sellerLi.dataset.bookId = chatList.bookId
                sellerLi.setAttribute("data-bookname", chatList.bookTitle)
                userList.appendChild(sellerLi)
            
        }
    }

    let bookName = null
    let buyerId=null
    
    
        userList.addEventListener("click", async (e) => {
            let clickedBuyerLi = e.target.closest('li')
            bookName = clickedBuyerLi.getAttribute('data-bookname')
            if (!clickedBuyerLi) return;
            buyerId = clickedBuyerLi.dataset.buyerId
            bookId = clickedBuyerLi.dataset.bookId
            console.log("Chatting with: ", clickedBuyerLi.textContent, "for book: ", bookName, "buyerId: ", buyerId);
            let chatInfoDiv = document.querySelector("#chatInfoDiv")
            if (chatInfoDiv) {
                chatInfoDiv.innerHTML = ""
            } else {
                chatInfoDiv = document.createElement("div")
                chatInfoDiv.id = "chatInfoDiv"
            }
            const talkingTo = document.createElement('h2')
            talkingTo.innerHTML = `<i class="fa-solid fa-user float-left block p-3"></i> ${clickedBuyerLi.textContent}`
            talkingTo.className = "m-6"
            const book = document.createElement('h2')
            book.innerHTML = `<i class="fa-solid fa-book-open ml-8 mr-2"></i> ${bookName}`
            chatInfoDiv.appendChild(talkingTo)
            chatInfoDiv.appendChild(book)
            chatWindow.insertBefore(chatInfoDiv, chatMessages)
            await getMyChats(buyerId,bookId)
            
        })
       
    async function getMyChats(recieverId, bookId) {
        try {
            const myChats = await axios.get(`${apiUrl}/fetch-chats/${bookId}`, {
                params: {
                    recieverId
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log("mychats: ", myChats);
            let allchats = myChats.data.mychats
            currentUser = myChats.data.userId
            messagesUl.innerHTML = ""
            allchats.forEach(chat => {
                if (chat.senderId === currentUser) {
                    messagesUl.innerHTML += `<li id="gm-${chat.id}" class="newMsg text-right m-3 text-white font-semibold"><span class="bg-green-900 p-3 rounded-md h-4">You: ${chat.message}</span></li>`
                } else {
                    messagesUl.innerHTML += `<li id="gm-${chat.id}" class="newMsg text-left m-3 text-white font-semibold"><span class="bg-slate-800 p-3 rounded-md h-4">${chat.senderName}: ${chat.message}</span></li>`
                }
            })
        } catch (err) {
            console.log("Error loading chats: ",chat);
            
        }
       }
    
        const chatForm = document.querySelector("#chatForm")
        chatForm.addEventListener("submit", async (e) => {
            try {
                e.preventDefault();
                const messageDetails = {
                    message: e.target.messageInput.value,
                    recieverId: buyerId,
                    bookId,
                    bookName
                }
                
                const sendMsg = await axios.post(`${apiUrl}/send-msg`, messageDetails, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                console.log("Message sent: ", sendMsg);
                chatForm.reset()
                await startWebSocket()


            } catch (err) {
                console.log("error sending a message: ", err);

            }

        })

    


    async function startWebSocket() {
        socket = new WebSocket("ws://localhost:5000");
        socket.addEventListener('open', () => {
            console.log("Connected to Websocket server");
            socket.send(JSON.stringify({
                type: 'auth',
                token: token
            }))
        
        
        socket.pingInterval = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: "ping" }));
            }
        }, 30000); // ping every 30 seconds
    });
       
        socket.onerror = function (error) {
            console.log('WebSocket Error: ' + error);
        };

        socket.addEventListener('message', async (event) => {
            console.log("message received from server: ", event.data);
            let data;
            if (event.data instanceof Blob) {
                const text = await event.data.text();
                console.log("text: ", text);
                data = JSON.parse(text)
            } else {
                data = JSON.parse(event.data)
            }
            if (data.event === "new-msg") {
                console.log("message received in : ", data);
                await addMessage(data)
            }
        })
    }
    async function addMessage(data) {
        console.log("Entering addMessage");
        if (!document.getElementById(`gm-${data.msgId}`)) {
            if (data.message.indexOf('https://') !== -1) {
                messagesUl.innerHTML+=`<li id="gm-${data.msgId}" class="newMsg"><span>${data.senderName}<img src="${data.message}"></img></span></li>`
            } else if (currentUser === data.senderId) {
                console.log("this is sender here!!");
                messagesUl.innerHTML += `<li id="gm-${data.msgId}" class="newMsg text-right m-3 text-white font-semibold"><span class="bg-green-900 p-3 rounded-md h-4">You: ${data.message}</span></li>`
            } else {
                console.log("this is reciever here!!");
                messagesUl.innerHTML += `<li id="gm-${data.msgId}" class="newMsg text-left m-3 text-white font-semibold"><span class="bg-slate-800 p-3 rounded-md h-4">${data.senderName}: ${data.message}</span></li>`
            }
        }
     
 }
}