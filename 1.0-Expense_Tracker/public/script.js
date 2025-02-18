const form=document.getElementById('expense-form')
const loginForm=document.getElementById('login-form')
const togBtn=document.getElementById("toggle")
const cat=document.getElementById("category")
const catlabel=document.getElementById("catlabel")
const api_url='http://localhost:5000'
const containerfluid=document.querySelector('.expense-Div')
const container=document.querySelector('.savingsandIncome')
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
    let prevdate=0;
    const token = localStorage.getItem('token')  
        const showformbtn = document.querySelector('#show-form'); 
        console.log("Show form btn!!",showformbtn);
        
        if (!showformbtn) {
            console.error("Button not found!");
            
        }
    let icon = showformbtn.getElementsByTagName('i')[0]; 
    showformbtn.addEventListener('click', ()=>{
        if(showformbtn.classList.contains('collapsed')){
            
        icon.classList.replace('fa-minus', 'fa-plus'); // Change back to plus
        }else{
            icon.classList.replace('fa-plus', 'fa-minus'); // Change to minus
        }
    })
    
    const dateDisplay=document.getElementById('dateDisplay')
    const prevBtn=document.getElementById('prevbtn')
    const nextBtn=document.getElementById('nextbtn')
    
    let today=new Date()
    let currentYear=today.getFullYear();
    
    let currentMonth=today.getMonth();
    
    let currentDay=today.getDate();
       
    let daysinMonth=new Date(currentYear,currentMonth+1,0).getDate()

    function formatDate(year,month,day){
        let date=new Date(year,month,day);     
        prevdate= `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        console.log("prevDate: ",prevdate);
        let options={weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
        // let options={year: 'numeric', month: 'numeric', day: 'numeric'};
        return date.toLocaleDateString('en-US', options);
       }

    function updateDateDisplay(){
        console.log("current day on display ",currentDay); //15
        dateDisplay.textContent=formatDate(currentYear, currentMonth, currentDay)
        console.log("datedisplay::",dateDisplay);
        
    }
    
    nextBtn.addEventListener("click", ()=>{
        
        
        if(currentDay<daysinMonth){
            currentDay++;
        }
        updateDateDisplay();
        // console.log("next date: ",prevdate);
        filterExpenses(prevdate)
        
    })

    prevBtn.addEventListener("click", async ()=>{
        console.log("current day: ",currentDay);  //16
        if(currentDay>1){
            currentDay--;
            console.log("currentday on prev: ",currentDay); //15
            
        }
        updateDateDisplay();    

        filterExpenses(prevdate)
        
    })

    //initial display
    updateDateDisplay()


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
    const savingcol=document.querySelector('.savingsAmount')
    const incomeDiv=document.createElement('div')
    incomeDiv.className='col incomecol'
    row.appendChild(incomeDiv)
    const incomecol = document.querySelector('.incomecol')
    console.log(container);
    form.addEventListener("submit", async (e)=>{
        e.preventDefault()
        
    if(togBtn.textContent==="EXPENSE"){
        console.log("i am in expense mode");
        const Detail={
            amount:parseFloat(e.target.amount.value),
            description:e.target.description.value,
            category:e.target.category.value,
            // createdAt:prevdate- to send the date of creation of expense witht he request body
        }
            await axios.post(`${api_url}/api/expenses/?date=${prevdate}`,Detail,{ //sending date of creation as a query parameter
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })
            .then((response)=>{
                console.log("Expense Detail: ",response);
                displayExpenses(response.data.expensedetail, response.data.expensedetail.id)
                displaySavings(prevdate,response.data.expensedetail.currentsaving)
                
                
            }).catch(err=>console.log(err))
        }else{
            console.log("i am in income mode");
            const incomeDetail={
            amount:parseFloat(e.target.amount.value),
            description:e.target.description.value,
            }
            console.log("Income: ",incomeDetail); 
            await axios.post(`${api_url}/api/income/?date=${prevdate}`,incomeDetail,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
        }).then((response)=>{
                console.log("Income Details ",response.data);
                console.log("User id::",response.data.incomedetail.userId);
                userId=response.data.incomedetail.userId
                localStorage.setItem(userId, response.data.incomedetail.amount)
                displayIncome(prevdate,response.data.incomedetail.amount)
                displaySavings(prevdate,response.data.incomedetail.totalsaving)
        }).catch(err=>console.log(err))
        form.reset()
    }     
        
    })   

    function displayIncome(createdAt, income) {
        incomecol.innerHTML = "";
        if (createdAt === prevdate) {
            incomecol.innerHTML=`<h4>${income}</h4>`      
        }
        // console.log(income);
        // const incomecol=document.querySelector('.incomecol')
        container.insertBefore(row, expense_list)
    }

    window.addEventListener("DOMContentLoaded",async ()=>{
            
             
    // const expenseResponse=await axios.get(`${api_url}/api/expenses/`,{
    //     headers:{
    //         Authorization:`Bearer ${token}`
    //     }
    // })
    
    //     console.log("Getting Expenses ",expenseResponse.data);
    //     for(let i=0;i<expenseResponse.data.expenses.length;i++){
    //         console.log();
            
            filterExpenses(prevdate)
            

            
             
})
    function displaySavings(createdAt, savingsdone) {
        savingcol.innerHTML = ""
        console.log("savingsdone::",savingsdone);
        console.log("Savings createdAt: ",prevdate);
        
        if (createdAt === prevdate) {
            savingcol.innerHTML = `<h4>${savingsdone}</h4>`
        }
        // const savingcol=document.querySelector('.savingsAmount')
        
    }

    async function filter(targetArr, carouseldate) {
        let filteredArray = await targetArr.filter(item => {
            let dateCreatedAt = item.createdAt.split("T")[0]
            console.log("Checking expense date ", dateCreatedAt);
            return dateCreatedAt === carouseldate;
        })
        return filteredArray
    }

   async function filterExpenses(date){
            let incomecreatedAt=0
            const incomeResponse= await axios.get(`${api_url}/api/income/?carouseldate=${date}`,{
                 headers:{
                 Authorization:`Bearer ${token}`
                 }
            })
       console.log("incomeResponse on Specific date of carousel: ",incomeResponse.data);
       
    //    let incomeResponseArr = incomeResponse.data.income
    //    console.log("Income response: ", incomeResponseArr);
    //    let filteredIncome=await filter(incomeResponseArr,date)
            
       if (incomeResponse.data.income) {
           incomecreatedAt = incomeResponse.data.income.createdAt.split('T')[0]
           //  savingcol.innerHTML = ""
           console.log("Getting Data on refresh!!", incomeResponse.data.income);
                 
           const storedincome = localStorage.getItem(incomeResponse.data.income.userId)
           displayIncome(incomecreatedAt, incomeResponse.data.income.amount)
           console.log("On refresh: ", incomeResponse.data.income.totalsaving);
           displaySavings(incomecreatedAt, incomeResponse.data.income.totalsaving) //to display the savings first
       } else {
           incomecol.innerHTML = "";
           savingcol.innerHTML = ""
        }

       
    const response=await axios.get(`${api_url}/api/expenses/`,{
        headers:{
            Authorization:`Bearer ${token}`
        }
    })
    let allexpenses=response.data.expenses || [];  
        let filteredExpenses=await filter(allexpenses, date)
        console.log("filtered Expenses:: ",filteredExpenses);

        expense_list.innerHTML=""
        if(filteredExpenses.length>0){
            filteredExpenses.forEach(expense=> displayExpenses(expense, expense.id))
            displaySavings(incomecreatedAt,incomeResponse.data.income.totalsaving)
        }else{
            console.log("No expenses found for the date");
        }
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
                    `${api_url}/api/expenses/${id}`, {
                        params:{
                        prevdate     
                        },
                        headers:{
                            Authorization:`Bearer ${token}`
                        }
                    })
                
                .then(async (res)=>{
                    console.log(res);
                    expense_list.removeChild(delItem)
                    const incomeResponse = await axios.get(`${api_url}/api/income?carouseldate=${prevdate}`,{
                        headers:{
                        Authorization:`Bearer ${token}`
                        }
                    })
                    if(incomeResponse.data.income){
            
                    console.log("Getting Data on refresh!!",incomeResponse.data);
                    
                    const storedincome=localStorage.getItem(incomeResponse.data.income.userId)
                    displayIncome(prevdate,incomeResponse.data.income.amount)
                    console.log("On refresh: ",incomeResponse.data.income.totalsaving);
                    displaySavings(prevdate,incomeResponse.data.income.totalsaving) //to display the savings first
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
            await axios.get(`${api_url}/api/expenses/${id}`, {
                params: {
                    prevdate
                },
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })
            .then(async (res)=>{
                console.log("To edit expense: ", res.data.expense);
                expense_list.removeChild(editItem)
                let editExpense=populateFields(res.data.expense)
                const response = await axios.put(`${api_url}/api/expenses/${id}`, editExpense, {
                    params: {
                        prevdate
                    },
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                    })
                console.log("Response: ",response);
                const incomeResponse = await axios.get(`${api_url}/api/income/?carouseldate=${prevdate}`,{
                    headers:{
                    Authorization:`Bearer ${token}`
                    }
                })
                if(incomeResponse.data.income){
        
                console.log("Getting Data on refresh!!",incomeResponse.data);
                
                const storedincome=localStorage.getItem(incomeResponse.data.income.userId)
                displayIncome(prevdate,storedincome)
                console.log("On refresh: ",incomeResponse.data.income.totalsaving);
                displaySavings(prevdate,incomeResponse.data.income.totalsaving) //to display the savings first
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

