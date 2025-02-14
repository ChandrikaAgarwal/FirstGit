const form=document.getElementById('expense-form')
const loginForm=document.getElementById('login-form')
const togBtn=document.getElementById("toggle")
const cat=document.getElementById("category")
const catlabel=document.getElementById("catlabel")
const api_url='http://localhost:5000'
const containerfluid=document.querySelector('.container-fluid')
const container=document.querySelector('.container')
const expense_list=document.createElement('ul')
expense_list.className="allExpenses"
const usersDiv=document.getElementById('users')
const row=document.querySelector('.incomedisplay')
var userId;

if(loginForm){
    const usersul=document.createElement('ul')
    usersul.className="user_list"
    usersDiv.appendChild(usersul)
    loginForm.addEventListener('submit', async (e)=>{
        e.preventDefault()
        const userDetail={
            email:e.target.email.value,
            password:e.target.password.value
        }
        console.log("userdetail ",userDetail);
        try{
            const res=await axios.post(`${api_url}`,userDetail)
            console.log("User Detail: ",res.data);
            //  alert(res.data.message)

            localStorage.setItem('token', res.data.token);
             window.location.href="/expenses"
        }catch(err){
            console.error("Error: ",err.response)
            if (err.response && err.response.data.message){
                alert(err.response.data.message)
            }else{
                alert("An error occured, please try again!!")
            }
        }       
     })   
}

