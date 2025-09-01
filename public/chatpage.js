
const chatPage = document.querySelector("#chatPage")
const token = localStorage.getItem("token")
const apiUrl = "http://localhost:5000"

if (chatPage) {
    window.addEventListener("DOMContentLoaded", async () => {
        await getlistedBooksByUser()
    })
    async function getlistedBooksByUser() {
        let isSeller=false
        try {
            const getListedBooks = await axios.get(`${apiUrl}/api/listed-books`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log("getListedBooks: ", getListedBooks);
            if (getListedBooks.data.allListedBooks.length > 0) {
                isSeller=true
            }
            await displayListedBooks(getListedBooks.data.allListedBooks)
            await displayInterestedBooks(getListedBooks.data.allinterestedBooks)
        } catch (err) {
            console.log("Error listing all books: ",err);
            
        }
    }

    async function displayListedBooks(books) {
        const booksBySeller = document.querySelector('#booksBySeller')
        if (books.length === 0) {
            const noBooksHead=document.createElement('h1')
            noBooksHead.textContent = "No Results"
            noBooksHead.className = "text-red-500 font-bold text-xl mx-80"
            booksBySeller.appendChild(noBooksHead)
            return
        }
        books.forEach(book => {
            const boxSize = document.createElement("div")
            boxSize.id = "boxSize"
            boxSize.className = "relative border border-gray-300 rounded-lg shadow-md p-4 w-[300px] h-[320px] m-4 motion-preset-slide-right-lg motion-duration-1500"
            booksBySeller.appendChild(boxSize)
            const bookImg=document.createElement("img")
            if (book.bookImg) {
                bookImg.src = book.bookImg[0];
                bookImg.alt = "";
            }
            bookImg.className = "h-44 border-2 outline-black rounded-lg w-full object-center"
            const NamePriceDiv = document.createElement('div')
            NamePriceDiv.className = "flex flex-row"
            const bookName = document.createElement('h2')
            bookName.textContent = book.title
            bookName.className = "uppercase text-indigo-500 font-medium mt-4 mr-28"
            const bookPrice = document.createElement('h2')
            bookPrice.textContent = `INR ${book.price}`
            bookPrice.className = "text-indigo-500 font-medium mt-4 "
            NamePriceDiv.appendChild(bookName)
            NamePriceDiv.appendChild(bookPrice)
            
            const potentialBuyerBtn = document.createElement('button')
            potentialBuyerBtn.id=`${book._id}`
            potentialBuyerBtn.textContent = "See potential Buyers"
            potentialBuyerBtn.className = "bg-black text-white font-semibold p-2 rounded-full absolute bottom-3 cursor-pointer potentialBuyers"
            potentialBuyerBtn.setAttribute("data-bookId", book._id)
            boxSize.appendChild(bookImg)
            boxSize.appendChild(NamePriceDiv)
            boxSize.appendChild(potentialBuyerBtn)
            
        });
    }
    async function displayInterestedBooks(books) {
        const interestBooksDiv = document.querySelector('#interestBooksDiv')
        if (books.length === 0) {
            const noBooksHead = document.createElement('h1')
            noBooksHead.textContent = "No Results"
            noBooksHead.className = "text-red-500 font-bold text-xl mx-80"
            interestBooksDiv.appendChild(noBooksHead)
            return
        }
        books.forEach(book => {
            const boxSize = document.createElement("div")
            boxSize.id = "boxSize"
            boxSize.className = "relative border border-gray-300 rounded-lg shadow-md p-4 w-[300px] h-[340px] m-4 motion-preset-slide-right-lg motion-duration-1500"
            interestBooksDiv.appendChild(boxSize)
            const bookImg = document.createElement("img")
            if (book.bookId.bookImg) {
                bookImg.src = book.bookId.bookImg[0];
                bookImg.alt = "";
            }
            bookImg.className = "h-44 border-2 outline-black rounded-lg w-full object-center"
            const NamePriceDiv = document.createElement('div')
            NamePriceDiv.className = "flex flex-row"
            const bookName = document.createElement('h2')
            bookName.textContent = book.bookTitle
            bookName.className = "uppercase text-indigo-500 font-medium mt-4 mr-28"
            const bookPrice = document.createElement('h2')
            bookPrice.textContent = `INR ${book.bookId.price}`
            bookPrice.className = "text-indigo-500 font-medium mt-4 "
            NamePriceDiv.appendChild(bookName)
            NamePriceDiv.appendChild(bookPrice)

            const chatWithSellerBtn = document.createElement('button')
            chatWithSellerBtn.id = `${book._id}`
            chatWithSellerBtn.textContent = "Chat with seller"
            chatWithSellerBtn.className = "bg-black text-white font-semibold p-2 rounded-full absolute bottom-3 cursor-pointer chatWithSeller"
            chatWithSellerBtn.setAttribute("data-bookId", book.bookId._id)
            boxSize.appendChild(bookImg)
            boxSize.appendChild(NamePriceDiv)
            boxSize.appendChild(chatWithSellerBtn)
        });
    }

    //event delegation
    document.addEventListener("click", async (e) => {
        if (e.target.classList.contains('potentialBuyers')) {
            const bookId = e.target.getAttribute('data-bookId')
            window.location.href=`/chat/${bookId}`
        }

        if (e.target.classList.contains('chatWithSeller')) {
            const bookId = e.target.getAttribute('data-bookId')
            window.location.href = `/chat/${bookId}`
        }
    })
}