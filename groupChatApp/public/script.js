const signupForm = document.querySelector("#signup-form")
const createProfBtn = document.querySelector(".createProfBtn")
const loginBtn = document.querySelector('.loginBtn')
const loginForm = document.querySelector('#login-form')
const sendMsgForm = document.querySelector('#send-msg-form')
const submitLogin = document.querySelector('.login-submit')
const chatAppPage = document.querySelector('#chatAppBody')
const logoutBtn = document.querySelector('.logoutBtn')
const sendMsgBtn = document.querySelector('#sendMsg')
const messagesUl = document.querySelector('.messages')
let loggedInul = document.querySelector('.loggedInUsers')
let socket = new WebSocket('ws://localhost:3000')
// const api_url=process.env.API_URL

const api_url ="http://localhost:3000"
if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            try {
                e.preventDefault();
                const newuser = {
                    name: e.target.name.value,
                    email: e.target.email.value,
                    phone: e.target.phone.value.trim(),
                    password: e.target.password.value,
                }
                console.log("new user: ",newuser);
                
                let hasSpace = newuser.phone.indexOf(" ")
                let phoneLength = newuser.phone.length
                if (phoneLength !== 10 || hasSpace >= 0) {
                    alert("Invalid phone number")
                    return
                }
                const newsignup = await axios.post(`${api_url}`, newuser)
                console.log("new Signup: ", newsignup);
                // console.log("token : ", newsignup.data.token);
                localStorage.setItem("token", newsignup.data.token)
                alert("Signup sucessful")
                signupForm.reset()
                window.location.href = "/users"
            } catch (err) {
            console.error("error signing up: ", err)
            if (err.response && err.response.data.message) {
                alert(err.response.data.message)
                if (err.response.data.message === "User already exists, please log in") {
                    window.location.href="/users"
                } else {
                    alert("error occurred, please try again!!")
                }
            }
        }
        })
    loginBtn.addEventListener('click', () => {
        window.location.href = "/users"
    })
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        try {
            e.preventDefault();
            const user = {
                email: e.target.email.value,
                password: e.target.password.value
            }
            const loginRes = await axios.post(`${api_url}/users`, user)
            console.log("login response: ", loginRes);
            localStorage.setItem("token", loginRes.data.token)
            alert("Login successful")
            loginForm.reset()
            window.location.href = "/chat"
          await startWebSocket()
        } catch (err) { 
            console.error("error logging in from frontend: ", err)
            if (err.response && err.response.data.message) {
                alert(err.response.data.message)
                if (err.response.data.message === "User not found, please sign up") {
                    window.location.href="/"
                }
            }
        }
    })
}

