const signUpForm = document.querySelector('#signup-form')
const api_url = "http://localhost:5000";
const loginBtn = document.querySelector('#loginBtn')
const loginPage = document.querySelector('#login-page')
const loginForm = document.querySelector('#login-form')
const signUpBtn = document.querySelector('#signUpBtn')
const bookManagementPage = document.querySelector('#book-managment-page')
const booklistingPage = document.querySelector("#listBook-page")
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
            const response = await axios.post(`${api_url}`, newUser)
            signUpForm.reset()
            alert("Signup was successful")
            window.location.href = "/users"

        } catch (err) {
            console.log("error in signing up: ", err);
            console.error("Error: ", err.response)
            if (err.response && err.response.data.message) {
                alert(err.response.data.message)
                if (err.response.data.message === "User already exists. Please log in.") {
                    window.location.href = "/users"
                    
                }
            } else {
                alert("An error occured, please try again!!")
            }
        }
    })
    loginBtn.addEventListener('click', () => {
        window.location.href='/users'
    })
}

if (loginPage) {
    loginForm.addEventListener("submit", async (e) => {
        try {
            e.preventDefault();
            const loginDetails = {
                email: e.target.email.value,
                password: e.target.password.value
            }
            const loginResponse = await axios.post(`${api_url}/users`, loginDetails)
            alert(loginResponse.data.message)
            loginForm.reset()
            localStorage.setItem('token', loginResponse.data.token)
            window.location.href = "/books"
        } catch (err) {
            console.log("error logging in: ", err);
            if (err.response && err.response.data.message) {
                alert(err.response.data.message)
                if (err.response.data.message === "User not found. Please SignUp!") {
                    window.location.href = "/"

                }
        
            }
        }  
    })
    signUpBtn.addEventListener("click", () => {
        window.location.href="/"
    })
}



