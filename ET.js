function handleFormSubmit(event){
    event.preventDefault();
    const expenditure={
    amount:event.target.amount.value,
    description:event.target.description.value,
    category:event.target.category.value,
}
const expenses=JSON.stringify(expenditure)
localStorage.setItem(expenditure.category, expenses)
const container=document.querySelector('.container')
const unordered_list=document.createElement('ul')
unordered_list.className="totalExpenses"
const li=document.createElement('li')
const amt=expenditure.amount
const describe=expenditure.description
const cat=expenditure.category
const expenseDetails=[amt,describe,cat].join('- ')
li.innerHTML=expenseDetails+` <button class="del-btn">Delete Expense</button> <button class="edit-btn">Edit Expense</button>`
unordered_list.appendChild(li)
container.appendChild(unordered_list)

event.target.amount.value=""
event.target.description.value=""
event.target.category.value=""


unordered_list.addEventListener('click', function(e){
    if(e.target.classList.contains("del-btn")){
        const li_to_delete=e.target.parentElement
        unordered_list.removeChild(li_to_delete)
        remove_from_storage(expenditure.category)
    }
})

unordered_list.addEventListener('click',(event)=>{
    if(event.target.classList.contains('edit-btn')){
        const li_to_edit=event.target.parentElement
        const category=expenditure.category
        const expenseDone=JSON.parse(localStorage.getItem(category))
        populateForm(expenseDone)
        unordered_list.removeChild(li_to_edit)
        remove_from_storage(category)

    }
})

}

function remove_from_storage(category){
localStorage.removeItem(category)
}

function populateForm(expense){
    document.getElementById('amount').value=expense.amount
    document.getElementById('description').value=expense.description
    document.getElementById('category').value=expense.category

}