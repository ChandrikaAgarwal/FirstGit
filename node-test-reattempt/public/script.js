// const { default: axios } = require("axios")

const form=document.getElementById('companyReview')
const api_url="http://localhost:3000"
const searchField=document.getElementById('search')
const searchBtn=document.getElementById('search-btn')
form.addEventListener('submit', async (e)=>{
    
    e.preventDefault();

    const companyReview={
        name:e.target.name.value,
        pros: e.target.pros.value,
        cons:e.target.cons.value,
        rating:e.target.rating.value

    }
    
    await axios.post(`${api_url}/api/company`,companyReview)
    .then((response)=>{
        console.log("Company Review: ",response);
        
    }).catch(err=>console.log("Error getting review :",err))
})

searchBtn.addEventListener('click',async ()=>{
    const searchQuery=searchField.value.trim()

    try{

        const response=await axios.get(`${api_url}/api/company/${searchQuery}`)
        console.log("Searching for: ",response.data);
        const detail=[`${response.data.companies[0].name}-${response.data.companies[0].averageRating}`]
        const container=document.querySelector('.container')
        const li=document.createElement('li')
        const liText=document.createTextNode(detail)
        li.appendChild(liText)
        container.appendChild(li)

        
    }catch(err){
        console.log("error finding company");
        
    }
})

searchField.addEventListener('keypress', (e)=>{
    if(e.key==='Enter'){
        searchBtn.click()
    }
 })