if (bookManagementPage) {
    const token = localStorage.getItem("token")
        
    let sidebar = document.querySelector('.sideBar')
    let sidebarCollapse = document.querySelector('#sideBar-collapse')
    let brandName = document.querySelector("#brandName")
    let bookLogo = document.querySelector('#bookLogo')
    let menuItems = document.querySelectorAll('.link-text')
    let icons=document.querySelectorAll('#icon')
    window.addEventListener("DOMContentLoaded", async () => {
        await sideBarCSS()
        await getAllListedBooks()
    })
    async function sideBarCSS() {
        sidebar.addEventListener("mouseenter", async () => {
            if (sidebar.classList.contains("w-20")) {
                sidebar.classList.remove("w-20")
                sidebar.classList.add("w-72")
                brandName.classList.remove("hidden")
                menuItems.forEach(item => {
                    item.classList.remove("hidden")
                });
                icons.forEach(icon => icon.classList.add("hover:animate-spin"))
            }
            
        })
        sidebar.addEventListener("mouseleave", async () => {
            if (sidebar.classList.contains("w-72")) {
                sidebar.classList.remove("w-72")
                sidebar.classList.add("w-20")
                brandName.classList.add("hidden")
                menuItems.forEach((item) => {
                    item.classList.add("hidden")
                })
            } 
        })
    }

    async function getAllListedBooks() {
        const allListedBooks = await axios.get(`${api_url}/fetch-books`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        console.log(allListedBooks);
        
        await displayAllBooks(allListedBooks.data.allBooks)
        
    }
    async function displayAllBooks(books) {
        const listedBooksDiv = document.querySelector("#listedBooks")
        listedBooksDiv.innerHTML=""
        books.forEach(book => {
           const boxSize = document.createElement("div")
            boxSize.id = "boxSize" 
            // boxSize.className =" relative border border-gray-300 rounded-lg shadow-md p-4 w-[300px] h-[450px] m-4 transition-transform duration-300 transform hover:scale-105 hover:z-10 bg-white motion-preset-bounce motion-duration-1000"
            boxSize.className = " relative border border-gray-300 rounded-lg shadow-md p-4 w-[300px] h-[450px] m-4 motion-scale-in-[0.5] motion-rotate-in-[-10deg] motion-blur-in-[10px] motion-delay-[0.75s]/rotate motion-delay-[0.75s]/blur motion-preset-bounce motion-duration-1000"
           const detailDiv=document.createElement("div")
            detailDiv.id = "detailDiv"
            detailDiv.className="p-2 rounded-lg "
           boxSize.appendChild(detailDiv)
           
            //img element
            const bookimg = document.createElement("img")
            if (book.bookImg) {
                bookimg.src = book.bookImg[0];
                bookimg.alt = "";
            }
            bookimg.className = "h-44 border-2 outline-black rounded-lg w-full object-center "
            
            const NamePriceDiv = document.createElement('div')
            NamePriceDiv.className="flex flex-row"
            const bookName = document.createElement('h2')
            bookName.textContent = book.title
            bookName.className="uppercase text-indigo-500 font-medium mt-4 mr-28"
            const bookPrice=document.createElement('h2')
            bookPrice.textContent =`INR ${book.price}`
            bookPrice.className ="text-indigo-500 font-medium mt-4 "
            NamePriceDiv.appendChild(bookName)
            NamePriceDiv.appendChild(bookPrice)

            const sellerName=document.createElement('p')
            sellerName.textContent = `By: ${book.sellerId.name}`
            sellerName.className="text-gray-900 font-medium mb-4"

            const experienceSec = document.createElement('h3')
            experienceSec.textContent = "Seller's Experience:"
            experienceSec.className ="text-gray-900 font-medium mb-2"
            
            const maxLength = 200;
            const sellerExp = document.createElement('p')
            sellerExp.textContent = book.experience || "Seller did not mention experience"
            sellerExp.className="text-justify text-base leading-relaxed mb-2 line-clamp-3"

            const readMore=document.createElement('a')
            readMore.href = `/books/${book._id}`
            readMore.textContent="Read more"
            readMore.className=""

            detailDiv.appendChild(bookimg)
            detailDiv.appendChild(NamePriceDiv)
            detailDiv.appendChild(sellerName)
            detailDiv.appendChild(experienceSec)
            detailDiv.appendChild(sellerExp)
            detailDiv.appendChild(readMore)
            listedBooksDiv.appendChild(boxSize)
        })
    }
}

if (booklistingPage) {
    const token = localStorage.getItem("token")
    console.log("token: ",token);
    
    const listBookForm = document.querySelector("#listBook-form")
    window.addEventListener("DOMContentLoaded", async () => {
        await listABook()
        
    })
    async function listABook() {
        const genreSelect = document.getElementById("genre");
        const otherGenreWrapper = document.getElementById("otherGenreWrapper");
        genreSelect.addEventListener("change", function() {
            if (this.value === "Other") {
                otherGenreWrapper.classList.remove("hidden");
            } else {
                otherGenreWrapper.classList.add("hidden");
            }
        })
        listBookForm.addEventListener("submit", async (e) => {
            try {
                e.preventDefault();
                const formData = new FormData()
                formData.append("title", e.target.title.value.trim());
                formData.append("author", e.target.author.value.trim());
                formData.append("location", e.target.location.value.trim())
                formData.append("experience", e.target.experience.value.trim())
                formData.append("price",e.target.price.value.trim())
                const files = document.querySelector("#bookImgs").files
                for (let i = 0; i < files.length; i++) {
                    formData.append("files", files[i])
                }
                if (e.target.genre.value === "Other") {
                    formData.append("subject", e.target.otherGenre.value.trim())
                } else {
                    formData.append("subject", e.target.genre.value)
                }
                const listBook = await axios.post(`${api_url}/sellbook`, formData, {
                    headers: {
                        'Content-Type':'multipart/form-data',
                        'Authorization':`Bearer ${token}`
                    }
                })
                console.log("book listed: ",listBook);
                listBookForm.reset()
            } catch (err) {
                console.log("error listing your book: ", err);
            
            }
        })
    }

    
}