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
let groups=document.querySelector('.groups')
const groupPage = document.querySelector('#createGroup')
const groupsUl = document.querySelector('.groupscreated')
const specificGrpPage = document.querySelector('#groupBody')
const usersloggedIngroup = document.querySelector('.usersloggedIngroup')
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

const token = localStorage.getItem("token")
let groupItems;
if (chatAppPage) {
    async function getLoggedInUsers() {
        console.log("entering getLoggedinUsers function");
        
        try {
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
        await getAllGroups()
        await getGroupUsers()
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
            console.log("newMwsg ", newMsg);
            
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

    async function getAllGroups() {
        try {
            const getAllGroups = await axios.get(`${api_url}/api/creategroup`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log("all groups: ", getAllGroups);
            let allgroups = getAllGroups.data.groups
            allgroups.forEach((group) => {
                // groupsUl.innerHTML +=`<li id=${group.id} class="navbar-item my-6 bg-slate-400 rounded-lg text-center">${group.groupname}</li>`
                groupsUl.innerHTML += `<li id="g-${group.groupId}"><a href="/group/${group.groupId}" class=" new-group flex navbar-item my-6 px-10 bg-slate-400 rounded-lg text-center">${group.groupname}</a></li>`
            })
            console.log(groupsUl);
            groupItems = document.querySelectorAll(".groupscreated li");
            console.log("group items: ", groupItems);
            await getGroupUsers()
        } catch (err) {
            console.log("Error fetching all groups");
            
        }
    }
}
    let getusersofGroup;
    async function getGroupUsers() {
        try {
            console.log(typeof (groupsUl));
            console.log("group items: ", groupItems);
            groupItems.forEach((group) => {
                console.log("entering for each of groups");
                let id = group.id.split('-')[1]
                group.addEventListener("click", async (e) => {
                    e.preventDefault()
                    window.location.href = `/group/${id}`
                    
                })
                
            })
        } catch (err) {
            console.log("error fetching members of group: ", err);
            
        }
    }





    async function startWebSocket() {
        socket = new WebSocket("ws://localhost:3000");
        socket.addEventListener('open', () => {
            console.log("connected to websocket server");
            const token = localStorage.getItem('token');
            socket.send(JSON.stringify({
                type: 'auth',
                token: token
            }));
        })
        socket.onerror = function (error) {
            console.log('WebSocket Error: ' + error);
        };
        socket.addEventListener('message', async (event) => {
            console.log("message received from server: ", event.data);
            let data;
            if (event.data instanceof Blob) {
                const text = await event.data.text();
                console.log("text: ",text);
                data = JSON.parse(text);
            } else {
                data = JSON.parse(event.data);
            }
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
                await addMessage(data.message, data.msgId, data.name, data.userId)
            }

            if (data.event === 'new-group') {
                console.log("new group created:",data);
                await addGroup(data.groupname, data.groupId)
            }
        })
    }
    async function addToUserList(userId, userName) {
        console.log("entering addtouserlist function");
        console.log("loggedInul: ", loggedInul);
        
        // let loggedInul = document.querySelector('.loggedInUsers')
        if (!document.getElementById(userId)) {
            console.log("entering if of loggedInul");
            loggedInul.innerHTML += `<li id="${userId}" class="navbar-item my-6 bg-slate-400 rounded-lg text-center">${userName} joined</li>`;
        }
    }
    async function removeFromUserList(userId, userName) {
        console.log("entering to remove user form list");
        console.log("loggedInul: ", loggedInul);
        
        console.log("loggedin user on logout: ", loggedInul);
        
        // let loggedInul = document.querySelector('.loggedInUsers')
        if (document.getElementById(userId)) {
            console.log("entering if of removeuser from list");
            
            loggedInul.removeChild(document.getElementById(userId))
        }
    }
    async function addMessage(message, msgId, userName, userId) {
        console.log("entering add message function");
        console.log(`message received - msgId: ${msgId}, userId: ${userId}, userName: ${userName}`);

        if (!document.getElementById(`m-${msgId}`)) {
            console.log("checking if condition in addmessage");
            messagesUl.innerHTML += `<li id="m-${msgId}" class="newMsg">${userName}: ${message}</li>`
            
        }
    }

async function addGroup(grpName, grpId) {
    console.log("entering add group function");
    if (!document.getElementById(`g-${grpId}`)) {
        console.log("checking if condition in addgroup");
        groupsUl.innerHTML += `<li id="g-${grpId}"><a href="/group/${grpId}" class="new-group flex navbar-item my-6 px-10 bg-slate-400 rounded-lg text-center">${grpName}</a></li>`
    }
}




if (groupPage) {
    const token = localStorage.getItem("token")
    console.log("token: ",token);
    
    const dropDownMenu = document.querySelector('#dropdownMenu')
    const toggle = document.getElementById("dropdownToggle");
    const dropdown = document.getElementById("multiSelect");
    const createGrpBtn = document.querySelector('#createGrpBtn')
    const createBtn = document.querySelector('#createBtn')
    const newGrpFrom = document.querySelector('#newgrp-form')
    let selectedUsers;
    async function getAllUsers() {
        try {
            let allUsers = await axios.get(`${api_url}/users/allusers`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log("all users: ", allUsers);
            allUsers=allUsers.data.allUsers
            allUsers.forEach((user) => {
                dropDownMenu.innerHTML +=`<label class="flex items-center px-4 py-2 hover:bg-gray-100">
                <input type="checkbox" value="${user.name}" data-id="${user.id}" class="mr-2"> ${user.name}
            </label>`
            })
            toggle.addEventListener("click", () => {
                dropDownMenu.classList.toggle("hidden");
            });
            const checkboxes = dropDownMenu.querySelectorAll("input[type='checkbox']");
            checkboxes.forEach(cb => {
                cb.addEventListener("change", () => {
                    const selected = Array.from(checkboxes)
                        .filter(c => c.checked)
                        .map(c => c.value)
                        .join(", ");
                    toggle.textContent = selected.length ? selected : "Select options";
                });
            });
            // Click outside to close
            document.addEventListener("click", (e) => {
                if (!dropdown.contains(e.target)) {
                    dropDownMenu.classList.add("hidden");
                }
            });
            
        } catch (err) {
            console.log("error in getting all users: ", err);  
        }

    }
    createGrpBtn.addEventListener('click', () => {
        console.log("toggle textContent: ", toggle.textContent);
        selectedUsers = Array.from(document.querySelectorAll("input[type='checkbox']:checked"))
            .map(cb => ({
                id: cb.dataset.id,
                name: cb.value
            }));
        console.log("selectedUsers: ", selectedUsers);
        document.querySelector('#group_nameForm').classList.remove('hidden')
    })
    newGrpFrom.addEventListener('submit', async (e) => {
        try {
            e.preventDefault();
            const groupNm = document.querySelector('#groupName').value;
            const grpDetails = {
                grpName: e.target.groupName.value,
                users:selectedUsers
            }
            console.log("grp details: ",grpDetails);
            
            const createGrpRes = await axios.post(`${api_url}/api/creategroup`, grpDetails, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log("grpDetails are: ",createGrpRes);
            newGrpFrom.reset();
            
        } catch (err) {
            console.log("error creating a group: ",err);
            
        }
    })
    window.addEventListener("DOMContentLoaded", async () => { 
        await getAllUsers();
        await startWebSocket()
    })
}
