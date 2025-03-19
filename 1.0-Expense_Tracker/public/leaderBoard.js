// const allExpenseDisplay = document.querySelector('.showAllExpenses')
// const api_url = 'http://52.66.9.15:5000'
const api_url = "http://52.66.9.15:5000";

const token = localStorage.getItem('token')
window.addEventListener("DOMContentLoaded", async () => {
    try {
        const allExpenses = await axios.get(`${api_url}/api/leader`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        console.log("all users and expenses: ", allExpenses.data);
        if (allExpenses.data.isPremium === true) {
            console.log("Premium user", allExpenses.data.isPremium);
            const paidUser = document.querySelector('.premiumUser')
            paidUser.textContent = "You are premium user"
        }
        await displayLeader(allExpenses.data.userExpenses)
    } catch (err) {
        console.log("error in fetching leaderboard details: ", err);

    }
})
const showAllExpenses = document.querySelector('.showAllExpenses')
async function displayLeader(allExpenditures) {
    for (let expense of allExpenditures) {
        const leaderLi = document.createElement('li')
        leaderLi.innerHTML = `${expense.name}-Total Expense - ${expense.totalExpense}`
        showAllExpenses.appendChild(leaderLi)
    }
}
