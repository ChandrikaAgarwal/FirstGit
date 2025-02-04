const form=document.getElementById('companyReview')
const container=document.querySelector('.container')
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
        form.reset()
        
    }).catch(err=>console.log("Error getting review :",err))
})

searchBtn.addEventListener('click',async ()=>{
    const searchQuery=searchField.value.trim()
    

    try{

        const response=await axios.get(`${api_url}/api/company/${searchQuery}`)
        console.log("Searching for: ",response.data);
        const company=response.data.companyDetail[0]
        const name=company.name
        // console.log(name);
        const para=document.createElement('h4')
        para.className='companyName'
        para.innerHTML="Company Name: "+name
        container.appendChild(para)
        const ul = document.createElement('ul');
        const averageRating=document.createElement('li')
        averageRating.textContent=`Average Rating: ${company.averageRating}`
        ul.appendChild(averageRating)
        
        if(company.pros){
            const pros=document.createElement('li')
            pros.textContent=`Pros: ${company.pros}`
            ul.appendChild(pros)
        }

        if(company.cons){
            const cons=document.createElement('li')
            cons.textContent=`Cons: ${company.cons}`
            ul.appendChild(cons)
        }
        container.appendChild(ul)

        
    }catch(err){
        if(!searchQuery){
            alert("Please enter a company name")
        }else{
            const para=document.createElement('h5')
            para.innerHTML=`<h5>No such company found</h5>`
            para.className='notFound'
            container.appendChild(para)
            console.log("error finding company");
        }
        
        
    }
})

searchField.addEventListener('keypress', (e)=>{
    if(e.key==='Enter'){
        searchBtn.click()
    }
 })