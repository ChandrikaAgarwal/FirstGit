let api_url = "http://localhost:3000"
const reviewForm = document.querySelector('#review-form')
export async function displayRecipe(recipe, usercollections, path, isCreator,existingRating) {
    
    const recipeDetailsDiv = document.querySelector("#recipeDetails")
    const mainIngredArray = JSON.parse(recipe.mainingrediant);
    const mainIngred = mainIngredArray.join(", ")
    const recipeType = JSON.parse(recipe.recipetype)
    const type = recipeType.join(", ")
    const totalRatings = document.getElementById("totalRatings")
    const avgRatings = document.getElementById("avgRatings")
    const ratingText = document.getElementById('rating-value');
    ratingText.textContent =`You Rated:${existingRating?existingRating.rating:"Nill"}`
    totalRatings.textContent = `Total Ratings:  ${recipe.totalRatings}`
    avgRatings.textContent = `Average Ratings:  ${recipe.avgRating}`
    const namep = document.createElement('p')
    namep.textContent = recipe.name
    namep.className = "text-red-600 font-bold"
    recipeDetailsDiv.appendChild(namep)
    if (isCreator) {
        reviewForm.classList.add('hidden')
        document.querySelector('.review-label').classList.add('hidden')
    }
    const postedby = document.createElement('p')
    const postDate = new Date(recipe.createdAt).toLocaleDateString()
    postedby.innerHTML = `Posted by&nbsp;&nbsp;&nbsp;&nbsp;${recipe.username}&nbsp;&nbsp;&nbsp;&nbsp;${postDate}`
    postedby.className = "my-12"
    recipeDetailsDiv.appendChild(postedby)

    const imgContainer = document.createElement("div");
    imgContainer.className = "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 flex";
    const imgElement = document.createElement("img")

    const collections = document.createElement("div")
    const selectCollection = document.createElement('select')
    selectCollection.className = "selectCollection outline outline-slate-950 m-3"
    const defaultoption = document.createElement('option')
    defaultoption.value = ""
    defaultoption.textContent = "please select"
    defaultoption.disabled = true
    defaultoption.selected = true
    const newCollectionOpt = document.createElement('option')
    newCollectionOpt.value = "newCollection"
    newCollectionOpt.textContent = "+ Create New Collection"
    newCollectionOpt.className = "createNewCollection text-blue-600 underline"
    selectCollection.appendChild(defaultoption)
    selectCollection.appendChild(newCollectionOpt)
    usercollections.forEach((uc) => {
        const newUC = document.createElement('option')
        newUC.value = `${uc.collectionId}`
        newUC.textContent = `${uc.collectionName}`
        selectCollection.appendChild(newUC)
    })
    window.addEventListener("new-rating", (e) => {
        const { avgRating, totalRatings:newTotal, recipeId } = e.detail
        if (recipe.id === recipeId) {
            totalRatings.textContent = `Total Ratings:  ${newTotal} `
            avgRatings.textContent = `Average Ratings:   ${avgRating}`
        }
    })
    collections.className = "collections flex flex-col w-44"
    collections.appendChild(selectCollection)
    collections.addEventListener('change', async (e) => {
        if (e.target.value === 'newCollection') {
            console.log("redirecting");
            window.location.href = '/create-collection'
        } else {
            let collectionId = e.target.value
            console.log("value: ", collectionId);
            try {
                let recipeincollection = await axios.post(`${api_url}/api/collect-recipe/${collectionId}`, {}, {
                    params: {
                        recipeId: recipe.id
                    },
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                console.log("recipeCollection: ", recipeincollection);

            } catch (err) {
                console.log("error posting recipe in collection: ", err);

            }

        }

    })

    if (recipe.recipeImg && recipe.recipeImg.length > 0) {
        recipe.recipeImg.forEach((imgurl) => {
            imgElement.src = imgurl
            imgElement.alt = recipe.name
            imgElement.className = "w-full h-48 object-cover rounded-lg";
            imgContainer.appendChild(imgElement);
        })
    } else {
        imgElement.src = "/default-image.jpg"; // Put a default image in your public folder
        imgElement.alt = "No image available";
        imgElement.className = "w-full h-48 object-cover rounded-lg";
        imgContainer.appendChild(imgElement);
    }
    recipeDetailsDiv.appendChild(imgContainer)
    if (!path.includes('admin')) {
        imgContainer.appendChild(collections)
    }
    const starContainer = document.getElementById('star-container');
    

    let selectedRating = 0;
    let totalRating = 0;
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.innerHTML = "&#9734"
        star.classList.add('text-gray-400', 'text-3xl', 'cursor-pointer', 'transition-colors', 'duration-200');
        star.dataset.rating = i;
        star.addEventListener('mouseenter', () => highlightStars(i));
        star.addEventListener('mouseleave', () => highlightStars(selectedRating));
        star.addEventListener('click', async () => {
            selectedRating = i;
            totalRating += 1
            ratingText.textContent = `Rating:   ${selectedRating}`;
            await highlightStars(selectedRating);
        })
        starContainer.appendChild(star);
    }
    reviewForm.addEventListener('submit', async (e) => {
        try {
            e.preventDefault()
            const ratingDetail = {
                selectedRating,
                totalRating,
                recipeId: recipe.id,
                comment: e.target.comment.value
            }
            const giveRating = await axios.post(`${api_url}/api/ratings`, ratingDetail, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            reviewForm.reset()
        } catch (err) {
            console.log("error posting a review: ", err);

            if (err.response && err.response.data.message) {
                alert(err.response.data.message)
            }
        }
    });


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
    const methodArray = recipe.method.split(/\r?\n/).filter(item => item.trim() !== "");
    methodArray.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item.trim();
        methodList.appendChild(li);
    })
    const methodTitle = document.createElement('p')
    methodTitle.innerHTML = `<span class="font-bold text-red-900 my-24">Method :</span>`;
    recipeDetailsDiv.appendChild(methodTitle);
    recipeDetailsDiv.appendChild(methodList);

    async function highlightStars(rating) {
        const stars = starContainer.children;
        for (let i = 0; i < stars.length; i++) {
            if (i < rating) {
                stars[i].classList.remove('text-gray-400');
                stars[i].classList.add('text-yellow-400');
            } else {
                stars[i].classList.add('text-gray-400');
                stars[i].classList.remove('text-yellow-400');
            }
        }
    }
}