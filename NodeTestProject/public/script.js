const signupForm = document.querySelector('#signup-form')
const loginForm = document.querySelector('#login-form')
const createProfBtn = document.querySelector('.create-profBtn')
const adminLogin = document.querySelector('.admin-login')
const userLogin = document.querySelector('.user-login')
const loginBtn = document.querySelector('.loginBtn')
const editProfilePage = document.querySelector('#edit-profilePage')
const editprofForm = document.querySelector('#editProfile-form')
const homePage = document.querySelector("#homePage")
const myRecipes = document.querySelector("#myRecipes")
const selectedRecipePage = document.querySelector("#selected-recipe")
const authorsPage = document.querySelector('#authorsPage')
const author = document.querySelector('#author')
const adminCredsPage = document.querySelector('#adminCredsPage')
const activityFeedPg = document.querySelector('#activityFeed-page')
import { displayRecipe } from "./utilities/displayRecipe.js"
let api_url = "http://localhost:3000"
import { startWebSocket } from "./websocket/startWebSocket.js"
let socket = new WebSocket('ws://localhost:3000')
const url = window.location.pathname.split('/')
if (!url.includes('admin')) {
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
        adminLogin.addEventListener('click', async () => {
            let role = 'admin'
            let email = document.querySelector('#email').value
            let password = document.querySelector('#password').value
            await submitLoginForm(role, email, password)
        })
        userLogin.addEventListener('click', async () => {
            let role = 'user'
            let email = document.querySelector('#email').value
            let password = document.querySelector('#password').value
            await submitLoginForm(role, email, password)
        })
        async function submitLoginForm(role, email, password) {
            try {
                const user = {
                    role: role,
                    email: email,
                    password: password
                }
                if (role === 'admin') {
                    const loginAdmin = await axios.post(`${api_url}/admin-login`, user)
                    console.log("login response: ", loginAdmin);
                    loginForm.reset()
                    localStorage.setItem("token", loginAdmin.data.token)
                    alert("Login successful!")
                    window.location.href = "/admin"
                } else {
                    const loginRes = await axios.post(`${api_url}/users`, user)
                    console.log("login response: ", loginRes);
                    localStorage.setItem("token", loginRes.data.token)
                    alert("Login successful!")
                    loginForm.reset()
                    window.location.href = "/home"
                }
            } catch (err) {
                console.error("error logging in from frontend: ", err)
                if (err.response && err.response.data.message) {
                    alert(err.response.data.message)
                    if (err.response.data.message === "User not found, please sign up") {
                        window.location.href = "/"
                    }
                }
            }
        }
    }
    if (adminCredsPage) {
        const token = localStorage.getItem("token")
        let adminCredsForm = document.querySelector('#adminCreds-form')
        try {
            adminCredsForm.addEventListener('submit', async (e) => {
                e.preventDefault()
                const newAdmin = {
                    email: e.target.email.value,
                    password: e.target.password.value
                }
                let setAdminCreds = await axios.post(`${api_url}/api/setadmin-creds`, newAdmin, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                // console.log("admin credentials: ", setAdminCreds);
                alert(setAdminCreds.data.message)
                adminCredsForm.reset()
            })
        } catch (err) {
            console.log("error creating admin credentials: ", err);

        }
    }
    if (editProfilePage) {
        const token = localStorage.getItem("token")
        editprofForm.addEventListener('submit', async (e) => {
            try {
                e.preventDefault();
                const editUser = {
                    name: e.target.editname.value,
                    email: e.target.editemail.value,
                    phone: e.target.editphone.value.trim(),
                    password: e.target.confirmpass.value,
                }
                console.log("edit User: ", editUser);
                let hasSpace = editUser.phone.indexOf(" ")
                let phoneLength = editUser.phone.length
                if (phoneLength !== 10 || hasSpace >= 0) {
                    alert("Invalid phone number")
                    return
                }
                const editProfile = await axios.post(`${api_url}/edit-profile`, editUser, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                console.log("profile edited: ", editProfile);
                window.location.href = '/home'
            } catch (err) {
                console.log("error editing profile: ", err);

            }
        })
    }

    if (homePage) {
        const token = localStorage.getItem("token")

        window.addEventListener("DOMContentLoaded", async () => {
            const mainIngredientSelect = document.getElementById('main-ingredients');
            const recipeTypeSelect = document.getElementById('recipe-type');
            const cuisineSelect = document.getElementById('cuisine');
            mainIngredientSelect.addEventListener('change', fetchAndDisplayRecipes);
            recipeTypeSelect.addEventListener('change', fetchAndDisplayRecipes);
            cuisineSelect.addEventListener('change', fetchAndDisplayRecipes);

            await getAllRecipes()
            // await fetchAndDisplayRecipes();

        })
        async function getAllRecipes() {
            try {
                const allRecipes = await axios.get(`${api_url}/api/allrecipes`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                const username = document.querySelector('#username')
                username.textContent = `Hello ${allRecipes.data.user.name}`
                const admin = document.querySelector('#admin')
                if (allRecipes.data.user.isAdmin === true) {
                    admin.classList.remove("hidden")
                }
                displayRecipes(allRecipes.data.recipes, false)
            } catch (err) {
                console.log("error getting all recipes: ", err);

            }
        }

        async function fetchAndDisplayRecipes() {
            const mainIngredient = document.getElementById('main-ingredients').value;
            const recipeType = document.getElementById('recipe-type').value;
            const cuisine = document.getElementById('cuisine').value;
            try {
                let query = "";
                if (mainIngredient !== "Please Select") {
                    query += `ingredients=${mainIngredient}&`;
                }
                if (recipeType !== "Please Select") {
                    query += `type=${recipeType}&`;
                }
                if (cuisine !== "pleaseSelect") {
                    query += `cuisine=${cuisine}`;
                }
                const response = await axios.get(`${api_url}/recipes?${query}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const recipes = response.data.matchedRecipe;
                displayRecipes(recipes, false)
            } catch (err) { }
        }
    }
    async function displayRecipes(allrecipes, showEditDelete) {
        const recipesDiv = document.querySelector('#recipes');
        recipesDiv.innerHTML = ""; // Clear any existing content

        allrecipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = "border border-gray-300 rounded-lg shadow-md p-4 m-4 max-w-sm h-fit";
            recipeCard.id = recipe.id

            if (recipe.isDeleted) {
                const message = document.createElement('p')
                message.textContent = "This recipe was removed by admin for safety reasons.";
                message.className = "text-red-600 text-center font-semibold"
                recipeCard.appendChild(message)
                recipesDiv.appendChild(recipeCard)
                return
            }
            const recipeImg = document.createElement('img');
            if (recipe.recipeImg) {
                recipeImg.src = recipe.recipeImg[0];
                recipeImg.alt = recipe.name;
            } else {
                recipeImg.src = "/default-image.jpg"; // Put a default image in your public folder
                recipeImg.alt = "No image available";
            }
            recipeImg.className = "w-full h-45 object-cover rounded-md mb-3";

            const recipeName = document.createElement('h2');
            recipeName.textContent = recipe.name;
            recipeName.className = "text-xl font-bold text-red-700 mb-1";

            const authorName = document.createElement('p');
            authorName.textContent = `By: ${recipe.username}`
            authorName.className = "text-small font-bold text-black mb-1";

            const avgRating = recipe.avgRating
            const recipeRating = document.createElement('div')
            recipeRating.innerHTML = ""
            recipeRating.className = "flex space-x-1 mb-2"
            if (avgRating === "0.00") {
                recipeRating.innerHTML = `<p class="font-thin">No ratings available</p>`
            } else {
                for (let i = 1; i <= 5; i++) {
                    const star = document.createElement('i');
                    if (avgRating >= i) {
                        star.classList.add('fa', 'fa-star', 'text-yellow-400'); // full star
                    } else if (avgRating >= i - 0.5) {
                        star.classList.add('fa', 'fa-star-half-alt', 'text-yellow-400'); // half star
                    } else {
                        star.classList.add('fa', 'fa-star-o', 'text-gray-400'); // empty star
                    }
                    recipeRating.appendChild(star)
                }
            }
            const recipeDesc = document.createElement('p');
            recipeDesc.textContent = recipe.description || "No description provided.";
            recipeDesc.className = "text-gray-700 mb-2 line-clamp-4";

            const readMore = document.createElement('a');
            readMore.href = `/recipes/${recipe.id}`; // You can link this to a detailed page if needed
            readMore.textContent = "Read more";
            readMore.className = "text-red-600 font-semibold hover:underline flex";
            const editDelete = document.createElement('div')
            if (showEditDelete) {
                const delBtn = document.createElement('button')
                delBtn.id = "del-btn"
                delBtn.classList.add('fa-solid', 'fa-trash')
                const editBtn = document.createElement('button')
                editBtn.id = 'edit-btn'
                editBtn.classList.add('fa-solid', 'fa-pen', 'p-3', 'm-3')
                editDelete.appendChild(delBtn)
                editDelete.appendChild(editBtn)
            }
            recipeCard.appendChild(recipeImg);
            recipeCard.appendChild(recipeName);
            recipeCard.appendChild(authorName)
            recipeCard.appendChild(recipeRating)
            recipeCard.appendChild(recipeDesc);
            recipeCard.appendChild(readMore);
            recipeCard.appendChild(editDelete)
            recipesDiv.appendChild(recipeCard);
        });
    }


    if (myRecipes) {
        console.log("entering my recipes page");
        const token = localStorage.getItem("token")
        const recipesDiv = document.querySelector('#recipes');

        window.addEventListener("DOMContentLoaded", async () => {
            await getMyRecipes()
        })
        async function getMyRecipes() {
            try {
                const myRecipes = await axios.get(`${api_url}/api/myrecipes`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                displayRecipes(myRecipes.data.myrecipes, true)
            } catch (err) {
                console.log("error getting all recipes: ", err);

            }
        }
        recipesDiv.addEventListener('click', async (e) => {
            if (e.target && e.target.id === 'del-btn') {

                const recipeCard = e.target.closest('div[id]')

                let recipeId = parseInt(recipeCard.id)
                const confirmDelete = confirm("Are you sure you want to delete this recipe?");
                if (!confirmDelete) return
                const deleteRecipe = await axios.delete(`${api_url}/api/delete-recipe/${recipeId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                recipesDiv.removeChild(recipeCard)
                console.log("deleteRecipe: ", deleteRecipe);

            }
            if (e.target && e.target.id === 'edit-btn') {
                const recipeCard = e.target.closest('div[id]')
                recipeId = parseInt(recipeCard.id)
                window.location.href = `/share-recipe?id=${recipeId}`
            }

        })
    }

    if (selectedRecipePage) {
        const token = localStorage.getItem("token")
        
        const comment = document.querySelector('#comment')
        
        window.addEventListener("DOMContentLoaded", async () => {
            await getSelectedRecipe()
            await startWebSocket(token)
        })

        async function getSelectedRecipe() {
            try {
                const pathParts = window.location.pathname.split('/')
                const recipeId = pathParts[pathParts.length - 1]
                const getRecipe = await axios.get(`${api_url}/api/recipes/${recipeId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                console.log("get recipe: ", getRecipe);
                await displayRecipe(getRecipe.data.recipe, getRecipe.data.collections, pathParts, getRecipe.data.isCreator, getRecipe.data.existingRating)
            } catch (err) {
                console.log("Error fetching recipe: ", err);

            }
        }
      
    }

    if (authorsPage) {
        const token = localStorage.getItem("token")
        window.addEventListener("DOMContentLoaded", async () => {
            await getAuthors()
        })

        async function getAuthors() {
            try {
                const getAuthors = await axios.get(`${api_url}/api/authors`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                console.log("all Authors: ", getAuthors);
                await displayAuthors(getAuthors.data.allAuthors, getAuthors.data.following)
            } catch (err) {
                console.log("error getting all authors ", err);

            }
        }


        async function displayAuthors(allauthors, following) {
            const authorList = document.querySelector('#authorsList')
            authorList.innerHTML = ""
            const followingIds = following.map(f => f.followingId);
            allauthors.forEach(author => {

                const authorDiv = document.createElement('div')
                authorDiv.className = "border border-gray-300 rounded-lg shadow-md p-4 m-4 max-w-sm relative";
                authorDiv.id = `${author.id}`
                if (author.isBanned) {
                    const message = document.createElement('p')
                    message.textContent = "This user has been banned by admin for safety reasons.";
                    message.className = "text-red-600 text-center font-semibold"
                    authorDiv.appendChild(message)
                    authorList.appendChild(authorDiv)
                    return
                }
                const authorImg = document.createElement('img')
                authorImg.id = "authorImg"
                authorImg.src = "/userdefaultProfile.jpg"
                authorImg.alt = author.name
                authorImg.className = "w-full h-45 object-cover rounded-md mb-3";
                authorDiv.appendChild(authorImg)
                const authorRef = document.createElement('a')
                authorRef.href = `/author/${author.id}`
                authorRef.textContent = `${author.name}`
                authorRef.className = "text-red-600 font-semibold hover:underline";
                const followbutton = document.createElement('button')
                followbutton.type = "button"
                followbutton.className = "follow absolute bottom-2 right-3 bg-black text-white rounded-md p-1 font-bold"
                if (followingIds.includes(author.id)) {
                    followbutton.textContent = "Following"
                    followbutton.disabled = true;
                } else {
                    followbutton.textContent = "Follow"
                }
                authorDiv.appendChild(authorRef)
                authorDiv.appendChild(followbutton)
                authorList.appendChild(authorDiv)

            })
            authorList.addEventListener('click', async (e) => {
                try {
                    if (e.target.tagName === "BUTTON") {
                        e.target.textContent = "Following"
                        let closestDiv = e.target.closest("div[id]")
                        let followingId = closestDiv.id
                        let followingName = closestDiv.querySelector('a').textContent.trim()
                        console.log("id:", followingId);
                        const userfollowed = {
                            followingId,
                            followingName
                        }
                        const followUser = await axios.post(`${api_url}/api/follow-user`, userfollowed, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        })
                        console.log("followUser: ", followUser);
                    }
                } catch (err) {
                    console.log("error following user: ", err);

                }
            })
        }
    }

    if (author) {
        const token = localStorage.getItem("token")
        const authorRecipes = document.querySelector('#recipes')
        window.addEventListener('DOMContentLoaded', async () => {
            await getAuthorRecipes()
        })

        async function getAuthorRecipes() {
            try {
                const pathParts = window.location.pathname.split('/')
                const authorId = pathParts[pathParts.length - 1]
                const getrecipes = await axios.get(`${api_url}/api/author-recipes/${authorId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                console.log("author recipes: ", getrecipes);
                await displayRecipes(getrecipes.data.recipes, false)
            } catch (err) {
                console.log("Error fetching author recipes: ", err);

            }
        }
    }

    if (activityFeedPg) {
        const token = localStorage.getItem("token")
        window.addEventListener('DOMContentLoaded', async () => {
            const mainIngredientSelect = document.getElementById('main-ingredients');
            const recipeTypeSelect = document.getElementById('recipe-type');
            const cuisineSelect = document.getElementById('cuisine');
            mainIngredientSelect.addEventListener('change', fetchAndDisplayRecipes);
            recipeTypeSelect.addEventListener('change', fetchAndDisplayRecipes);
            cuisineSelect.addEventListener('change', fetchAndDisplayRecipes);

            await getFollwerRecipes()
        })

        async function getFollwerRecipes() {
            try {
                const getFollowerRecipes = await axios.get(`${api_url}/api/follower-recipes`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                console.log("follower recipes: ", getFollowerRecipes);
                displayRecipes(getFollowerRecipes.data.recipes, false)
            } catch (err) {
                console.log("error getting follower recipes: ", err);

            }
        }

        async function fetchAndDisplayRecipes() {
            const mainIngredient = document.getElementById('main-ingredients').value;
            const recipeType = document.getElementById('recipe-type').value;
            const cuisine = document.getElementById('cuisine').value;
            try {
                let query = "";
                if (mainIngredient !== "Please Select") {
                    query += `ingredients=${mainIngredient}&`;
                }
                if (recipeType !== "Please Select") {
                    query += `type=${recipeType}&`;
                }
                if (cuisine !== "pleaseSelect") {
                    query += `cuisine=${cuisine}&`;
                }
                query += `feed=yes`
                const response = await axios.get(`${api_url}/recipes?${query}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const recipes = response.data.matchedRecipe;
                displayRecipes(recipes, false)
            } catch (err) { }
        }


    }
}
