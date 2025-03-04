const monthDisplay = document.getElementById('monthDisplay')
const prevBtn = document.getElementById('prevbtn')
const nextBtn = document.getElementById('nextbtn')
const api_url = 'http://localhost:5000'
const displayExpenses = document.querySelector('.display_expenses')
const ul = document.createElement('ul')
displayExpenses.appendChild(ul)
ul.className = "monthly_expense_list"
displayExpenses.appendChild(ul)
let today = new Date()
let currentDay = today.getDate();
let currentMonth = today.getMonth()
let currentYear = today.getFullYear()

let monthNumber;
const token = localStorage.getItem('token')
function formatMonth(year, month, day) {
    let date = new Date(year, month, day)
    monthNumber = date.toLocaleString('default', { month: 'numeric' })
    monthNumber = `${String(monthNumber).padStart(2, 0)}`
    console.log("month number: ", monthNumber);

    let monthName = date.toLocaleString('default', { month: 'long' })
    let yearName = date.toLocaleString('default', { year: 'numeric' })
    console.log("monthName: ", monthName, "yearName: ", yearName);
    let options = { month: "long", year: "numeric" };
    return date.toLocaleDateString('en-US', options);
}

function updateMonthDisplay() {
    monthDisplay.textContent = formatMonth(currentYear, currentMonth, currentDay)
    console.log("month display textContent: ", monthDisplay.textContent);
}


nextBtn.addEventListener("click", () => {
    if (currentMonth < 11) {
        currentMonth++
        console.log("current month on nextBtn is: ", currentMonth);
    } else {
        currentMonth = 0
        currentYear++
    }
    updateMonthDisplay();
    getExpensesByMonth()
})

prevBtn.addEventListener('click', () => {
    if (currentMonth > 0) {
        currentMonth--
        console.log("current month on prevBtn is: ", currentMonth);

    } else {
        currentMonth = 11;
        currentYear--;
    }
    updateMonthDisplay();
    getExpensesByMonth()
})
updateMonthDisplay();

window.addEventListener("DOMContentLoaded", async () => {
    getExpensesByMonth()
})

async function getExpensesByMonth() {
    let monthlyResponse;
    try {
        monthlyResponse = await axios.get(`${api_url}/api/monthly/?month=${monthNumber}&year=${currentYear}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        console.log("Getting Expenses:: ", monthlyResponse.data);

    } catch (err) {
        console.log("Error in monthly expenses:  ", err);
    }
    displayMonthlyExpenses(monthlyResponse.data.allExpenses, monthlyResponse.data.totalInc, monthlyResponse.data.totalExp, monthlyResponse.data.carryforward, monthlyResponse.data.balance)

}
let totalIncomeDisplay = document.querySelector('.totalIncomeDisplay')
let totalExpenseDisplay = document.querySelector('.totalExpenseDisplay')
let carryForwardDisplay = document.querySelector('.cfDisplay')
let balanceDisplay = document.querySelector('.balanceDisplay')

async function displayMonthlyExpenses(allExpenses, monthlyInc, monthlyExp, carryForward, balance) {
    try {
        ul.innerHTML = ""
        for (let expense of allExpenses) {
            const expenseLi = document.createElement('li')
            let createdAt = expense.createdAt.split('T')[0]
            expenseLi.textContent = `${createdAt}-${expense.description} - ${expense.category} -${expense.amount}`
            ul.appendChild(expenseLi)
        }
        totalIncomeDisplay.innerHTML = `<h5>${monthlyInc}</h5>`
        totalExpenseDisplay.innerHTML = `<h5>${monthlyExp}</h5>`
        carryForwardDisplay.innerHTML = `<h5>${carryForward}</h5>`
        balanceDisplay.innerHTML = `<h5>${balance}</h5>`
    } catch (err) {
        console.log("error displaying monthly expenses: ", err);

    }
}

const containerDiv = document.querySelector('.container')
console.log("containerDiv ", containerDiv);