if(form){

    togBtn.addEventListener("click",(e)=>{
       if(togBtn.textContent==="EXPENSE"){
        togBtn.textContent="INCOME";
        cat.style.display="none"
        // catlabel.style.display="none"
        
       }else{
        togBtn.textContent="EXPENSE"
        cat.style.display="flex"
        // catlabel.style.display="flex"
       }
    })
    container.appendChild(expense_list)
    const savingsDiv=document.createElement('div')
    savingsDiv.className='row savingsdisplay'
    savingsDiv.innerHTML=`<div class="col"><h4>Savings</h4></div> <div class="col savingsAmount"></div>`
    container.insertBefore(savingsDiv,row)

    const incomeDiv=document.createElement('div')
    incomeDiv.className='col incomecol'
    row.appendChild(incomeDiv)
    console.log(container);
    form.addEventListener("submit", async (e)=>{
        e.preventDefault()
        const token = localStorage.getItem('token')  
    if(togBtn.textContent==="EXPENSE"){
        console.log("i am in expense mode");
        const Detail={
            amount:parseFloat(e.target.amount.value),
            description:e.target.description.value,
            category:e.target.category.value,
        }
            await axios.post(`${api_url}/api/expenses/`,Detail,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })
            .then((response)=>{
                console.log("Expense Detail: ",response);
                displayExpenses(response.data.expensedetail, response.data.expensedetail.id,response.data.expensedetail.savings)
                displaySavings(response.data.expensedetail.currentsaving)
                
                
            }).catch(err=>console.log(err))
        }else{
            console.log("i am in income mode");
            const incomeDetail={
            amount:parseFloat(e.target.amount.value),
            description:e.target.description.value,
            }
            console.log("Income: ",incomeDetail); 
            await axios.post(`${api_url}/api/income/`,incomeDetail,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
        }).then((response)=>{
                console.log("Income Details ",response.data);
                console.log("User id::",response.data.incomedetail.userId);
                userId=response.data.incomedetail.userId
                localStorage.setItem(userId, response.data.incomedetail.amount)
                displayIncome(response.data.incomedetail.amount)
                displaySavings(response.data.incomedetail.totalsaving)
        }).catch(err=>console.log(err))
        form.reset()
    }     
        
    })   

    function displayIncome(income){
        console.log(income);
        const incomecol=document.querySelector('.incomecol')
        incomecol.innerHTML=`<h4>${income}</h4>`      
        container.insertBefore(row, expense_list)
    }

    window.addEventListener("DOMContentLoaded",async ()=>{
        try{       
            const token=localStorage.getItem('token')
            const incomeResponse= await axios.get(`${api_url}/api/income`,{
                 headers:{
                 Authorization:`Bearer ${token}`
                 }
             })
             if(incomeResponse.data.income){
     
             console.log("Getting Data on refresh!!",incomeResponse.data);
             
             const storedincome=localStorage.getItem(incomeResponse.data.income.userId)
             displayIncome(storedincome)
             console.log("On refresh: ",incomeResponse.data.income.totalsaving);
             displaySavings(incomeResponse.data.income.totalsaving) //to display the savings first
             }
             
    const expenseResponse=await axios.get(`${api_url}/api/expenses`,{
        headers:{
            Authorization:`Bearer ${token}`
        }
    })
    
        console.log("Getting Expenses ",expenseResponse.data);
        for(let i=0;i<expenseResponse.data.expenses.length;i++){
            console.log();
            
            displayExpenses(expenseResponse.data.expenses[i], expenseResponse.data.expenses[i].id)

            displaySavings(incomeResponse.data.income.totalsaving)
            
        }
        
       }catch(err){
        console.log("Error fetching data on refresh:", err);
       } 
})
    function displaySavings(savingsdone){
        const savingcol=document.querySelector('.savingsAmount')
        savingcol.innerHTML=`<h4>${savingsdone}</h4>`
    }
    function displayExpenses(expenseDetail,id){
    
    const newExpense=document.createElement('li')
    const details=[`${expenseDetail.amount}-${expenseDetail.description}-${expenseDetail.category}`]
    newExpense.innerHTML=details+'<button class="delete">Delete</button> <button class="edit">Edit</button>'
    newExpense.dataset.id=id
    expense_list.appendChild(newExpense)
        
    form.reset()
    }
        
    const delBtn=document.querySelector('.delete')
    expense_list.addEventListener('click', (e)=>{
        const token = localStorage.getItem('token');
            if(e.target.classList.contains('delete')){
                const delItem=e.target.parentElement;
                const id=delItem.dataset.id
                axios
                .delete(
                    `${api_url}/api/expenses/${id}`,{
                        headers:{
                            Authorization:`Bearer ${token}`
                        }
                    })
                
                .then(async (res)=>{
                    console.log(res);
                    expense_list.removeChild(delItem)
                    const incomeResponse= await axios.get(`${api_url}/api/income`,{
                        headers:{
                        Authorization:`Bearer ${token}`
                        }
                    })
                    if(incomeResponse.data.income){
            
                    console.log("Getting Data on refresh!!",incomeResponse.data);
                    
                    const storedincome=localStorage.getItem(incomeResponse.data.income.userId)
                    displayIncome(storedincome)
                    console.log("On refresh: ",incomeResponse.data.income.totalsaving);
                    displaySavings(incomeResponse.data.income.totalsaving) //to display the savings first
                    }
                    
                })
                .catch(err=>console.log(err))
       
            }   
    });
    
    const editBtn=document.querySelector('.edit')
    expense_list.addEventListener('click', async (e)=>{
        const token = localStorage.getItem('token');
        if(e.target.classList.contains('edit')){
            const editItem=e.target.parentElement;
            const id=editItem.dataset.id
            await axios.get(`${api_url}/api/expenses/${id}`,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })
            .then(async (res)=>{
                console.log("To edit expense: ", res.data.expense);
                expense_list.removeChild(editItem)
                let editExpense=populateFields(res.data.expense)
                const response=await axios.put(`${api_url}/api/expenses/${id}`,editExpense,{
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                    })
                console.log("Response: ",response);
                const incomeResponse= await axios.get(`${api_url}/api/income`,{
                    headers:{
                    Authorization:`Bearer ${token}`
                    }
                })
                if(incomeResponse.data.income){
        
                console.log("Getting Data on refresh!!",incomeResponse.data);
                
                const storedincome=localStorage.getItem(incomeResponse.data.income.userId)
                displayIncome(storedincome)
                console.log("On refresh: ",incomeResponse.data.income.totalsaving);
                displaySavings(incomeResponse.data.income.totalsaving) //to display the savings first
                }
                
                
            })
            .catch(err=>console.log(err))
        }
    });
    
    function populateFields(response){
        let amount=document.getElementById('amount').value=response.amount;
        let description=document.getElementById('description').value=response.description;
        let category=document.getElementById('category').value=response.category;
        return editExpense={amount,description,category}
    }
}

