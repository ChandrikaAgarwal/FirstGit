const specificGrpPage = document.querySelector('#groupBody')
const usersloggedIngroup = document.querySelector('.usersloggedIngroup')
const sendMsgForm = document.querySelector('#group-msg-form')
const messagesUl = document.querySelector('.groupmessages')
const addParticipantForm = document.querySelector('#addParticipants-form')
const searchInput = document.querySelector('#search')
const searchRes = document.querySelector('#searchResults')
const addMembersBtn = document.querySelector('#addMembers')
const removeUserBtn = document.querySelector('#deleteMembers')
const fileForm = document.querySelector('#fileUploadForm')
const fileInput = document.querySelector('#fileInput')
const formData=new FormData()
let socket = new WebSocket('ws://localhost:3000')
// const api_url=process.env.API_URL

const api_url = "http://localhost:3000"
const token = localStorage.getItem('token');
if (specificGrpPage) {
    const pathParts = window.location.pathname.split('/')
    const groupId = pathParts[pathParts.length - 1]
    window.addEventListener("DOMContentLoaded", async () => {
        await getuserofgrp()
        await startWebSocket()
        await getLoggedInUsers()
        await getAllMessages()
    })
    let searchTimeout
    let searchQuery = ""
    let userId
    function handleLiveSearch() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchUsers();  // Call the same search function after delay
        }, 300); // Debounce: wait 300ms after user stops typing
    }
    async function searchUsers() {
        try {
            searchQuery = searchInput.value.trim()
            if (searchQuery === "") {
                searchRes.innerHTML = "";
                return;
            }
                const response = await axios.get(`${api_url}/group/${groupId}/search?searchQ=${searchQuery}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                const searchResults = response.data.users
                console.log("search Results: ", searchResults);
        
            searchRes.innerHTML = ""
            if (searchResults.length === 0) {
                searchRes.innerHTML = `<li class="mx-44">No matching users found</li>`
                return
            }
            searchRes.innerHTML = searchResults.map(user => {
            return `<li id="user-match-${user.id}" class="mx-44 cursor-pointer hover:bg-gray-100 p-1">${user.name}</li>`;
            }).join(""); 
            console.log("search Results",searchRes);
            
            searchResults.forEach(user => {
                // searchRes.innerHTML += `<li id="user-match-${user.id}" class="mx-44 cursor-pointer hover:bg-gray-100 p-1">${user.name}</li>`
                let name = user.name
                console.log(typeof (name));
            
                let li = document.querySelector(`#user-match-${user.id}`)
                console.log("li:",li);
                
                li.addEventListener('click', async () => {
                    searchInput.value = li.textContent
                    userId = li.id.split('-')[2]
                    console.log("userid ", userId);
                    
                    searchRes.innerHTML = ""
                });
            })

        } catch (err) {
            console.error("Error searching for users", err)
            if (err.response && err.response.data.message) {
                alert(err.response.data.message)
                if (err.response.data.message === "You are not the admin") {
                    window.location.href=`/group/${groupId}`
                }
            }
        }
    }

    addMembersBtn.addEventListener('click', async (e) => {
        try {
            let newMember = {
                inputVal: searchInput.value,
                inputId: userId
            }
            const addNewMember = await axios.post(`${api_url}/group/${groupId}/search`, newMember, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log("new member to add: ", addNewMember);
        } catch (err) { 
            console.error("Error adding new member", err)
            if (err.response && err.response.data.message) {
                alert(err.response.data.message)
                window.location.href = `/group/${groupId}`
            }
        }
    })
    
    removeUserBtn.addEventListener('click', async (e) => {
        try {
            let deleteMember = {
                inputVal: searchInput.value,
                inputId: userId
            }
            const deleteMemberRes = await axios.delete(`${api_url}/group/${groupId}/search?userId=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log("member deleted: ", deleteMemberRes);
        } catch (err) {
            console.error("Error deleting a member", err)
            if (err.response && err.response.data.message) {
                alert(err.response.data.message)
                window.location.href = `/group/${groupId}`
            }
        }
    })

    async function getuserofgrp() {
        
        try {
            const getusersofGroup = await axios.post(`${api_url}/group/${groupId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log("users of group: ", getusersofGroup)
            let id = getusersofGroup.data.joinedUser.userId
            usersloggedIngroup.innerHTML += `<li id="${id}" class="group-member my-6 bg-slate-400 rounded-lg text-center">You joined</li>`

        } catch (err) {
            console.log("error fetching group users", err)
        }
    }
     
    async function getLoggedInUsers() {
        console.log("entering getLoggedinUsers function");

        try {
            const grpItem = document.querySelector('.group-member')
            //getting all logged in Users
            let getLoginUsers = await axios.get(`${api_url}/api/group/${groupId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log("logged in users: ", getLoginUsers);
            const loginUsers = getLoginUsers.data.loggedInMembers
            usersloggedIngroup.innerHTML = "";
            loginUsers.forEach(user => {
                if (user.userId === getLoginUsers.data.currentUser) {
                    console.log("you joined");
                    
                    usersloggedIngroup.innerHTML += `<li id="${user.userId}" class="group-member my-6 bg-slate-400 rounded-lg text-center">You joined</li>`
                } else {
                    usersloggedIngroup.innerHTML += `<li id="${user.userId}" class="group-member my-6 bg-slate-400 rounded-lg text-center">${user.username} joined</li>`
                }
            })
            // await startWebSocket()
        } catch (err) {
            console.log("error getting loggedIn users ", err);

        }
    }

    sendMsgForm.addEventListener('submit', async (e) => {
        try {
            e.preventDefault();
            const userMsg = {
                message: e.target.message.value,
            }
            const sendMsg = await axios.post(`${api_url}/api/messages/group/${groupId}`, userMsg, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log("message send response: ", sendMsg);
            sendMsgForm.reset()
            let newMsg = document.querySelector(`#gm-${sendMsg.data.newgrpMsg.id}`)
            console.log("newMwsg ", newMsg);

            newMsg.textContent = `You:${sendMsg.data.newgrpMsg.message}`
        } catch (err) {
            console.log("error sending message: ", err);
        }
    })

    async function getAllMessages() {
        try {
            const getAllMsgs = await axios.get(`${api_url}/api/messages/group/${groupId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log("all messages retrieved: ", getAllMsgs);
            let allmessages = getAllMsgs.data.allMsgs
            messagesUl.innerHTML = "";
            allmessages.forEach(msg => {
                if (msg.userId === getAllMsgs.data.currUser) {
                    messagesUl.innerHTML += `<li id="gm-${msg.id}" class="newMsg">You: ${msg.message}</li>`
                } else {
                    messagesUl.innerHTML += `<li id="gm-${msg.id}" class="newMsg">${msg.name}: ${msg.message}</li>`
                }
            })
            // await startWebSocket()
        } catch (err) {
            console.log("error getting all messages ", err);

        }
    }

    fileForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log("files: ", fileInput.files);
        
        for (const file of fileInput.files) {
            formData.append('files', file)       
        }
        try {
            const fileResponse = await axios.post(`${api_url}/api/fileupload/group/${groupId}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })
            console.log("fileResponse: ",fileResponse);
            let newMsg = document.querySelector(`#gm-${fileResponse.data.messages.id}`)
            console.log("newMwsg ", newMsg);
            newMsg.textContent = `You:${fileResponse.data.messages.message}`
            fileForm.reset()
        } catch (err) {
            console.log("error uploading file: ", err);
        }
    })
}
async function startWebSocket() {
    socket = new WebSocket("ws://localhost:3000");
    socket.addEventListener('open', () => {
        console.log("connected to websocket server");
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
            console.log("text: ", text);
            data = JSON.parse(text);
        } else {
            data = JSON.parse(event.data);
        }
        console.log("message received: ", data);
        if (data.event === 'groupmember-joined') {
            console.log("message received: ", data);
            console.log("group member joined");
            await addMember(data.name, data.userId)
        }
        if (data.event === 'new-group-msg') {
            console.log("message received in group: ", data);
            await addMessage(data.message, data.msgId, data.name, data.userId)
        }
        if (data.event === 'new-member') {
            console.log("new member joined the group"); 
        }
        if (data.event === 'new-filemsg') {
            console.log("new file message received in group: ", data);
            await addMessage(data.message, data.msgId, data.name, data.userId)
        }
    })
}

async function addMember(userName, userId) {
    console.log("entering addmember function");
    console.log("usersloggedIngroup: ", usersloggedIngroup);

    // let loggedInul = document.querySelector('.loggedInUsers')
    if (!document.getElementById(userId)) {
        console.log("entering if of usersloggedIngroup");
        usersloggedIngroup.innerHTML += `<li id="${userId}" class="group-member my-6 bg-slate-400 rounded-lg text-center">${userName} joined</li>`;
    }
}

async function addMessage(message, msgId, userName, userId) {
    console.log("entering add message function");
    console.log(`message received - msgId: ${msgId}, userId: ${userId}, userName: ${userName}`);

    if (!document.getElementById(`gm-${msgId}`)) {
        console.log("checking if condition in addmessage");
        if (message.indexOf('https://') !== -1) {
            messagesUl.innerHTML += `<li id="gm-${msgId}" class=newMsg>${userName}:<a href="${message}" target="_blank">${message}</a></li>`
        } else {
            messagesUl.innerHTML += `<li id="gm-${msgId}" class="newMsg">${userName}: ${message}</li>`
        }
    }
}