const weekDisplay = document.getElementById('weekDisplay')
const prevBtn = document.getElementById('prevbtn')
const nextBtn = document.getElementById('nextbtn')
// const api_url = 'http://15.206.27.247'
const api_url = "http://15.206.27.247";

const tableBody = document.querySelector('.weeklyExpenses')
let today = new Date()
let currentWeekStart = getStartOfWeek(today)
let currentWeekEnd = getEndOfWeek(today);
let currentYear=today.getFullYear()
const token = localStorage.getItem('token')
let startOfWeekISO = currentWeekStart.toISOString().split('T')[0]; // "2025-03-10"
let endOfWeekISO = currentWeekEnd.toISOString().split('T')[0];
console.log("startOfWeekISO ", startOfWeekISO);
console.log("endOfWeekISO ", endOfWeekISO);


function getStartOfWeek(date) {
    const start = new Date(date)
    const day = start.getDay() // Sunday = 0, Monday = 1, ...
    console.log("start date: ",start);
    start.setDate(start.getDate() - day);
    
    return start;
}
function getEndOfWeek(date) { 
    const end = new Date(date);
    const day = end.getDay();
    end.setDate(end.getDate() + (6 - day));// Shift to end of the week (Saturday)
    console.log("end date: ",end);
    
    return end;
}
function formatDate(date,includeYear=true) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: includeYear ? 'numeric' : undefined });
}
function convertToISOString(start,end) {
    startOfWeekISO = start.toISOString().split('T')[0]; // "2025-03-10"
    endOfWeekISO = end.toISOString().split('T')[0];
    
}
function updateWeekDisplay() {
    let startYear = currentWeekStart.getFullYear();
    let endYear = currentWeekEnd.getFullYear();
    if (startYear === endYear) {
        weekDisplay.textContent = `${formatDate(currentWeekStart,false)} - ${formatDate(currentWeekEnd)}`
    }else{
        weekDisplay.textContent = `${formatDate(currentWeekStart)} - ${formatDate(currentWeekEnd)}`
    }
    console.log("week display textContent: ", weekDisplay.textContent);
}

nextBtn.addEventListener("click", () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    currentWeekEnd.setDate(currentWeekEnd.getDate() + 7);
    convertToISOString(currentWeekStart, currentWeekEnd)
    updateWeekDisplay()
    getExpensesByWeek()
})

prevBtn.addEventListener("click", () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    currentWeekEnd.setDate(currentWeekEnd.getDate() - 7);
    convertToISOString(currentWeekStart, currentWeekEnd)
    updateWeekDisplay()
    getExpensesByWeek()
})

updateWeekDisplay();

window.addEventListener("DOMContentLoaded", async () => {
    getExpensesByWeek()
})

async function getExpensesByWeek() { 
    let weeklyResponse;
    try { 
        weeklyResponse = await axios.get(`${api_url}/api/monthly/weekly/?startDate=${startOfWeekISO}&endDate=${endOfWeekISO}&year=${currentYear}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        console.log("Getting expenses weekly: ", weeklyResponse);
        if (weeklyResponse.data.isPremium === true) {
            console.log("Premium user", weeklyResponse.data.isPremium);
            const paidUser = document.querySelector('.premiumUser')
            paidUser.textContent = "You are premium user"
        }
        await displayWeeklyExpenses(weeklyResponse.data.allExpenses, weeklyResponse.data.allincomes, weeklyResponse.data.totalExpense, weeklyResponse.data.totalIncome, weeklyResponse.data.carryForward, weeklyResponse.data.balance)
    } catch (error) { 
        console.log("Error in weekly expenses:  ", error);
    }

}
let totalIncomeDisplay = document.querySelector('.totalIncomeDisplay')
let totalExpenseDisplay = document.querySelector('.totalExpenseDisplay')
let carryForwardDisplay = document.querySelector('.cfDisplay')
let balanceDisplay = document.querySelector('.balanceDisplay')

async function displayWeeklyExpenses(weeklyExpenses, weeklyIncomes, weeklytotalExpense, weeklytotalIncome,weeklycarryForward,weeklyBalance) {
    try {
        let mergedData=[]
        weeklyExpenses.forEach(expense => { 
            mergedData.push({
                date: expense.createdAt.split('T')[0],
                description: expense.description,
                category: expense.category,
                income: "",
                expense: expense.amount,
            })
        })
        weeklyIncomes.forEach(income => {
            mergedData.push({
                date: income.createdAt.split('T')[0],
                income: income.amount,
                description: income.description,
                category: "",
                expense: ""
            })
        })
        mergedData.sort((a, b) => new Date(a.date) - new Date(b.date));
        tableBody.innerHTML = "";
        mergedData.forEach(item => { 
            const row = document.createElement('tr');
            row.innerHTML = `<td>${item.date}</td> 
                             <td>${item.description}</td> 
                             <td>${item.category}</td> 
                             <td>${item.income}</td> 
                             <td>${item.expense}</td>`; 
            tableBody.appendChild(row);
        })
        totalIncomeDisplay.textContent = `${weeklytotalIncome}`;
        totalExpenseDisplay.textContent = `${weeklytotalExpense}`;
        carryForwardDisplay.textContent = `${weeklycarryForward}`;
        balanceDisplay.textContent = `${weeklyBalance}`;
    } catch (err) {
        console.log("error displaying weekly expenses: ", err);
    }
}

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
