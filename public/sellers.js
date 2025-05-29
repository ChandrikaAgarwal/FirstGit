const sellerListPage = document.querySelector('#sellerListPage')
const token = localStorage.getItem("token")
const apiUrl = "http://localhost:5000"

if (sellerListPage) {
    window.addEventListener("DOMContentLoaded", async () => {
        await getSellers()
    })
    async function getSellers() {
        try {
            const sellerList = await axios.get(`${apiUrl}/fetch-sellers`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log("sellers: ", sellerList);
            await displaySellers(sellerList.data.allSellers, sellerList.data.currentUser, sellerList.data.following)
        } catch (err) {
            console.log("error fetching all sellers ",err);
            
        }
    }
    async function makeReviewForm(seller,currUserId) {
        const reviewDiv=document.createElement("div")
        reviewDiv.className = "flex flex-col buyerReviews mt-10 ml-20 bg-gray-200 h-72 p-4 rounded w-80"
        const reviewLabel=document.createElement("label")
        reviewLabel.setAttribute("for", "review-form")
        reviewLabel.textContent = `Review for ${seller.name}`
        reviewLabel.className = "mb-5"
        if (seller._id === currUserId) {
            const msg = document.createElement("p")
            msg.textContent = "You can't review yourself."
            msg.className = "text-red-600 font-semibold"
            reviewDiv.appendChild(reviewLabel)
            reviewDiv.appendChild(msg)
            console.log("reviewDiv ",reviewDiv);
            return reviewDiv
        }

        const reviewForm=document.createElement("form")
        reviewForm.id="review-form"
        reviewForm.innerHTML = `<textarea name="comment" id="comment" class="outline outline-slate-950 px-4 py-1 rounded-sm w-full resize-none" rows="5" cols="7" ></textarea> 
        <div id="star-container" class="flex space-x-1"></div>
        <button type="submit" id="submit-review" class="border-2 border-slate-950 rounded-md p-1 mt-2">Submit Review</button>`
        reviewDiv.appendChild(reviewLabel)
        reviewDiv.appendChild(reviewForm)

        return reviewDiv

    }

    async function totalRatings(seller) {
        const totalRatingsDiv = document.createElement("div")
        totalRatingsDiv.className ="max-w-lg mx-auto mb-3 bg-yellow-200 p-4 rounded"
        totalRatingsDiv.innerHTML = `<p id="rating-value-${seller._id}" class="text-lg font-medium text-gray-700">Rating: 0</p>
        <p id="totalRatingValue-${seller._id}" class="text-lg font-medium text-gray-700">Total Ratings: 0</p>`
        return totalRatingsDiv
    }

    async function displayStars(seller,starContainer) {
        const ratingText = document.querySelector(`#rating-value-${seller._id}`);
        console.log("ratingText: ",ratingText);
        
        const totalRatingsVal = document.querySelector(`#totalRatingValue-${seller._id}`);
        let selectedRating = 0;
        let totalRating = 0;
        for (let i = 1; i <= 5; i++){
            const star=document.createElement('span')
            star.innerHTML = "&#9734"
            star.classList.add('text-gray-400','text-3xl','cursor-pointer','transition-colors','duration-200')
            star.dataset.rating = i;
            star.addEventListener('mouseenter', () => highlightStars(starContainer,i))
            star.addEventListener('mouseleave', () => highlightStars(starContainer,selectedRating))
            star.addEventListener("click", async () => {
                selectedRating = i;
                totalRating += 1
                ratingText.textContent = `Rating: ${selectedRating}`;
                totalRatingsVal.textContent = `Total Ratings: ${totalRating}`
                await highlightStars(starContainer,selectedRating)
                
            })
            starContainer.appendChild(star)
        }
    }

    async function highlightStars(container,rating) {
        
        const stars = container.children;
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

    async function displaySellers(sellers,currentUserId,following) {
        const sellersList = document.querySelector("#sellersList")
        sellersList.innerHTML = ""
        let followingIds=following.map(f=>f.followingId)
        sellers.forEach(async(seller) => {
            const parentDiv = document.createElement('div')
            parentDiv.className="ml-10 grid grid-cols-2 content-between gap-4"
            const totalRatingsDiv=await totalRatings(seller)
            const reviewDiv = await makeReviewForm(seller,currentUserId)
            const starContainer =reviewDiv.querySelector('#star-container');

            const sellerDiv=document.createElement('div')   
            sellerDiv.className = "rounded-lg shadow-md p-4 m-5 w-[230px] h-72 relative"
            sellerDiv.id = `${seller._id}`
            const sellerImg=document.createElement('img')
            sellerImg.id="sellerImg"
            sellerImg.src = "/default-profile-pic (1).png"
            sellerImg.alt=""
            sellerImg.className ="w-full h-45 object-cover rounded-md mb-3 pt-3 mt-3"
            sellerDiv.appendChild(sellerImg)
            const sellerRef=document.createElement('a')
            sellerRef.href=`/author/${seller._id}`
            sellerRef.textContent = `${seller.name}`
            sellerRef.className =" flex absolute right-5 top-0 text-red-600 font-semibold hover:underline text-md"
            const followBtn=document.createElement('button')
            followBtn.type = "button"
            followBtn.className = "follow absolute bottom-2 right-3 bg-black mt-5 text-white rounded-md p-1 font-bold"
            if (seller._id === currentUserId) {
                followBtn.disabled = true
                followBtn.classList.replace("bg-black", "bg-gray-300")
            }
            followBtn.textContent = "Follow"
            if (followingIds.includes(seller._id)) {
                followBtn.textContent = "Following"
                followBtn.disabled = true;
            } else {
                followBtn.textContent = "Follow"
            }
            sellerDiv.appendChild(sellerRef)
            sellerDiv.appendChild(followBtn)
            parentDiv.appendChild(sellerDiv)
            parentDiv.appendChild(reviewDiv)
            parentDiv.appendChild(totalRatingsDiv)
            sellersList.appendChild(parentDiv)
            if(starContainer) await displayStars(seller,starContainer)
        })

        sellersList.addEventListener("click", async (e) => {
            try {
                if (e.target.tagName === "BUTTON") {
                    e.target.textContent="Following"
                    let closestDiv = e.target.closest("div[id]")
                    let followingId=closestDiv.id
                    let followingName=closestDiv.querySelector('a').textContent.trim()
                    const userFollowed = {
                        followingId,
                        followingName
                    }
                    const followUser = await axios.post(`${apiUrl}/api/follow-user`, userFollowed, {
                        headers: {
                            'Authorization':`Bearer ${token}`
                        }
                    })
                    console.log("followUser: ",followUser);
                    
                }
            } catch (err) {
                console.log("error following user: ", err);
            }
        })
    }
}