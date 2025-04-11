const searchPage=document.querySelector('#searchPage')
const searchForm = document.querySelector("#search-form")
const searchResultsPage = document.querySelector("#searchResults")
const token=localStorage.getItem("token")
const api_url ="http://localhost:5000"
let searchQuery;

if (searchPage) {
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const mainIngrediants = Array.from(document.querySelector('#main-ingredients').selectedOptions).map(opt => opt.value)
        const recipeType = Array.from(document.querySelector("#recipe-type").selectedOptions).map(opt => opt.value);
        const rawQuery = {
            name: e.target.searchname.value.trim(),
            cuisine: e.target.cuisine.value.trim(),
            category: e.target["cuisine-category"].value.trim(),
            ingredients: mainIngrediants.length > 0 ? mainIngrediants : null,  
            type: recipeType.length>0? recipeType:null
        }
        
        searchQuery={}
        for (let key in rawQuery) {
            if (
                rawQuery[key] !== null &&
                rawQuery[key] !== "Please Select" || undefined &&
                !(Array.isArray(rawQuery[key]) && rawQuery[key].length === 0)
            ) {
                searchQuery[key] = rawQuery[key];
            }
        }
        console.log(searchQuery)
        const queryString = new URLSearchParams(searchQuery).toString(); // Convert to query string
        window.location.href=`/search-results/?${queryString}`
     })
}

if (searchResultsPage) {
    const url = new URL(window.location.href);
       
    // Extract the query parameter
    const params = new URLSearchParams(window.location.search)
    console.log("p", params.toString()); //converting query parameter into string
    
    window.addEventListener("DOMContentLoaded", async () => {
        await getSearchResults()
    })
    
    async function getSearchResults() {
        try {
            const getResults = await axios.get(`${api_url}/api/search-results/?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log("search results: ", getResults);
            await displayRecipes(getResults.data.matchedRecipe)
        } catch (err) {
            console.log("error fetching matching recipes: ",err);
            
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
                recipeImg.src = "/default-image.jpg"; // Put a default image in your public folder
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