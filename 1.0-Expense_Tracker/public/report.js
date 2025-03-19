// const api_url = 'http://localhost:5000'
const api_url = "http://localhost:5000";

const token = localStorage.getItem('token')
const reportForm = document.querySelector("#reportForm")
const monthSelect = document.getElementById("monthSelect");
const yearSelect = document.getElementById("yearSelect");
const submitBtn = document.querySelector(".submitBtn")
const h5Year = document.querySelector("#year")
const h5Month = document.querySelector("#month")
const tableBody = document.querySelector('.displayMonthReport')
const yearTable = document.querySelector('.displayYearReport')
let reportDetails;
let selectedMonth
let selectedYear
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
    await getYearlyReport(reportDetails.year)
    h5Year.textContent = reportDetails.year
    let monthIndex = parseInt(reportDetails.month)
    console.log("monthIndex: ",monthIndex);
    h5Month.textContent = new Date(2000, monthIndex - 1).toLocaleString('en-US', { month: 'long' }) + " " + reportDetails.year;
    selectedMonth = monthIndex
    selectedYear = reportDetails.year
   
})

window.addEventListener("DOMContentLoaded", async () => {
    let today = new Date();
    let currentMonth = today.getMonth()+1
    let freshYear = today.getFullYear()
    yearSelect.value = freshYear
    monthSelect.value = String(currentMonth).padStart(2, "0"); 
    h5Year.textContent = freshYear
    h5Month.textContent = monthSelect.options[monthSelect.selectedIndex].text + " " + freshYear
    selectedMonth = currentMonth
    selectedYear = freshYear
    console.log("selected values: ",selectedMonth,selectedYear);
    
    await getMonthReport(freshYear, currentMonth)
    await getYearlyReport(freshYear)
    await loadReports();
    
   
})

