const signUpForm = document.querySelector('#signup-form')

if (signUpForm) {
    signUpForm.addEventListener("submit", async (e) => {
        try {
        e.preventDefault();
            const newUser = {
                name: e.target.name.value,
                email: e.target.email.value,
                phone: e.target.phone.value,
                password:e.target.password.value
            }
            let userPhn = newUser.phone.trim()
            let hasSpace = userPhn.indexOf(" ")
            if (userPhn.length !== 10 || hasSpace >= 0) {
               alert("Enter a valid phone number!")
                return
            }
            

        } catch (err) {
            
        }
    })
}