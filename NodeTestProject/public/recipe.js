const shareRecipePage=document.querySelector('#share-recipe')
const recipeForm = document.querySelector('#shareRecipe-form')
const newColletionPage = document.querySelector('#createCollection')
const mycollections=document.querySelector("#mycollections")
const api_url ="http://localhost:5000"
const token=localStorage.getItem("token")
if (shareRecipePage) {
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
            console.log("mainIngredients: ",formData.get("mainingrediant"));
            
            const recipeType = Array.from(document.querySelector("#recipe-type").selectedOptions).map(opt => opt.value);
            formData.append("recipetype", JSON.stringify(recipeType));
            const files = document.getElementById("fileInput").files;
            for (let i = 0; i < files.length; i++) {
                formData.append("files", files[i]); // append each file
            }
            const newRecipe = await axios.post(`${api_url}/share-recipe`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization':`Bearer: ${token}`
                }
            })
            console.log("recipe submitted: ", newRecipe);
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
            const allUsers = await axios.get(`${api_url}/api/authors`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log("all users: ", allUsers);
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
            
            let users = allUsers.data.allAuthors
            users.forEach((user) => {
                dropDownMenu.innerHTML += `<label class="flex items-center px-4 py-2 hover:bg-gray-100"><input type="checkbox" value="${user.name}" data-id="${user.id}" class="mr-2">${user.name}</label>`
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
                
            } catch (err) {
                console.log("error getting all recipes in colletion ",err);
                
            }
        })
    }
}