const bookDetailPage = document.querySelector("#bookDetails")
const token = localStorage.getItem("token")
const chatMessages = document.querySelector("#chatMessages")
const messagesUl = document.querySelector('#messagesUl')
const apiUrl = "http://localhost:5000"

if (bookDetailPage) {
    const pathParts = window.location.pathname.split('/')
    const bookId = pathParts[pathParts.length - 1]
    const reviewForm = document.querySelector('#review-form')
    const comment = document.querySelector('#comment')
    window.addEventListener("DOMContentLoaded", async () => {
        await getSelectedBook()
        
    })
    async function getSelectedBook() {
        try { 
            
            const getBook = await axios.get(`${apiUrl}/api/book/${bookId}`, {
                headers: {
                    'Authorization':`Bearer ${token}`
                }
            })
            console.log("Book: ",getBook);
            await displayBookDetails(getBook.data.requestedBook, getBook.data.isSeller, getBook.data.isInterested)
        } catch (err) {
            console.log("Error fetching you book: ",err);
            
        }
    }

    async function displayBookDetails(bookDetails,isSeller,isInterested) {
        const selectedBookDetails = document.querySelector("#selectedBook")
        const bookName=document.createElement('p')
        bookName.textContent = bookDetails.title.toUpperCase()
        bookName.className = "text-red-600 font-bold mx-10 mt-5"
        
        const sellerDiv=document.createElement('div')
        sellerDiv.className="flex flex-col"
        const postedBy=document.createElement('p')
        const date = new Date(bookDetails.createdAt).toLocaleDateString()
        const postDate = document.createElement('p')
        const location = document.createElement('p')
        postedBy.innerHTML = `Posted by : ${bookDetails.sellerId.name}`
        postedBy.className ="mr-1 text-indigo-500 font-semibold mx-10"
        postDate.innerHTML = `Posted on: ${date}`
        postDate.className = "text-indigo-500 font-semibold mx-10"
        location.innerHTML = `Location : ${bookDetails.location}`
        location.className = "text-indigo-500 font-semibold mx-10"
        sellerDiv.appendChild(postedBy)
        sellerDiv.appendChild(postDate)
        sellerDiv.appendChild(location)
        const imgContainer = document.createElement("div");
        imgContainer.className = "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 flex";
        const imgElement = document.createElement("img")

        if (bookDetails.bookImg && bookDetails.bookImg.length > 0) {
            bookDetails.bookImg.forEach((imgUrl) => {
                imgElement.src=imgUrl
                imgElement.alt=""
                imgElement.className = "h-60 w-44 object-cover rounded-lg mx-32 mt-10";
                imgContainer.appendChild(imgElement);
            })
        } else {
            imgElement.src = "/booklogo.png"; // Put a default image in your public folder
            imgElement.alt = "No image available";
            imgElement.className = "w-full h-48 object-cover rounded-lg";
            imgContainer.appendChild(imgElement);
        }
        const interestedBtn = document.createElement('button')
        interestedBtn.id = "interested" 
        interestedBtn.textContent = isInterested?"Shown Interest":"I'm interested"
        interestedBtn.className = "mx-36 mt-5 bg-black text-white p-2 rounded-full font-semibold"
        if (isSeller) {
            interestedBtn.classList.add('hidden')
        }
        
        const detailDiv = document.createElement('div')
        detailDiv.className = "grid grid-cols-1 sm:grid-cols-2 gap-2 my-8";
        const leftDetails = document.createElement("div");
        leftDetails.innerHTML = `
<p><span class="font-bold text-red-900 mx-6">Author :</span> <span class="text-purple-700">${bookDetails.author}</p>
<p><span class="font-bold text-red-900 mx-6">Price :</span> <span class="text-purple-700"> INR ${bookDetails.price}</span></p>
`;
        const rightDetails = document.createElement("div");
        rightDetails.innerHTML = `
<p><span class="font-bold text-red-900">Status :</span> <span class="text-purple-700">${bookDetails.status}</span></p>
<p><span class="font-bold text-red-900">Subject :</span> <span class="text-purple-700">${bookDetails.subject}</span></p>
`;  
        const experienceDiv = document.createElement('div')
        experienceDiv.className="m-2"
        const sellerExperienceDiv = document.createElement('p')
        sellerExperienceDiv.innerHTML=`<span class="font-bold text-xl">Seller's Experience:</span><p class="border p-2 mt-2 rounded-md font-mono bg-pink-100 from-neutral-500 font-[100] shadow-sm">${bookDetails.experience}</p>`
        experienceDiv.appendChild(sellerExperienceDiv)
        detailDiv.appendChild(leftDetails)
        detailDiv.appendChild(rightDetails)
        detailDiv.appendChild(experienceDiv)
        selectedBookDetails.appendChild(bookName)
        selectedBookDetails.appendChild(sellerDiv)
        selectedBookDetails.appendChild(imgContainer)
        selectedBookDetails.appendChild(interestedBtn)
        selectedBookDetails.appendChild(detailDiv)

        interestedBtn.addEventListener("click", async (e) => {
            interestedBtn.textContent = "Shown Interest"
            interestedBtn.disabled = true;
            const userinterest = await axios.post(`${apiUrl}/user-interest/${bookId}`, {}, {
                headers: {
                'Authorization':`Bearer ${token}`
                }    
            })
            console.log("userinterest response: ",userinterest);
            
        })
    }
    
}


