const form = document.getElementById('expense-form')
const loginForm = document.getElementById('login-form')
const signupForm = document.getElementById('signup-form')
const loginBtn = document.getElementById('loginBtn')
const signupBtn = document.getElementById('signUpBtn')
const togBtn = document.getElementById("toggle")
const cat = document.getElementById("category")
const catlabel = document.getElementById("catlabel")
const api_url = 'http://localhost:5000'
const containerfluid = document.querySelector('.expense-Div')
const container = document.querySelector('.savingsandIncome')
const expense_list = document.createElement('ul')
expense_list.className = "allExpenses"
const usersDiv = document.getElementById('users')
const row = document.querySelector('.incomedisplay')
let listOfExpenses;

var userId;
if (signupForm) {
    const usersul = document.createElement('ul')
    usersul.className = "user_list"
    usersDiv.appendChild(usersul)
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        const newuserDetail = {
            name: e.target.name.value,
            email: e.target.email.value,
            password: e.target.password.value
        }
        console.log("newuserdetail ", newuserDetail);
        try {
            const res = await axios.post(`${api_url}`, newuserDetail)
            console.log("New User Detail: ", res.data);
            localStorage.setItem('token', res.data.token);
            alert("Signup successful! Please log in.");
            signupForm.reset()
            window.location.href = "/users"
        } catch (err) {
            console.error("Error: ", err.response)
            if (err.response && err.response.data.message) {
                alert(err.response.data.message)
                if (err.response.data.message === "User already exists.Please log in.") {
                    window.location.href = "/users"
                }
            } else {
                alert("An error occured, please try again!!")
            }
        }
    });
    loginBtn.addEventListener('click', () => {
        window.location.href = "/users"
    });
}
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        const userDetail = {
            email: e.target.email.value,
            password: e.target.password.value
        }
        console.log("userdetail ", userDetail);
        try {
            const res = await axios.post(`${api_url}/users`, userDetail)
            console.log("Login Successful User Detail: ", res.data);
            loginForm.reset()
            alert(res.data.message)

            localStorage.setItem('token', res.data.token);
            window.location.href = "/expenses"
        } catch (err) {
            console.error("Error: ", err.response)
            if (err.response && err.response.data.message) {
                alert(err.response.data.message)
                window.location.href = "http://localhost:5000";
            } else {
                alert("An error occured, please try again!!")
            }
        }
    })
    signupBtn.addEventListener('click', () => {
        window.location.href = "http://localhost:5000";
    });
}

