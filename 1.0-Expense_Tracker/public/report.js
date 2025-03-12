const api_url = 'http://localhost:5000'
const token = localStorage.getItem('token')
const reportForm = document.querySelector("#reportForm")
const monthSelect = document.getElementById("monthSelect");
const yearSelect = document.getElementById("yearSelect");
const submitBtn = document.querySelector(".submitBtn")
const h5Year = document.querySelector("#year")
const h5Month = document.querySelector("#month")
const tableBody = document.querySelector('.displayReport')
let reportDetails;
for (let i = 0; i < 12; i++) {
    const monthName = new Date(2000, i).toLocaleString('en-US', { month: 'long' });
    monthSelect.innerHTML += `<option value="${String(i + 1).padStart(2, "0")}">${monthName}</option>`;
}
const currentYear = new Date().getFullYear();
const startYear = currentYear - 10;
const endYear = currentYear + 10;
const years = [...Array(endYear - startYear + 1)].map((_, i) => startYear + i);;
years.forEach(year => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
});


reportForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    reportDetails={
        month : e.target.monthSelect.value,
        year : e.target.yearSelect.value,
    }
    console.log("report Details: ", reportDetails);
    await getMonthReport(reportDetails.year, reportDetails.month)
    h5Year.textContent = reportDetails.year
    let monthIndex = parseInt(reportDetails.month)
    console.log("monthIndex: ",monthIndex);
    
    h5Month.textContent = new Date(2000, monthIndex - 1).toLocaleString('en-US', { month: 'long' }) + " " + reportDetails.year;
   
})

window.addEventListener("DOMContentLoaded", async () => {
    let today = new Date();
    let currentMonth = today.getMonth()+1
    let freshYear = today.getFullYear()
    yearSelect.value = freshYear
    monthSelect.value = String(currentMonth).padStart(2, "0"); 
    h5Year.textContent = freshYear
    h5Month.textContent = monthSelect.options[monthSelect.selectedIndex].text+" "+freshYear
    await getMonthReport(freshYear,currentMonth)
    
   
})

async function getMonthReport(year,month) {
    try {
        const monthReport = await axios.get(`${api_url}/api/monthly/report/?month=${month}&year=${year}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        console.log("Getting month Report: ", monthReport);
        displayMonthlyReport(monthReport.data.allExpenses, monthReport.data.allincomes, monthReport.data.totalInc, monthReport.data.totalExp, monthReport.data.carryforward,monthReport.data.balance)
    } catch (error) { 
        console.log("Error getting monthly report:  ", error);
    }
}

async function displayMonthlyReport(allExpenses, allIncomes, monthlyInc, monthlyExp, carryForward, balance) {
    try {
        let mergedData = []
        allExpenses.forEach(expense => {
            mergedData.push({
                date: expense.createdAt.split('T')[0],
                description: expense.description,
                category: expense.category,
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
                expense: ""
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
        tableBody.innerHTML += `
    <tr style="font-weight: bold; background-color: #333; color: white;">
        <td colspan="3">Total</td>
        <td>${monthlyInc.toFixed(2)}</td>
        <td>${monthlyExp.toFixed(2)}</td>
    </tr>
    <tr style="font-weight: bold; background-color: #333; color: white;">
    <td colspan="4">Carry Forward (C/F)</td>
        <td>${carryForward.toFixed(2)}</td>
    </tr>
    <tr style="font-weight: bold; background-color: #444; color: lightgreen;">
        <td colspan="4">Savings</td>
        <td>${balance.toFixed(2)}</td>
    </tr>`;
    } catch (err) {
        console.log("error displaying monthly report: ", err);
    }
}