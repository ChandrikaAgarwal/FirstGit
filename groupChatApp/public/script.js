const signupForm = document.querySelector("#signup-form")
const createProfBtn = document.querySelector(".createProfBtn")
const loginBtn = document.querySelector('.loginBtn')
const loginForm = document.querySelector('#login-form')
const sendMsgForm = document.querySelector('#send-msg-form')
const submitLogin = document.querySelector('.login-submit')
const chatAppPage = document.querySelector('#chatAppBody')
const logoutBtn = document.querySelector('.logoutBtn')
const sendMsgBtn = document.querySelector('#sendMsg')
const messagesUl=document.querySelector('.messages')

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
        try {
            
            let loggedInul = document.querySelector('.loggedInUsers')
            loggedInul.innerHTML += `<li class="navbar-item my-20 bg-slate-400 rounded-lg text-center">You joined</li>`
            const navItem = document.querySelector('.navbar-item')
            //getting all logged in Users
            let getLoginUsers = await axios.get(`${api_url}/api/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log("logged in users: ", getLoginUsers);
            const loginUsers = getLoginUsers.data.loggedInUsers
            loginUsers.forEach(user => {
                loggedInul.innerHTML += `<li id="${user.id}" class="navbar-item my-6 bg-slate-400 rounded-lg text-center">${user.name} joined</li>`
            })
        } catch (err) {
            console.log("error getting loggedIn users ", err);
            
        }
    }
    window.addEventListener("DOMContentLoaded", async () => {
        await getLoggedInUsers()
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
            localStorage.removeItem("token")
            window.location.href = "/users"
            alert("logged out successfully")
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
                messagesUl.innerHTML += `<li id="${sendMsg.data.userId}" class="newMsg">You: ${sendMsg.data.newMsg.message}</li>`

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
            let allmessages=getAllMsgs.data.allMsgs
            allmessages.forEach(msg => {
                if (msg.userId === getAllMsgs.data.currUser) {
                    messagesUl.innerHTML += `<li id="${msg.userId}" class="newMsg">You: ${msg.message}</li>`
                } else {
                    messagesUl.innerHTML += `<li id="${msg.userId}" class="newMsg">${msg.name}: ${msg.message}</li>`
                }
            })
        } catch (err) {
            console.log("error getting all messages ", err);
        
        }
    }
}