let apiUrl = "http://localhost:5000"
let token=localStorage.getItem('token')
const adminPage=document.querySelector('#adminPage')
const totalUsers = document.querySelector('#usersCount')
const totalRecipes = document.querySelector('#recipesCount')
const allrecipes = document.querySelector('#recipes')
const selectedRecipe = document.querySelector('#selected-recipe')

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

    async function getAllRecipes() {
        try {
            const allRecipes = await axios.get(`${apiUrl}/api/allrecipes`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log("all recipes: ", allRecipes);
            displayRecipes(allRecipes.data.recipes)
        } catch (err) {
            console.log("error getting all recipes: ", err);
        }
    }

    async function displayRecipes(allrecipes) {
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
                recipeImg.src = "default-image.jpg"; // Put a default image in your public folder
                recipeImg.alt = "No image available";
            }
            recipeImg.className = "w-full h-45 object-cover rounded-md mb-3";

            const recipeName = document.createElement('h2');
            recipeName.textContent = recipe.name;
            recipeName.className = "text-xl font-bold text-red-700 mb-1";

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
            readMore.href = `admin/recipes/${recipe.id}`;
            readMore.textContent = "Read more";
            readMore.className = "text-red-600 font-semibold hover:underline flex";
            const editDelete = document.createElement('div')
            // editDelete.id = "delete-recipe"
            const delBtn = document.createElement('button')
            delBtn.id = "del-btn"
            delBtn.classList.add('fa-solid', 'fa-trash')
            editDelete.appendChild(delBtn)
            recipeCard.appendChild(recipeImg);
            recipeCard.appendChild(recipeName);
            recipeCard.appendChild(recipeRating)
            recipeCard.appendChild(recipeDesc);
            recipeCard.appendChild(readMore);
            recipeCard.appendChild(editDelete)
            recipesDiv.appendChild(recipeCard);
        });
    }   
        let recipeId=null
        const recipesDiv = document.querySelector('#recipes');
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
            })
                let reasonForm = document.querySelector('#reason-form')
                reasonForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const deleteRecipe = {
                        reason: e.target.reason.value.trim(),
                        recipeId:recipeId
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
                        'Authorization':`Bearer ${token}`
                        },
                        data: {
                            recipe:deleteRecipe
                        }
                })
                })
            }
        // })
    


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
                let navbar=document.getElementsByTagName('nav')[0]
                let navlinks = document.querySelectorAll('nav a')
                navlinks.forEach((link) => {
                    link.remove()
                })
                let navlink = document.createElement('a')
                navlink.href = '/admin'
                navlink.textContent = "Home"
                navlink.className = "text-white underline p-3"
                navbar.appendChild(navlink)
            }
        } catch (err) {
            console.log("error rendering recipe: ",err);
            
        }
    }
}