
const api_url = 'http://localhost:5000'
const token = localStorage.getItem('token')
const reportForm = document.querySelector("#reportForm")
const monthSelect = document.getElementById("monthSelect");
const yearSelect = document.getElementById("yearSelect");
const submitBtn = document.querySelector(".submitBtn")
const h5Year = document.querySelector("#year")
const h5Month = document.querySelector("#month")
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
    localStorage.setItem("reportDetail", reportDetails)
    const monthIndex = parseInt(reportDetails.month, 10) - 1; //converts month number from string to integer
    const monthName= new Date(2000,monthIndex).toLocaleString('en-US',{month:"long"})
    h5Year.textContent = `${reportDetails.year}`
    h5Month.textContent = `${monthName} ${reportDetails.year}`
    localStorage.setItem("selectedReportMonth", monthName);
    localStorage.setItem("selectedReportYear", reportDetails.year);
   await getMonthReport(reportDetails)
})

window.addEventListener("DOMContentLoaded", async () => {
    const savedMonth = localStorage.getItem("selectedReportMonth");
    const savedYear = localStorage.getItem("selectedReportYear");
    if (savedMonth && savedYear) { 
        h5Year.textContent = `${savedYear}`
        h5Month.textContent = `${savedMonth} ${savedYear}`
    }
   
})

async function getMonthReport(repDetail) {
    try {
        const monthReport = await axios.get(`${api_url}/api/monthly/report/?month=${repDetail.month}&year=${repDetail.year}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        console.log("Getting month Report: ", monthReport);
    } catch (error) { 
        console.log("Error getting monthly report:  ", error);
    }
}