if (chatAppPage) {
    const token = localStorage.getItem("token")
    async function getLoggedInUsers() {
        console.log("entering getLoggedinUsers function");
        
        try {
            
            
            // loggedInul.innerHTML += `<li class="navbar-item my-20 bg-slate-400 rounded-lg text-center">You joined</li>`
            const navItem = document.querySelector('.navbar-item')
            //getting all logged in Users
            let getLoginUsers = await axios.get(`${api_url}/api/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log("logged in users: ", getLoginUsers);
            const loginUsers = getLoginUsers.data.loggedInUsers
            loggedInul.innerHTML = "";
            loginUsers.forEach(user => {
                if (user.id === getLoginUsers.data.currentUser) {
                    loggedInul.innerHTML += `<li id="${user.id}" class="navbar-item my-6 bg-slate-400 rounded-lg text-center">You joined</li>`
                } else {
                    loggedInul.innerHTML += `<li id="${user.id}" class="navbar-item my-6 bg-slate-400 rounded-lg text-center">${user.name} joined</li>`
                }
            })
            // await startWebSocket()
        } catch (err) {
            console.log("error getting loggedIn users ", err);
            
        }
    }
    window.addEventListener("DOMContentLoaded", async () => {
        await getLoggedInUsers()
        await startWebSocket()
        await getAllMessages()
    })
    
    logoutBtn.addEventListener('click', async (e) => {
        try {
            e.preventDefault();
            if (!token) {
                alert("You are already logged out")
                return
            }
            const loggingOut = await axios.post(`${api_url}/logout`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            // localStorage.removeItem("token")
            window.location.href = "/users"
            alert("logged out successfully")
            
            await startWebSocket()
        } catch (err) {
            console.log("error logging out: ", err);
           
        }
    })
    sendMsgForm.addEventListener('submit', async (e) => {
        try {
            e.preventDefault();
            const userMsg = {
                message: e.target.message.value,
            }
            const sendMsg = await axios.post(`${api_url}/api/messages`, userMsg, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log("message send response: ", sendMsg);
            sendMsgForm.reset()
            let newMsg = document.querySelector(`#m-${sendMsg.data.newMsg.id}`)
            console.log("newMwsg ",newMsg);
            
            newMsg.textContent = `You:${sendMsg.data.newMsg.message}`
            // messagesUl.innerHTML += `<li id="m-${sendMsg.data.newMsg.id}" class="newMsg">You: ${sendMsg.data.newMsg.message}</li>`
            // await startWebSocket()
        } catch (err) {
            console.log("error sending message: ", err);
        }
    })
    async function getAllMessages() {
        try {
                      
            const getAllMsgs = await axios.get(`${api_url}/api/messages`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log("all messages retrieved: ", getAllMsgs);
            let allmessages = getAllMsgs.data.allMsgs
            messagesUl.innerHTML = "";
            allmessages.forEach(msg => {
                if (msg.userId === getAllMsgs.data.currUser) {
                    messagesUl.innerHTML += `<li id="m-${msg.id}" class="newMsg">You: ${msg.message}</li>`
                } else {
                    messagesUl.innerHTML += `<li id="m-${msg.id}" class="newMsg">${msg.name}: ${msg.message}</li>`
                }
            })
            // await startWebSocket()
        } catch (err) {
            console.log("error getting all messages ", err);
        
        }
    }


    async function startWebSocket() {
        socket = new WebSocket("ws://localhost:3000");
        socket.addEventListener('open', () => {
            console.log("connected to websocket server");
        })
        socket.onerror = function (error) {
            console.log('WebSocket Error: ' + error);
        };
    socket.addEventListener('message', async (event) => {
            console.log("message received from server: ", event.data);
            
            const data = JSON.parse(event.data);
            console.log("message received: ", data);
            if (data.event === "user-joined") {
                console.log(`new user joined: ${data.name}`);
              await addToUserList(data.userId, data.name)
            
            }
        if (data.event === "user-left") { 
            console.log(`user-loggedout: ,${data.name}`);
            await removeFromUserList(data.userId, data.name)
        }

        if (data.event === "new-message") {
            console.log("new message received: ", data);
            await addMessage(data.message,data.msgId,data.name,data.userId)
        }
        })
    }
    async function addToUserList(userId, userName) {
        console.log("entering addtouserlist function");
        console.log("loggedInul: ",loggedInul);
        
        // let loggedInul = document.querySelector('.loggedInUsers')
        if (!document.getElementById(userId)) {
            console.log("entering if of loggedInul");
            loggedInul.innerHTML += `<li id="${userId}" class="navbar-item my-6 bg-slate-400 rounded-lg text-center">${userName} joined</li>`;
        }
    }
    async function removeFromUserList(userId, userName) { 
        console.log("entering to remove user form list");
        console.log("loggedInul: ",loggedInul);
        
        console.log("loggedin user on logout: ",loggedInul);
        
        // let loggedInul = document.querySelector('.loggedInUsers')
        if (document.getElementById(userId)) { 
            console.log("entering if of removeuser from list");
            
            loggedInul.removeChild(document.getElementById(userId))
        }
    }
    async function addMessage(message, msgId, userName,userId) { 
        console.log("entering add message function");
        console.log(`message received - msgId: ${msgId}, userId: ${userId}, userName: ${userName}`);

        if (!document.getElementById(`m-${msgId}`)) {
           console.log("checking if condition in addmessage");
                messagesUl.innerHTML += `<li id="m-${msgId}" class="newMsg">${userName}: ${message}</li>`
            
        }
    }
}