let apiUrl = "http://13.203.229.232"
let token=localStorage.getItem('token')
const adminPage=document.querySelector('#adminPage')
const totalUsers = document.querySelector('#usersCount')
const totalRecipes = document.querySelector('#recipesCount')
const allrecipes = document.querySelector('#recipes')
const selectedRecipe = document.querySelector('#selected-recipe')
const authorspage = document.querySelector('#authorsPage')
const authorpage = document.querySelector('#author')
const editAdminCredsPage = document.querySelector('#adminCredsPage')
const pathParts = window.location.pathname.split('/')
if (pathParts.includes('admin')) {

    if (adminPage) {
        window.addEventListener('DOMContentLoaded', async () => {
            await countUsersAndRecipes()
            await getAllRecipes()
        })
        async function countUsersAndRecipes() {
            try {
                let users_recipes = await axios.get(`${apiUrl}/api/users-recipes`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                console.log("users_recipes: ", users_recipes);
                totalUsers.textContent = `${users_recipes.data.totalUsers}`
                totalRecipes.textContent = `${users_recipes.data.totalRecipes}`
            
            } catch (err) {
                console.log("error getting all users and recipes: ", err);
            
            }
        }

        if (editAdminCredsPage) {
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
                    console.log("admin credentials: ", setAdminCreds);
                    // alert(setAdminCreds.data.message)
                    window.location.href='/users'
                })
            } catch (err) {
                console.log("error creating admin credentials: ", err);

            }
        }
        async function getAllRecipes() {
            try {
                const allRecipes = await axios.get(`${apiUrl}/admin/allrecipes`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                console.log("all recipes: ", allRecipes);
                const username = document.querySelector('.hello-admin')
                username.textContent = `Hello ${allRecipes.data.user.name}`
                displayRecipes(allRecipes.data.recipes)
            } catch (err) {
                console.log("error getting all recipes: ", err);
            }
        }
    }
    async function displayRecipes(allrecipes) {
        console.log("entering display recipes for admin page");
        const pathParts = window.location.pathname.split('/')
       
        const recipesDiv = document.querySelector('#recipes');
        recipesDiv.innerHTML = ""; // Clear any existing content

        allrecipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = "border border-gray-300 rounded-lg shadow-md p-4 m-4 max-w-sm";
            recipeCard.id = recipe.id
            if (recipe.isDeleted) {
                const message = document.createElement('p')
                message.textContent = "This recipe was removed by you for safety reasons.";
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
            recipeDesc.className = "text-gray-700 mb-2";

            const readMore = document.createElement('a');
            
            readMore.href = `/admin/recipes/${recipe.id}`;
            readMore.textContent = "Read more";
            readMore.className = "text-red-600 font-semibold hover:underline flex";
            const editDelete = document.createElement('div')
            // editDelete.id = "delete-recipe"
            if (pathParts.includes('admin')) {
                const delBtn = document.createElement('button')
                delBtn.id = "del-btn"
                delBtn.classList.add('fa-solid', 'fa-trash')
                editDelete.appendChild(delBtn)
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
    
        let recipeId = null
        // const recipesDiv = document.querySelector('#recipes');
        recipesDiv.addEventListener('click', async (e) => {
            if (e.target && e.target.id === 'del-btn') {
                console.log("Delete button clicked");
                const recipeCard = e.target.closest('div[id]')
                console.log("recipe: ", recipeCard);
                recipeId = parseInt(recipeCard.id)
                console.log("recipe to be deleted: ", recipeId);
                let reasonDiv = document.querySelector('#reasonDiv')
                reasonDiv.classList.remove('hidden')
                reasonDiv.classList.add('flex')
            }
        
        let reasonForm = document.querySelector('#reason-form')
        reasonForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const deleteRecipe = {
                reason: e.target.reason.value.trim(),
                recipeId: recipeId
            }
            const confirmDelete = confirm("Are you sure you want to delete this recipe?");
            if (!confirmDelete) {
                reasonDiv.classList.add('hidden')
                return
            } else {
                        
                reasonDiv.classList.add('hidden')
            }
            reasonForm.reset()
            console.log("delete recipe: ", deleteRecipe);
            let deletedRecipe = await axios.delete(`${apiUrl}/admin/delete-recipe`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                data: {
                    recipe: deleteRecipe
                }
            })
        })
        })
    }   


    if (selectedRecipe) {
        window.addEventListener('DOMContentLoaded', async () => {
            await recipe()
        })
    
        async function recipe() {
            try {
                const pathParts = window.location.pathname.split('/')
                const ifAdmin = pathParts[pathParts.length - 3]
                console.log(ifAdmin);
                if (ifAdmin === 'admin') {
                    let userReviews = document.querySelector('#userReviews')
                    console.log("userReviews: ", userReviews);
                    userReviews.style.display = 'none'
                    let collections = document.querySelector('.selectCollection')
                    console.log(collections);
                    let rating = document.querySelector('#rating-value')
                    rating.style.display = 'none'
                    let navbar = document.getElementsByTagName('nav')[0]
                    let navlinks = document.querySelectorAll('nav a')
                    navlinks.forEach((link) => {
                        link.remove()
                    })
                    let navlink = document.createElement('a')
                    navlink.href = '/admin'
                    navlink.textContent = "Home"
                    navlink.className = "text-white underline p-3"
                    navbar.appendChild(navlink)
                    let manageusers = document.createElement('a')
                    manageusers.href = '/admin/allusers'
                    manageusers.textContent = "Manage users"
                    manageusers.className = "text-white underline p-3"
                    navbar.appendChild(manageusers)
                }
            } catch (err) {
                console.log("error rendering recipe: ", err);
            
            }
        }
    }

    if (authorspage) {
        const token = localStorage.getItem("token")
        window.addEventListener("DOMContentLoaded", async () => {
            const pathParts = window.location.pathname.split('/')
            const ifAdmin = pathParts[pathParts.length - 2]
            console.log(ifAdmin);
            if (ifAdmin === 'admin') {
                let navbar = document.querySelector('.navbar')
                navbar.innerHTML = ""
                let navlink = document.createElement('a')
                navlink.href = '/admin'
                navlink.textContent = "Home"
                navlink.className = "text-white underline p-3"
                navbar.appendChild(navlink)
            }
            await getAuthors()
        })

        async function getAuthors() {
            try {
                const getAuthors = await axios.get(`${api_url}/admin/authors`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                console.log("all Authors: ", getAuthors);
                await displayAuthors(getAuthors.data.allAuthors)
            } catch (err) {
                console.log("error getting all authors ", err);

            }
        }


        async function displayAuthors(allauthors) {
            const authorList = document.querySelector('#authorsList')
            authorList.innerHTML = ""
            allauthors.forEach(author => {
                const authorDiv = document.createElement('div')
                authorDiv.className = "border border-gray-300 rounded-lg shadow-md p-4 m-4 max-w-md relative";
                authorDiv.id = `${author.id}`
                const buttonWrapper = document.createElement('div')
                buttonWrapper.className ="absolute top-2 right-2 z-10"
                const actionbtn = document.createElement('button')
                actionbtn.className = "absolute top-2 right-2 text-gray-600 hover:text-black p-2 z-10"
                actionbtn.innerHTML = `<i class="fa-solid fa-ellipsis-vertical"></i>`
                buttonWrapper.appendChild(actionbtn)
                const dropdown = document.createElement('div')
                dropdown.className ="admin-controls hidden flex flex-col bg-white border border-gray-300 rounded shadow-md mt-2"
                dropdown.innerHTML =`<button class="make-admin px-4 py-2 hover:bg-gray-100 text-left">Make Admin</button>
    <button class="ban-author px-4 py-2 hover:bg-gray-100 text-left">Ban Author</button>
    <button class="remove-author px-4 py-2 hover:bg-gray-100 text-left text-red-600">Remove Author</button>`
                buttonWrapper.appendChild(dropdown)
                authorDiv.appendChild(buttonWrapper)
                document.addEventListener('click', () => {
                    dropdown.classList.add('hidden');
                });
                const authorImg = document.createElement('img')
                authorImg.id = "authorImg"
                authorImg.src = "/userdefaultProfile.jpg"
                authorImg.alt = author.name
                authorImg.className = "w-full h-45 object-cover rounded-md mb-3";
                authorDiv.appendChild(authorImg)
                const authorRef = document.createElement('a')
                authorRef.href = `author/${author.id}`
                authorRef.textContent = `${author.name}`
                authorRef.className = "text-red-600 font-semibold hover:underline";              
                authorDiv.appendChild(authorRef)
                authorList.appendChild(authorDiv)
                actionbtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // prevent bubbling
                    dropdown.classList.toggle('hidden');
                });
            })
            //event-delegation
            authorList.addEventListener('click', async (e) => {
                try {
                    if (e.target.tagName === 'BUTTON') {
                        let control = e.target.className.split(' ')[0]
                        console.log("control: ", control.trim());
                        let userid = e.target.closest("div[id]").id
                        // console.log("userId: ", userid);
                        let reasonDiv = document.querySelector('#reasonDiv')
                        let oldReasonForm = document.querySelector('#reason-form')
                        let actionDetails
                        if (control === 'ban-author' || control === 'remove-author') {
                            reasonDiv.classList.remove('hidden')
                            reasonDiv.classList.add('flex')
                        
                            // Clone and replace the form to remove old event listeners
                            const newReasonForm = oldReasonForm.cloneNode(true);
                            oldReasonForm.parentNode.replaceChild(newReasonForm, oldReasonForm);

                            newReasonForm.addEventListener('submit', async (e) => {
                                e.preventDefault();
                                let reason = e.target.reason.value.trim()
                                const confirmAction = confirm("Are you sure you want to take this action?");
                                if (!confirmAction) {
                                    reasonDiv.classList.add('hidden')
                                    return
                                }

                                actionDetails = {
                                    reason,
                                    control,
                                    userid
                                }
                                reasonDiv.classList.add('hidden');
                                e.target.reset();
                                const actionTaken = await axios.post(`${apiUrl}/api/action`, actionDetails, {
                                    headers: {
                                        'Authorization': `Bearer ${token}`
                                    }
                                })
                                console.log("action taken: ", actionTaken);
                            
                            })
                        } else {
                            const confirmAction = confirm("Are you sure you want to take this action?");
                            if (!confirmAction) {
                                reasonDiv.classList.add('hidden')
                                return
                            }
                            actionDetails = {
                                control,
                                userid
                            }
                            await axios.post(`${apiUrl}/api/action`, actionDetails, {
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });
                        }
                    }
                } catch (err) {
                    console.log("Error in taking action: ", err);
                    if (err.response && err.response.data.message) {
                        alert(err.response.data.message)
                    }
                    
                }
            })          
        }           
    }

    if (authorpage) {
        const token = localStorage.getItem("token")
        console.log("author page");
        let ifAdmin;
        window.addEventListener("DOMContentLoaded", async () => {
            const pathParts = window.location.pathname.split('/')
            ifAdmin = pathParts[pathParts.length - 3]
            console.log(ifAdmin);
        
            await getAuthorRecipes()
        })
        async function getAuthorRecipes() {
            if (ifAdmin === 'admin') {
                let navbar = document.querySelector('.navbar')
                navbar.innerHTML = ""
                let navlink = document.createElement('a')
                navlink.href = '/admin'
                navlink.textContent = "Home"
                navlink.className = "text-white underline p-3"
                navbar.appendChild(navlink)
                let manageusers = document.createElement('a')
                manageusers.href = '/admin/allusers'
                manageusers.textContent = "Manage Users"
                manageusers.className = "text-white underline p-3"
                navbar.appendChild(manageusers)
        
                try {
                    const pathParts = window.location.pathname.split('/')
                    const authorId = pathParts[pathParts.length - 1]
                    const getrecipes = await axios.get(`${api_url}/api/author-recipes/${authorId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    console.log("author recipes: ", getrecipes);
                    await displayRecipes(getrecipes.data.recipes)
                } catch (err) {
                    console.log("Error fetching author recipes: ", err);

                }
            }
        }
    }
} 