if (form) {
    let prevdate = new Date();
    prevdate = prevdate.toISOString().split('T')[0];
    const token = localStorage.getItem('token')
    const showformbtn = document.querySelector('#show-form');
    console.log("Show form btn!!", showformbtn);

    if (!showformbtn) {
        console.error("Button not found!");

    }
    let icon = showformbtn.getElementsByTagName('i')[0];
    showformbtn.addEventListener('click', () => {
        if (showformbtn.classList.contains('collapsed')) {

            icon.classList.replace('fa-minus', 'fa-plus'); // Change back to plus
        } else {
            icon.classList.replace('fa-plus', 'fa-minus'); // Change to minus
        }
    })

    const dateDisplay = document.getElementById('dateDisplay')
    const prevBtn = document.getElementById('prevbtn')
    const nextBtn = document.getElementById('nextbtn')

    let today = new Date()
    let currentYear = today.getFullYear();

    let currentMonth = today.getMonth();

    let currentDay = today.getDate();

    let daysinMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

    function formatDate(year, month, day) {
        let date = new Date(year, month, day);
        prevdate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        console.log("prevDate: ", prevdate);
        let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        // let options={year: 'numeric', month: 'numeric', day: 'numeric'};
        return date.toLocaleDateString('en-US', options);
    }

    function updateDateDisplay() {
        console.log("current day on display ", currentDay); //15
        dateDisplay.textContent = formatDate(currentYear, currentMonth, currentDay)
        console.log("datedisplay::", dateDisplay);

    }

    function getExpensesOndate() {

        axios.get(`${api_url}/api/expenses/?carouseldate=${prevdate}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                console.log("Getting Expenses:: ", response);
            })
            .catch(err => console.log("error getting expenses ", err))

    }

    getExpensesOndate()
    nextBtn.addEventListener("click", () => {


        if (currentDay < daysinMonth) {
            currentDay++;
        }
        updateDateDisplay();
        getExpensesOndate()
        filterExpenses(prevdate)

    })

    prevBtn.addEventListener("click", async () => {
        console.log("current day: ", currentDay);  //16
        if (currentDay > 1) {
            currentDay--;
            console.log("currentday on prev: ", currentDay); //15

        }
        updateDateDisplay();
        getExpensesOndate()
        filterExpenses(prevdate)
    })

    //initial display
    updateDateDisplay()


    togBtn.addEventListener("click", (e) => {
        if (togBtn.textContent === "EXPENSE") {
            togBtn.textContent = "INCOME";
            cat.style.display = "none"
            // catlabel.style.display="none"

        } else {
            togBtn.textContent = "EXPENSE"
            cat.style.display = "flex"
            // catlabel.style.display="flex"
        }
    })
    container.appendChild(expense_list)
    const savingsDiv = document.createElement('div')
    savingsDiv.className = 'row savingsdisplay'
    savingsDiv.innerHTML = `<div class="col"><h4>Savings</h4></div> <div class="col savingsAmount"></div>`
    container.insertBefore(savingsDiv, row)
    const savingcol = document.querySelector('.savingsAmount')
    const incomeDiv = document.createElement('div')
    incomeDiv.className = 'col incomecol'
    row.appendChild(incomeDiv)
    const incomecol = document.querySelector('.incomecol')
    console.log(container);
    form.addEventListener("submit", async (e) => {
        e.preventDefault()

        if (togBtn.textContent === "EXPENSE") {
            console.log("i am in expense mode");
            const Detail = {
                amount: parseFloat(e.target.amount.value),
                description: e.target.description.value,
                category: e.target.category.value,
                // createdAt:prevdate- to send the date of creation of expense witht he request body
            }
            getExpensesOndate()
            await axios.post(`${api_url}/api/expenses/?date=${prevdate}`, Detail, { //sending date of creation as a query parameter
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then((response) => {
                    console.log("Expense Detail: ", response);
                    displayExpenses(response.data.expensedetail, response.data.expensedetail.id)
                    displaySavings(prevdate, response.data.expensedetail.currentsaving)


                }).catch(err => console.log(err))
        } else {
            console.log("i am in income mode");
            const incomeDetail = {
                amount: parseFloat(e.target.amount.value),
                description: e.target.description.value,
            }
            console.log("Income: ", incomeDetail);
            await axios.post(`${api_url}/api/income/?date=${prevdate}`, incomeDetail, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then((response) => {
                console.log("Income Details ", response.data);
                console.log("User id::", response.data.incomedetail.userId);
                userId = response.data.incomedetail.userId
                localStorage.setItem(userId, response.data.incomedetail.amount)
                displayIncome(prevdate, response.data.incomedetail.amount, response.data.incomedetail.id)
                displaySavings(prevdate, response.data.incomedetail.totalsaving)
            }).catch(err => console.log(err))
            form.reset()
        }

    })

    function displayIncome(createdAt, income, incomeid) {
        incomecol.innerHTML = "";
        const incomeLi = document.createElement('li')
        if (createdAt === prevdate) {
            incomeLi.innerHTML = `${income} <button class="editIncome"><i class="fa-solid fa-pen"></i></button><button class="deleteIncome"><i class="fa-solid fa-trash"></i></button>`
        }
        incomeLi.className = "incomedisplayed"
        incomeLi.dataset.id = incomeid
        incomecol.appendChild(incomeLi)
        console.log("income col innerhtml: ", incomecol.innerHTML);

        container.insertBefore(row, expense_list)
    }

    window.addEventListener("DOMContentLoaded", async () => {

        filterExpenses(prevdate)

    })
    function displaySavings(createdAt, savingsdone) {
        console.log("savingsdone::", savingsdone);
        console.log("Savings createdAt: ", prevdate);

        if (createdAt === prevdate) {
            savingcol.innerHTML = `<h4>${savingsdone}</h4>`
        }
    }

    async function filter(targetArr, carouseldate) {
        let filteredArray = await targetArr.filter(item => {
            let dateCreatedAt = item.createdAt.split("T")[0]
            console.log("Checking expense date ", dateCreatedAt);
            return dateCreatedAt === carouseldate;
        })
        return filteredArray
    }

    async function filterExpenses(date) {
        let incomecreatedAt = 0
        const incomeResponse = await axios.get(`${api_url}/api/income/?carouseldate=${date}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        console.log("incomeResponse on Specific date of carousel: ", incomeResponse.data);

        if (incomeResponse.data.income) {
            incomecreatedAt = incomeResponse.data.income.createdAt.split('T')[0]
            console.log("Getting Data on refresh!!", incomeResponse.data.savings);


            displayIncome(incomecreatedAt, incomeResponse.data.income.amount, incomeResponse.data.income.id)
            console.log("On refresh: ", incomeResponse.data.income.totalsaving);
            //    displaySavings(incomecreatedAt, incomeResponse.data.income.totalsaving) //to display the savings first
            // displaySavings(incomecreatedAt, incomeResponse.data.income.savings)
            displaySavings(incomecreatedAt, incomeResponse.data.totalsaving)
        } else {
            incomecol.innerHTML = "";
        }
        listOfExpenses = document.querySelector('.allExpenses')
        console.log("List of expenses: ", listOfExpenses);

        const response = await axios.get(`${api_url}/api/expenses/?carouseldate=${date}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        let allexpenses = response.data.expenses || [];
        let filteredExpenses = await filter(allexpenses, date)
        console.log("filtered Expenses:: ", filteredExpenses);

        expense_list.innerHTML = ""
        if (filteredExpenses.length > 0) {
            filteredExpenses.forEach(expense => displayExpenses(expense, expense.id))
            // if (incomeResponse.data.income) {
            //     // displaySavings(incomecreatedAt, incomeResponse.data.income.savings)
            //     displaySavings(incomecreatedAt, incomeResponse.data.savings)
            // } else {
            console.log("Expense on no income:: ", filteredExpenses.at(-1).currentsaving)
            displaySavings(date, filteredExpenses.at(-1).currentsaving) //bcz savings are being updated
            // }
        } else {
            if (incomeResponse.data.income) {
                displaySavings(incomecreatedAt, incomeResponse.data.income.totalsaving)
            } else {
                displaySavings(date, incomeResponse.data.savings) //for forwarding saving when no income and expense
                console.log("No expenses found for the date");
            }
        }
    }

    function displayExpenses(expenseDetail, id) {
        const newExpense = document.createElement('li')
        const details = [`${expenseDetail.amount}-${expenseDetail.description}-${expenseDetail.category}`]
        newExpense.innerHTML = details + '<button class="editExpense"><i class="fa-solid fa-pen"></i></button> <button class="deleteExpense"><i class="fa-solid fa-trash"></i></button> '
        newExpense.dataset.id = id
        newExpense.className = "expenseDisplayed"
        expense_list.appendChild(newExpense)

        form.reset()

    }

    const delBtn = document.querySelector('.deleteExpense')



    expense_list.addEventListener('click', async (e) => {
        try {
            console.log(e.target);
            const delBtn = e.target.closest('.deleteExpense');
            if (delBtn) {
                console.log("Expense Delete button clicked: ");
                const delItem = delBtn.parentElement;
                const id = delItem.dataset.id

                console.log("delItem: ", delItem);
                console.log("delItem.dataset: ", delItem.dataset);
                console.log("delItem.dataset.id: ", delItem.dataset.id);

                console.log("Delete btn clicked to delete an expense :", delItem, "of id: ", id);

                const deleteResponse = await axios
                    .delete(
                        `${api_url}/api/expenses/${id}`, {
                        params: {
                            prevdate
                        },
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                // listOfExpenses.removeChild(delItem)
                delItem.remove()
                // const expensedisplayed = document.querySelector(`[data-id='${id}']`)
                // console.log("expense to delete ",expensedisplayed);
                // expensedisplayed.innerHTML=""
                console.log("Delete API Response: ", deleteResponse.data);
            }

            const res = await axios.get(`${api_url}/api/expenses?carouseldate=${prevdate}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            console.log("Response after expense deletion: ", res.data.expenses);
            if (res.data.expenses.length > 0) {
                displaySavings(prevdate, res.data.expenses.at(-1).currentsaving)
            } else {
                const incomeRes = await axios.get(`${api_url}/api/income?carouseldate=${prevdate}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                console.log("Income response:: ", incomeRes);
                if (incomeRes.data.income) {
                    displaySavings(prevdate, incomeRes.data.income.totalsaving)
                } else {

                    displaySavings(prevdate, incomeRes.data.savings)
                }

            }



            // if (incomeResponse.data.income) {

            //     console.log("Getting Data on refresh!!", incomeResponse.data);

            //     displayIncome(prevdate, incomeResponse.data.income.amount, incomeResponse.data.income.id)
            //     console.log("On refresh: ", incomeResponse.data.income.totalsaving);
            //     displaySavings(prevdate, incomeResponse.data.income.totalsaving) //to display the savings first
            // }



        } catch (err) {
            console.log("The error is:: ", err.response ? err.response.data : err.message);

            console.log("the error is:: ", err);
        }
    });

    const editBtn = document.querySelector('.editExpense')
    expense_list.addEventListener('click', async (e) => {
        const token = localStorage.getItem('token');
        if (e.target.classList.contains('edit')) {
            const editItem = e.target.parentElement;
            const id = editItem.dataset.id
            await axios.get(`${api_url}/api/expenses/${id}`, {
                params: {
                    prevdate
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(async (res) => {
                    console.log("To edit expense: ", res.data.expense);
                    expense_list.removeChild(editItem)
                    let editExpense = populateFields(res.data.expense)
                    const response = await axios.put(`${api_url}/api/expenses/${id}`, editExpense, {
                        params: {
                            prevdate
                        },
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                    console.log("Response: ", response);
                    const incomeResponse = await axios.get(`${api_url}/api/income/?carouseldate=${prevdate}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                    if (incomeResponse.data.income) {

                        console.log("Getting Data on refresh!!", incomeResponse.data);

                        // const storedincome=localStorage.getItem(incomeResponse.data.income.userId)
                        displayIncome(prevdate, incomeResponse.data.income.amount, incomeResponse.data.income.id)
                        console.log("On refresh: ", incomeResponse.data.income.totalsaving);
                        displaySavings(prevdate, incomeResponse.data.income.totalsaving) //to display the savings first
                    }


                })
                .catch(err => console.log(err))
        }
    });

    function populateFields(response) {
        let amount = document.getElementById('amount').value = response.amount;
        let description = document.getElementById('description').value = response.description;
        let category = document.getElementById('category').value = response.category;
        return editExpense = { amount, description, category }
    }

    const incomeDel = document.querySelector(".deleteIncome")


    document.addEventListener('click', async (e) => {
        if (e.target.closest('.deleteIncome')) {
            console.log("Income Delete button: ", incomeDel);
            const deleteItem = e.target.closest(".incomedisplayed")
            const id = deleteItem.dataset.id
            console.log("Delete Button Clicked for item : ", deleteItem, "of id ", id);
            axios.delete(
                `${api_url}/api/income/${id}`, {
                params: {
                    prevdate
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(async (response) => {
                    console.log("Response on delete: ", response);
                    incomecol.removeChild(deleteItem)
                    incomecol.innerHTML = ""
                    await axios.get(`${api_url}/api/income?carouseldate=${prevdate}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                        .then(response => {
                            console.log("Response on getting the savings after delete: ", response);
                            if (response.data.income) {

                                displayIncome(prevdate, response.data.income.amount, response.data.income.id)
                            }
                            displaySavings(prevdate, response.data.savings)


                        }).catch(err => console.log("Error in getting after deletion: ", err))

                }).catch(err => console.log("Error deleting income ", err))
        }
    })
}


