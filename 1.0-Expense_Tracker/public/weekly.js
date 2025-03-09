const weekDisplay = document.getElementById('weekDisplay')
const prevBtn = document.getElementById('prevbtn')
const nextBtn = document.getElementById('nextbtn')
const api_url = 'http://localhost:5000'
let today = new Date()
let currentWeekStart = getStartOfWeek(today)
let currentWeekEnd = getEndOfWeek(today);
const token = localStorage.getItem('token')

function getStartOfWeek(date) {
    const start = new Date(date)
    const day = start.getDay() // Sunday = 0, Monday = 1, ...
    start.setDate(start.getDate() - day);
    return start;
}
function getEndOfWeek(date) { 
    const end = new Date(date);
    const day = end.getDay();
    end.setDate(end.getDate() + (6 - day));// Shift to end of the week (Saturday)
    return end;
}
function formatDate(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function updateWeekDisplay() {
    weekDisplay.textContent = `${formatDate(currentWeekStart)} - ${formatDate(currentWeekEnd)}`
    console.log("week display textContent: ", weekDisplay.textContent);
}

nextBtn.addEventListener("click", () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    currentWeekEnd.setDate(currentWeekEnd.getDate() + 7);

    updateWeekDisplay()
})

prevBtn.addEventListener("click", () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    currentWeekEnd.setDate(currentWeekEnd.getDate() - 7);

    updateWeekDisplay()
})

updateWeekDisplay();

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
