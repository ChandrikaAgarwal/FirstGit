const yearDisplay = document.getElementById('yearDisplay')
const prevBtn = document.getElementById('prevbtn')
const nextBtn = document.getElementById('nextbtn')

let today = new Date()
let currentDay = today.getDate();
let currentMonth = today.getMonth()
let currentYear = today.getFullYear()
console.log("current Year: ", currentYear);

function formatYear(year, month, day) {
    let date = new Date(year, month, day)
    let yearName = date.toLocaleString('default', { year: 'numeric' })
    let options = { year: "numeric" };
    return date.toLocaleDateString('en-US', options);
}

function updateYearDisplay() {
    yearDisplay.textContent = formatYear(currentYear, currentMonth, currentDay)
    console.log("year display textContent: ", yearDisplay.textContent);
}

nextBtn.addEventListener("click", () => {
    currentYear++
    updateYearDisplay()
})

prevBtn.addEventListener("click", () => {
    currentYear--;
    updateYearDisplay();
})

updateYearDisplay();