async function getMonthReport(year,month) {
    try {
        const monthReport = await axios.get(`${api_url}/api/monthly/monthReport/?month=${month}&year=${year}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        console.log("Getting month Report: ", monthReport);
        if (monthReport.data.responseData.isPremium === true) {
            console.log("Premium user", monthReport.data.responseData.isPremium);
            const paidUser = document.querySelector('.premiumUser')
            paidUser.textContent = "You are premium user"
        }
        displayMonthlyReport(monthReport.data.responseData.allexpenses, monthReport.data.responseData.allincomes, monthReport.data.responseData.totalIncome, monthReport.data.responseData.totalExpense, monthReport.data.responseData.carryForward, monthReport.data.responseData.balance)
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
        <td colspan="3" class="total">Total</td>
        <td>${monthlyInc.toFixed(2)}</td>
        <td>${monthlyExp.toFixed(2)}</td>
    </tr>
    <tr style="font-weight: bold; background-color: #333; color: white;">
    <td colspan="3" class="cf">Carry Forward (C/F)</td>
    <td></td>
        <td>${carryForward.toFixed(2)}</td>
    </tr>
    <tr style="font-weight: bold; background-color: #444; color: lightgreen;">
        <td colspan="3" class="save">Savings</td>
        <td></td>
        <td>${balance.toFixed(2)}</td>
    </tr>`;
    } catch (err) {
        console.log("error displaying monthly report: ", err);
    }
}

async function getYearlyReport(year) {
    try { 
        const yearReport = await axios.get(`${api_url}/api/monthly/yearReport/?year=${year}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        console.log("year report : ", yearReport);
        await displayYearlyReport(yearReport.data.responseData.allMonths, yearReport.data.responseData.totalIncome, yearReport.data.responseData.totalExpense, yearReport.data.responseData.totalcf, yearReport.data.responseData.totalBalance)
    } catch (err) { 
        console.log("Error getting yearly report:  ", err);
    }
}

async function displayYearlyReport(yearReport,yearInc,yearExp,yearCf,yearBalance) {
    try {
        yearTable.innerHTML = ""
        yearReport.forEach(entry => {
            let monthName = new Date(2000, entry.monthNum - 1).toLocaleString('en-US', { month: 'long' })
            const row = document.createElement('tr')
            row.innerHTML = `<td>${monthName}</td>
            <td>${entry.totalIncome}</td>
            <td>${entry.totalExpense}</td>
            <td>${entry.carryForward}</td>
            <td>${entry.balance}</td>`;
            yearTable.appendChild(row);
        })
        yearTable.innerHTML += ` <tr style="font-weight: bold; background-color: #333; color: white;">
        <td>Total</td>
        <td>${yearInc}</td>
        <td>${yearExp}</td>
        <td>${yearCf}</td>
        <td>${yearBalance}</td>
         `
    } catch (err) { 
        console.log("error displaying yearly report: ", err);

     }
}
//allexpensereportbucket 
document.getElementById("download-report").addEventListener("click", async () => {
    try {
        const dwnldReport = await axios.get(`${api_url}/api/monthly/downloadRep/?month=${selectedMonth}&year=${selectedYear}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        console.log("Response on clicking Download: ", dwnldReport);
        if (dwnldReport.status === 200) {
            var a = document.createElement('a')
            a.href = dwnldReport.data.fileURL
            a.download = 'myexpense.csv';
            a.click()
            await loadReports()
        } else {
            throw new Error(dwnldReport.data.message)
        }
    } catch (err) {
        console.log("error downloading report: ",err);
        
    }
})

async function loadReports() {
    try {
        const linkRes = await axios.get(`${api_url}/api/monthly/reportLinks`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        console.log("Response on clicking load reports: ", linkRes);
        //link-list
        let fileUrls=linkRes.data.fileUrls
        const tableBody = document.getElementById("link-list");
        tableBody.innerHTML = "";
        fileUrls.forEach((file, index)=> {
            const row = `<tr>
          <td>${index + 1}</td>
          <td>${new Date(file.createdAt).toLocaleString()}</td>
          <td><a href="${file.url}">Download Report</a></td>
          </tr>`  
            tableBody.innerHTML += row;
        })
     } catch (err) {
        console.log("error loading all links: ",err);
        
    }
}
    
    // const { jsPDF } = window.jspdf;
    // const doc = new jsPDF();

    // //title
    // doc.setFontSize(18);
    // doc.text(`Expense Report -${h5Month.textContent}`, 10, 10);

    // let monthlyData = [
    //     ["Date", "Description", "Category", "Income", "Expense"]
    // ];
    
    // let tableRows = document.querySelectorAll(".displayMonthReport tr")
    // tableRows.forEach(row => { 
    //     let cells = row.querySelectorAll('td');
    //     let rowData = [];
    //     cells.forEach(cell => rowData.push(cell.textContent));
    //     monthlyData.push(rowData);
    // })
    // if (monthlyData.length > 1) {
    //     doc.autoTable({
    //         head: [monthlyData[0]], // Header row
    //         body: monthlyData.slice(1), // Data rows
    //         startY: 20, // Adjust the starting position
    //         columnStyles: {
    //             3: { halign: "right" },
    //             4:{halign:"right"}
    //         }
    //     });
        
    // } else {
    //     doc.setFontSize(14);
    //     doc.text("No data available", 10, 20);
    // }
    
    // doc.text(`Yearly Report - ${yearSelect.value}`, 10, doc.lastAutoTable.finalY + 10);
    // let yearlyData = [
    //     ["Month", "Total Income", "Total Expense", "Carry Forward", "Balance"]
    // ];
    // let yearTableRows = document.querySelectorAll(".displayYearReport tr")
    // yearTableRows.forEach(row => { 
    //     let cells = row.querySelectorAll('td');
    //     let rowData = [];
    //     cells.forEach(cell => rowData.push(cell.textContent));
    //     yearlyData.push(rowData);
    // })
    // if (yearlyData.length > 1) { 
    //     doc.autoTable({
    //         head: [yearlyData[0]],
    //         body: yearlyData.slice(1),
    //         startY: doc.lastAutoTable.finalY + 20
    //     });
    // } else {
    //     doc.setFontSize(14);
    //     doc.text("No data available", 10, 20);
    // }
    // doc.save(`Expense_Report_${h5Month.textContent}.pdf`);