const signupForm = document.querySelector('#signup-form')
const loginForm = document.querySelector('#login-form')
const createProfBtn = document.querySelector('.create-profBtn')
const loginBtn = document.querySelector('.loginBtn')
let api_url ="http://localhost:5000"
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
            console.log("new user: ", newuser);

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
                    window.location.href = "/users"
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
            // window.location.href = "/chat"
        } catch (err) {
            console.error("error logging in from frontend: ", err)
            if (err.response && err.response.data.message) {
                alert(err.response.data.message)
                if (err.response.data.message === "User not found, please sign up") {
                    window.location.href = "/"
                }
            }
        }
    })
}