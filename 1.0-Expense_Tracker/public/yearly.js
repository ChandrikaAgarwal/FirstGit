const yearDisplay = document.getElementById('yearDisplay')
const prevBtn = document.getElementById('prevbtn')
const nextBtn = document.getElementById('nextbtn')
const api_url = 'http://localhost:5000'
let today = new Date()
let currentDay = today.getDate();
let currentMonth = today.getMonth()
let currentYear = today.getFullYear()
console.log("current Year: ", currentYear);
const token = localStorage.getItem('token')

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
