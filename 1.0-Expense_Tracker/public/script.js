const form=document.getElementById('expense-form')
const loginForm=document.getElementById('login-form')
const api_url='http://localhost:5000'
const container=document.querySelector('.container')
const expense_list=document.createElement('ul')
expense_list.className="allExpenses"
const usersDiv=document.getElementById('users')

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
             console.log("User Detail: ",res);
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
    container.appendChild(expense_list)
    form.addEventListener('submit', async (e)=>{
        e.preventDefault()
    
        const expenseDetail={
            amount:e.target.amount.value,
            description:e.target.description.value,
            category:e.target.category.value
        }
        const token = localStorage.getItem('token')
        await axios.post(`${api_url}/api/expenses`,expenseDetail,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        })
        .then((response)=>{
            console.log("Expense Detail: ",response);
            displayExpenses(response.data.expensedetail, response.data.expensedetail.id)
            
        }).catch(err=>console.log(err))
    })
    
    function displayExpenses(expenseDetail,id){
    const newExpense=document.createElement('li')
    const details=[`${expenseDetail.amount}-${expenseDetail.description}-${expenseDetail.category}`]
    newExpense.innerHTML=details+'<button class="delete">Delete</button> <button class="edit">Edit</button>'
    newExpense.dataset.id=id
    expense_list.appendChild(newExpense)
        
    form.reset()
    }
    
    window.addEventListener('DOMContentLoaded', ()=>{
        const token = localStorage.getItem('token');
        axios.get(`${api_url}/api/expenses`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        })
        .then((response)=>{
            console.log("Getting Expenses ",response.data);
            for(let i=0;i<response.data.expenses.length;i++){
                console.log();
                
                displayExpenses(response.data.expenses[i], response.data.expenses[i].id)
            }
            
        }).catch(err=>console.log(err))
    })
    
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
                
                .then((res)=>{
                    expense_list.removeChild(delItem)
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
            .then((res)=>{
                console.log("To edit expense: ", res.data.expense);
                expense_list.removeChild(editItem)
                let editExpense=populateFields(res.data.expense)
                const response=axios.put(`${api_url}/api/expenses/${id}`,editExpense)
                console.log("Response: ",response);
                
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

