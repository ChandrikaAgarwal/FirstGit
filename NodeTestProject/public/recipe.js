const shareRecipePage=document.querySelector('#share-recipe')

const newColletionPage = document.querySelector('#createCollection')
const mycollections=document.querySelector("#mycollections")
const api_url ="http://localhost:3000"
const token=localStorage.getItem("token")
if (shareRecipePage) {
    const recipeForm = document.querySelector('#shareRecipe-form')
    let recipeId
    window.addEventListener('DOMContentLoaded', async () => {
        const urlParams = new URLSearchParams(window.location.search)
        recipeId = urlParams.get('id')
        console.log("recipe ID: ",recipeId);
        if (recipeId) {
            const response = await axios.get(`${api_url}/api/getedit-recipe/${recipeId}`, {
                headers: {
                    'Authorization': `Bearer: ${token}`
                }
            })
            const recipe = response.data.recipe;
            console.log("Fetched recipe: ", recipe);
            document.querySelector("#recipeName").value = recipe.name || "";
            document.querySelector("#recipeDescription").value = recipe.description || "";
            document.querySelector("#recipeIngredients").value = recipe.ingredients || "";
            document.querySelector("#recipeMethod").value = recipe.method || "";
            document.querySelector("#cuisine").value = recipe.cuisine || "";
            document.querySelector("#cuisine-category").value = recipe.category || "";
            document.querySelector("#cooking-time").value = recipe.cookingTime || "";
            document.querySelector("#marination-time").value = recipe.marinationTime || "";
            document.querySelector("#serves").value = recipe.serves || "";
        }
    })
    
    recipeForm.addEventListener("submit", async (e) => {
        try {
            e.preventDefault()
            const formData=new FormData()
            formData.append("name", e.target.recipeName.value.trim());
            formData.append("description", e.target.recipeDescription.value.trim());
            formData.append("ingredients", e.target.recipeIngredients.value.trim());
            formData.append("method", e.target.recipeMethod.value.trim());
            formData.append("cuisine", e.target.cuisine.value.trim());
            formData.append("category", e.target["cuisine-category"].value.trim());
            formData.append("cookingTime", e.target["cooking-time"].value.trim());
            formData.append("marinationTime", e.target["marination-time"].value.trim());
            formData.append("serves", e.target.serves.value.trim());
            const mainIngredients = Array.from(document.querySelector("#main-ingredients").selectedOptions).map(opt => opt.value);
            formData.append("mainingrediant", JSON.stringify(mainIngredients));
            // console.log("mainIngredients: ",formData.get("mainingrediant"));
            
            const recipeType = Array.from(document.querySelector("#recipe-type").selectedOptions).map(opt => opt.value);
            formData.append("recipetype", JSON.stringify(recipeType));
            const files = document.getElementById("fileInput").files;
            for (let i = 0; i < files.length; i++) {
                formData.append("files", files[i]); // append each file
            }

            //edit recipe
            if (recipeId) {
                        
                const getRec = await axios.put(`${api_url}/api/edit-recipe/${recipeId}`,formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer: ${token}`
                    }
                })
               
            } else {
                            
                const newRecipe = await axios.post(`${api_url}/share-recipe`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer: ${token}`
                    }
                })
            }
            recipeForm.reset()
            
        } catch (error) { 
            console.log("Error posting a recipe: ", error);
            
        }
    })
   
    
}

