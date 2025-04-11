const signupForm = document.querySelector('#signup-form')
const loginForm = document.querySelector('#login-form')
const createProfBtn = document.querySelector('.create-profBtn')
const loginBtn = document.querySelector('.loginBtn')
const editProfilePage = document.querySelector('#edit-profilePage')
const editprofForm = document.querySelector('#editProfile-form')
const homePage = document.querySelector("#homePage")
const myRecipes = document.querySelector("#myRecipes")
const selectedRecipePage = document.querySelector("#selected-recipe")
const authorsPage = document.querySelector('#authorsPage')
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
            alert("Login successful!!!")
            loginForm.reset()
            window.location.href = "/home"
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

if (editProfilePage) {
    const token=localStorage.getItem("token")
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
            window.location.href='/home'
        } catch (err) {
            console.log("error editing profile: ",err);
            
        }
    })
}

if (homePage) {
    const token = localStorage.getItem("token")
    
    window.addEventListener("DOMContentLoaded", async() => {
        await getAllRecipes()
    })
    async function getAllRecipes() {
        try {
           const allRecipes = await axios.get(`${api_url}/api/allrecipes`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log("all recipes: ", allRecipes);
            displayRecipes(allRecipes.data.recipes)
        } catch (err) {
            console.log("error getting all recipes: ",err);
            
        }
    }
    async function displayRecipes(allrecipes) {
        const recipesDiv = document.querySelector('#recipes');
        recipesDiv.innerHTML = ""; // Clear any existing content

        allrecipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = "border border-gray-300 rounded-lg shadow-md p-4 m-4 max-w-sm";

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

            const recipeDesc = document.createElement('p');
            recipeDesc.textContent = recipe.description || "No description provided.";
            recipeDesc.className = "text-gray-700 mb-2";

            const readMore = document.createElement('a');
            readMore.href = `/recipes/${recipe.id}`; // You can link this to a detailed page if needed
            readMore.textContent = "Read more";
            readMore.className = "text-red-600 font-semibold hover:underline";

            recipeCard.appendChild(recipeImg);
            recipeCard.appendChild(recipeName);
            recipeCard.appendChild(recipeDesc);
            recipeCard.appendChild(readMore);

            recipesDiv.appendChild(recipeCard);
        });
    }
}

if (myRecipes) {
    console.log("entering my recipes page");
    const token = localStorage.getItem("token")
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
            console.log("all recipes: ", myRecipes);
        } catch (err) {
            console.log("error getting all recipes: ", err);

        }
    }
}

if (selectedRecipePage) {
    const token = localStorage.getItem("token")
    window.addEventListener("DOMContentLoaded", async () => {
        await getSelectedRecipe()
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
            await displayRecipe(getRecipe.data.recipe)
        } catch (err) {
            console.log("Error fetching recipe: ", err);
            
        }
    }
    async function displayRecipe(recipe) {
        const recipeDetailsDiv = document.querySelector("#recipeDetails")
        const mainIngredArray = JSON.parse(recipe.mainingrediant);
        const mainIngred = mainIngredArray.join(", ")
        const recipeType = JSON.parse(recipe.recipetype)
        const type = recipeType.join(", ")

        const namep = document.createElement('p')
        namep.textContent = recipe.name
        namep.className = "text-red-600 font-bold"
        recipeDetailsDiv.appendChild(namep)

        const postedby = document.createElement('p')
        const postDate = new Date(recipe.createdAt).toLocaleDateString()
        postedby.innerHTML = `Posted by&nbsp;&nbsp;&nbsp;&nbsp;${recipe.userId}&nbsp;&nbsp;&nbsp;&nbsp;${postDate}`
        postedby.className = "my-12"
        recipeDetailsDiv.appendChild(postedby)

        const imgContainer = document.createElement("div");
        imgContainer.className = "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4";
        if (recipe.recipeImg.length > 0) {
            recipe.recipeImg.forEach((imgurl) => {
                const imgElement = document.createElement("img")
                imgElement.src = imgurl
                imgElement.alt = recipe.name
                imgElement.className = "w-full h-48 object-cover rounded-lg";
                imgContainer.appendChild(imgElement);
                
            })
        } else {
            imgElement.src = "default-image.jpg"; // Put a default image in your public folder
            imgElement.alt = "No image available";
            imgElement.className = "w-full h-48 object-cover rounded-lg";
            imgContainer.appendChild(imgElement);
        }
        recipeDetailsDiv.appendChild(imgContainer)

        const detailDiv = document.createElement('div')
        detailDiv.className = "grid grid-cols-1 sm:grid-cols-2 gap-4 my-4";

        const leftDetails = document.createElement("div");
        leftDetails.innerHTML = `
  <p><span class="font-bold text-red-900">Cuisine :</span> <span class="text-purple-700">${recipe.cuisine}</p>
  <p><span class="font-bold text-red-900">Main Ingredient :</span> <span class="text-purple-700">${mainIngred}</span></p>
`;
        const rightDetails = document.createElement("div");
        rightDetails.innerHTML = `
  <p><span class="font-bold text-red-900">Category :</span> <span class="text-purple-700">${recipe.category}</span></p>
  <p><span class="font-bold text-red-900">Recipe Type :</span> <span class="text-purple-700">${type}</span></p>
`;
        detailDiv.appendChild(leftDetails)
        detailDiv.appendChild(rightDetails)
        recipeDetailsDiv.appendChild(detailDiv)

        const ingredientsList = document.createElement('ul')
        ingredientsList.className = "list-disc pl-5 text-gray-700 pb-10"; 
        const ingredientsArray = recipe.ingredients.split(/\r?\n/); // split on both \r\n and \n
        ingredientsArray.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item.trim(); // trim to remove any leading/trailing space
            ingredientsList.appendChild(li);
        });
        const ingredientsTitle = document.createElement('p');
        ingredientsTitle.innerHTML = `<span class="font-bold text-red-900 my-24">Ingredients :</span>`;
        recipeDetailsDiv.appendChild(ingredientsTitle);
        recipeDetailsDiv.appendChild(ingredientsList);

        const methodList = document.createElement('ul')
        methodList.className = "list-disc pl-5 text-gray-700";
        const methodArray = recipe.method.split(/\r?\n/).filter(item=>item.trim() !=="");
        methodArray.forEach((item) => {
            const li = document.createElement('li');
            li.textContent = item.trim();
            methodList.appendChild(li);
        })
        const methodTitle=document.createElement('p')
        methodTitle.innerHTML = `<span class="font-bold text-red-900 my-24">Method :</span>`;
        recipeDetailsDiv.appendChild(methodTitle);
        recipeDetailsDiv.appendChild(methodList);
    }
}

if (authorsPage) {
    
}