const monthDisplay = document.getElementById('monthDisplay')
const prevBtn = document.getElementById('prevbtn')
const nextBtn = document.getElementById('nextbtn')
const api_url = 'http://localhost:5000'
const displayExpenses = document.querySelector('.display_expenses')
const leaderBoard = document.querySelector('.leaderBoard a')
const tableBody = document.querySelector('.monthExpenses')
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
    displayMonthlyExpenses(monthlyResponse.data.allExpenses, monthlyResponse.data.allincomes, monthlyResponse.data.totalInc, monthlyResponse.data.totalExp, monthlyResponse.data.carryforward, monthlyResponse.data.balance)
    if (!monthlyResponse.data.isPremium) {
        leaderBoard.style.color = "gray"
        leaderBoard.style.cursor = "not-allowed"
        leaderBoard.addEventListener("click", function (event) {
            event.preventDefault();
            alert("This is a premium feature. Please upgrade to access!");
        });
    }

}
let totalIncomeDisplay = document.querySelector('.totalIncomeDisplay')
let totalExpenseDisplay = document.querySelector('.totalExpenseDisplay')
let carryForwardDisplay = document.querySelector('.cfDisplay')
let balanceDisplay = document.querySelector('.balanceDisplay')

async function displayMonthlyExpenses(allExpenses, allIncomes, monthlyInc, monthlyExp, carryForward, balance) {
    try {
       let mergedData=[]
        allExpenses.forEach(expense => { 
            mergedData.push({
                date: expense.createdAt.split('T')[0],
                description: expense.description,
                category: expense.category ,
                income: "",  // Expense ke liye income 0 rahega
                expense: expense.amount
            })
        })

        allIncomes.forEach(income => {
            mergedData.push({
                date: income.createdAt.split('T')[0],
                income: income.amount,
                description: income.description,
                category: "",
                expense:""
            })
        })
        mergedData.sort((a, b) => new Date(a.date) - new Date(b.date));
        tableBody.innerHTML = "";
        mergedData.forEach(entry => {
            const row = document.createElement('tr')
            row.innerHTML = `<td>${entry.date}</td> 
                             <td>${entry.description}</td> 
                             <td>${entry.category}</td> 
                             <td>${entry.income}</td> 
                             <td>${entry.expense}</td>`;
            tableBody.appendChild(row);
        })
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


document.querySelector('.premium_member').addEventListener("click", async () => {
    try {
        // const response = await fetch(`${api_url}/create-payment`, {
        const response = await fetch(`${api_url}/api/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        })
        console.log("response: ", response);

        const data = await response.json();
        console.log("Response from frontend for payment: ", data);
        const orderId = data.orderId
        console.log("orderId in frontend: ", orderId);

        if (data.paymentSessionId) {

            const cashfree = new window.Cashfree({ mode: "sandbox" });

            const result = await cashfree.checkout({
                paymentSessionId: data.paymentSessionId,
                redirectTarget: "_self",
            });

        } else {
            alert("Payment initiation failed!");
        }
        console.log("response from create-payment: ", data);


    } catch (err) {
        console.log("the error in payment:: ", err);

    }
})
