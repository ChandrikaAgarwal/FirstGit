const shareRecipePage=document.querySelector('#share-recipe')
const recipeForm = document.querySelector('#shareRecipe-form')
const api_url ="http://localhost:5000"
if (shareRecipePage) {
    const token=localStorage.getItem("token")
    recipeForm.addEventListener("submit", async (e) => {
        try {
            e.preventDefault()
            const formData=new FormData()
            formData.append("name", e.target.recipeName.value);
            formData.append("description", e.target.recipeDescription.value);
            formData.append("ingredients", e.target.recipeIngredients.value);
            formData.append("method", e.target.recipeMethod.value);
            formData.append("cuisine", e.target.cuisine.value);
            formData.append("category", e.target["cuisine-category"].value);
            formData.append("cookingTime", e.target["cooking-time"].value);
            formData.append("marinationTime", e.target["marination-time"].value);
            formData.append("serves", e.target.serves.value);
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
            
            
        } catch (error) { 
            console.log("Error posting a recipe: ", error);
            
        }
    })
}