if (newColletionPage) {
    const dropDownMenu = document.querySelector('#dropdownMenu')
    const toggle = document.getElementById("dropdownToggle");
    let name = document.querySelector('#collectionName')
    let shareCollection = document.querySelector("#shareCollection")
    collectionBtn = document.querySelector("#createCollectionBtn")
    const dropdown = document.querySelector('.multiselect')
    async function getAllUsers() {
        try {
            const allFollowers = await axios.get(`${api_url}/api/followers`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log("all users: ", allFollowers);
            shareCollection.addEventListener('change', () => {
                const shareVal = shareCollection.value
                if (shareVal === "No") {
                    toggle.disabled = true
                    dropDownMenu.classList.add("hidden")
                } else {
                    toggle.disabled = false;
                    dropDownMenu.classList.remove('hidden')
                }
            })
            
            let users = allFollowers.data.followers
            users.forEach((user) => {
                dropDownMenu.innerHTML += `<label class="flex items-center px-4 py-2 hover:bg-gray-100"><input type="checkbox" value="${user.followingName}" data-id="${user.followingId}" class="mr-2">${user.followingName}</label>`
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
                    toggle.textContent = selected.length ? selected : "select options"
                })
            })
            
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

    //create new collection
    collectionBtn.addEventListener("click", async () => {
        console.log("toggle textContent: ", toggle.textContent);
        const selectedUsers = Array.from(document.querySelectorAll("input[type='checkbox']:checked"))
            .map(cb => ({
                id: cb.dataset.id,
                name: cb.value
            }));
        console.log("selectedUsers: ", selectedUsers);
        
        const collectionDetails = {
            cName: name.value,
            share: shareCollection.value,
            members: selectedUsers
        }
        console.log("collectionDetails ", collectionDetails);
        try {
            const createCollectionRes = await axios.post(`${api_url}/api/create-collection`, collectionDetails, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log("new collection: ", createCollectionRes);
        } catch (err) {
            console.log("error creating a new collection: ",err);
            
        }
        })

    window.addEventListener("DOMContentLoaded", async () => {
        await getAllUsers();
        
    })
}

if (mycollections) {
    const chooseCollection = document.querySelector('#choose-collection')
    const filterCollections = document.querySelector("#filter-collections")
    const recipes = document.querySelector("#recipes")
    window.addEventListener("DOMContentLoaded", async () => {
        await getMyCollections();
    })

    async function getMyCollections() {
        try {
            let allmycollections = await axios.get(`${api_url}/api/getmycollections`, {
                headers: {
                    'Authorization':`Bearer ${token}`
                }
            })
            console.log("all my collections: ", allmycollections);
            let collections=allmycollections.data.mycollections
            await displayCollections(collections)
        } catch (err) {
            console.log("error getting all your colections ",err); 
        }
    }

    async function displayCollections(collections) {
        if (collections.length!==0) {
            collections.forEach((c) => {
                const option = document.createElement('option')
                option.value = `${c.collectionId}`
                option.textContent = `${c.collectionName}`
                chooseCollection.appendChild(option)
           })
        } else {
            const nocollection = document.createElement('option')
            nocollection.value = "nocollection"
            nocollection.textContent = "No Collections"
            nocollection.disabled = true
            chooseCollection.appendChild(nocollection)
        }
        filterCollections.addEventListener('change', async (e) => {
            let collectionId = e.target.value
            console.log(collectionId);   
            try {
                let recipesInCollection = await axios.get(`${api_url}/api/getcollectionrecipes/${collectionId}`, {
                    headers: {
                        'Authorization':`Bearer ${token}`
                    }
                })
                console.log("all recipes in collection: ",recipesInCollection);
                console.log(recipesInCollection.data.recipesinCollection[0].recipes);
                await displayRecipes(recipesInCollection.data.recipesinCollection[0].recipes)
            } catch (err) {
                console.log("error getting all recipes in colletion ",err);
                
            }
        })
    }

    async function displayRecipes(allrecipes) {
        const recipesDiv = document.querySelector('#recipes');
        recipesDiv.innerHTML = ""; // Clear any existing content

        allrecipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = "border border-gray-300 rounded-lg shadow-md p-4 m-4 max-w-sm h-fit";

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
            recipeDesc.className = "text-gray-700 mb-2 line-clamp-4";

            const readMore = document.createElement('a');
            readMore.href = `/recipes/${recipe.id}`; // You can link this to a detailed page if needed
            readMore.textContent = "Read more";
            readMore.className = "text-red-600 font-semibold hover:underline";

            recipeCard.appendChild(recipeImg);
            recipeCard.appendChild(recipeName);
            recipeCard.appendChild(recipeRating)
            recipeCard.appendChild(recipeDesc);
            recipeCard.appendChild(readMore);

            recipesDiv.appendChild(recipeCard);
        });
    }
}