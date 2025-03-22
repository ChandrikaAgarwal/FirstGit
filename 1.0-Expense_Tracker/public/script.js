const form = document.getElementById('expense-form')
const loginForm = document.getElementById('login-form')
const signupForm = document.getElementById('signup-form')
const passwordForm = document.querySelector('#forgotPasswordForm')
const loginBtn = document.getElementById('loginBtn')
const signupBtn = document.getElementById('signUpBtn')
const forgotPasswordBtn = document.querySelector('#forgotPasswordBtn')
const togBtn = document.getElementById("toggle")
const cat = document.getElementById("category")
const catlabel = document.getElementById("catlabel")
// const api_url = 'http://15.206.27.247'
const api_url = "http://15.206.27.247";

const containerfluid = document.querySelector('.expense-Div')
const container = document.querySelector('.savingsandIncome')
const paginationContainer = document.getElementById("pagination");
const expense_list = document.createElement('ul')
expense_list.className = "allExpenses"
const usersDiv = document.getElementById('users')
const row = document.querySelector('.incomedisplay')
const addBtn = document.getElementById('add')
const saveBtn = document.getElementById('save')
const cancelBtn = document.getElementById('cancel')
let premiumLinks = document.querySelectorAll('.leaderBoard a, .monthly a, .weekly a, .report a')
console.log("premiumLinks: ", premiumLinks);
const rowsPerPageform = document.createElement('form')
const selectLimit = document.createElement('select')
selectLimit.id = "expenseLimit"
let listOfExpenses;
let isEditing = false;
console.log("Bootstrap ", bootstrap);


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
            phone: e.target.phone.value,
            password: e.target.password.value
        }
        console.log("phone length: ", (newuserDetail.phone.length));
        let newPhone = newuserDetail.phone.trim()
        console.log("new phone length :",newPhone.length);
        
        let hasSpace=newPhone.indexOf(" ")
        if (newPhone.length !== 10 || hasSpace >= 0) {
            console.log("entering if");
            alert("Enter a valid phone number")
            return
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
            console.log("error in signing up: ", err);

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
    forgotPasswordBtn.addEventListener("click", async (e) => {
        passwordForm.style.display = "flex"
    })
    passwordForm.addEventListener('submit', async (event) => {
        event.preventDefault()
        const emailtoSend = {
            email: event.target.email.value
        }
        console.log("email id: ", emailtoSend);
        passwordForm.style.display = "none"
        try {
            const forgotpassres = await axios.post(`${api_url}/password/forgotpassword`, emailtoSend)
            console.log("forgot password response: ", forgotpassres);

        } catch (err) {
            console.log("error in forgt password: ", err);

        }
    })
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
            console.log("error in logging in: ", err);

            console.error("Error: ", err.response)
            if (err.response && err.response.data.message) {
                alert(err.response.data.message)
                window.location.href = "/";
            } else {
                alert("An error occured, please try again!!")
            }
        }
    })
    signupBtn.addEventListener('click', () => {
        window.location.href = "/";
    });
}

if (form) {
    let currentPage = 1;
    let prevdate = new Date();
    prevdate = prevdate.toISOString().split('T')[0];
    const token = localStorage.getItem('token')
    const showformbtn = document.querySelector('#show-form');
    console.log("Show form btn!!", showformbtn);
    let icon = showformbtn.getElementsByTagName('i')[0];
    console.log("icon: ", icon);


    if (!showformbtn) {
        console.error("Button not found!");

    }
    showformbtn.addEventListener('click', () => {
        console.log("show form button clicked");

        if (showformbtn.classList.contains('collapsed')) {

            icon.classList.replace('fa-minus', 'fa-plus'); // Change back to plus
            form.reset()
        } else {
            icon.classList.replace('fa-plus', 'fa-minus');// Change to minus
            saveBtn.style.display = "none"
            cancelBtn.style.display = "none";
            addBtn.style.display = "block";
        }
    })
    // showformbtn.addEventListener('click', () => {
    //     console.log("show form button clicked");

    //     if (form.classList.contains("show")) {
    //         console.log("form showing ");
    //         console.log("icon :",icon);           
    //         icon.classList.replace('fa-minus', 'fa-plus'); // Change back to plus
    //         form.reset()
    //     } else if (!form.classList.contains("show")) {
    //         icon.classList.replace('fa-plus', 'fa-minus');// Change to minus
    //         saveBtn.style.display = "none"
    //         cancelBtn.style.display = "none";
    //         addBtn.style.display = "block";
    //     }
    // })
    const limitLabel = document.createElement('label')
    limitLabel.setAttribute('for', 'expenseLimit')
    limitLabel.textContent = "Rows per page:"
    paginationContainer.appendChild(limitLabel)
    for (let i = 1; i <= 100; i++) {
        let option = document.createElement('option')
        option.value = i;
        option.textContent = i;
        selectLimit.appendChild(option)
    }
    paginationContainer.appendChild(selectLimit)
    let expensesPerPage = localStorage.getItem('expensesPerPage') || 10;
    selectLimit.value = expensesPerPage
    selectLimit.addEventListener('change', () => {
        expensesPerPage = selectLimit.value
        localStorage.setItem('expensesPerPage', expensesPerPage)
        fetchExpenses(1)
    })
    const dateDisplay = document.getElementById('dateDisplay')
    const prevBtn = document.getElementById('prevbtn')
    const nextBtn = document.getElementById('nextbtn')

    let today = new Date()
    let currentYear = today.getFullYear();

    let currentMonth = today.getMonth();

    let currentDay = today.getDate();

    function getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    function formatDate(year, month, day) {
        let date = new Date(year, month, day);
        prevdate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        console.log("prevDate: ", prevdate);
        let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    function updateDateDisplay() {
        console.log("current day on display ", currentDay); //15
        dateDisplay.textContent = formatDate(currentYear, currentMonth, currentDay)
        console.log("datedisplay::", dateDisplay);

    }

    nextBtn.addEventListener("click", async () => {
        let daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);

        if (currentDay < daysInCurrentMonth) {
            currentDay++;
            console.log("current day : ", currentDay);
        } else {
            currentDay = 1;
            if (currentMonth < 11) {
                currentMonth++;
            } else {
                currentMonth = 0;  //january
                currentYear++;
            }
        }
        currentPage = 1;
        updateDateDisplay();
        filterExpenses(prevdate)
        await fetchExpenses(currentPage)

    })

    prevBtn.addEventListener("click", async () => {
        console.log("current day: ", currentDay);  //16
        if (currentDay > 1) {
            currentDay--;
            console.log("currentday on prev: ", currentDay); //15  
        } else {
            if (currentMonth > 0) {
                currentMonth--;
            } else {
                currentMonth = 11; //december
                currentYear--;
            }
            currentDay = getDaysInMonth(currentYear, currentMonth);
        }
        currentPage = 1;
        updateDateDisplay();
        filterExpenses(prevdate)
        await fetchExpenses(currentPage)
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
    savingsDiv.className = 'container d-flex savingsdisplay'
    savingsDiv.innerHTML = `<div class="container col savingsHead"><h4>Savings</h4><h4 class="savingsAmount"></h4></div>`
    container.insertBefore(savingsDiv, row)
    const savingcol = document.querySelector('.savingsAmount')
    const incomeDiv = document.createElement('div')
    // incomeDiv.className = 'col incomecol'
    // row.appendChild(incomeDiv)
    // const incomecol = document.querySelector('.incomecol')
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
            try {
                const response = await axios.post(`${api_url}/api/expenses/?date=${prevdate}`, Detail, { //sending date of creation as a query parameter
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                console.log("Expense Detail: ", response);
                // displayExpenses(response.data.expensedetail, response.data.expensedetail.id)
                await fetchExpenses(1);
                displaySavings(prevdate, response.data.expensedetail.currentsaving)
                form.reset()

            } catch (err) {
                console.log("error posting an expense: ", err);

            }
        } else {
            console.log("i am in income mode");
            const incomeDetail = {
                amount: parseFloat(e.target.amount.value),
                description: e.target.description.value,
            }
            console.log("Income: ", incomeDetail);
            try {
                const response = await axios.post(`${api_url}/api/income/?date=${prevdate}`, incomeDetail, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                console.log("Income Details ", response.data);
                console.log("User id::", response.data.incomedetail.userId);
                userId = response.data.incomedetail.userId
                localStorage.setItem(userId, response.data.incomedetail.amount)
                displayIncome(prevdate, response.data.incomedetail.amount, response.data.incomedetail.id, response.data.incomedetail.description)
                displaySavings(prevdate, response.data.incomedetail.totalsaving)
            } catch (err) {
                console.log("Error posting income:: ", err);
            }
            form.reset()
        }

    })
    const incomeul = document.querySelector('#incomeul')
    console.log("incomeUL table:: ", incomeul);
    const incomeTable = document.querySelector('.incomeTable')


    function displayIncome(createdAt, income, incomeid, description) {
        const incomeLi = document.createElement('tr')
        // incomecol.innerHTML = "";
        if (createdAt === prevdate) {
            incomeLi.innerHTML = `<td>${description}</td> <td>${income} <button class="editIncome"><i class="fa-solid fa-pen"></i></button><button class="deleteIncome"><i class="fa-solid fa-trash"></i></button> </td>`
            // incomeLi.innerHTML = `${income} <button class="editIncome"><i class="fa-solid fa-pen"></i></button><button class="deleteIncome"><i class="fa-solid fa-trash"></i></button>`
        }
        incomeLi.className = "incomedisplayed"
        incomeLi.dataset.id = incomeid
        incomeul.appendChild(incomeLi)
        // console.log("income col innerhtml: ", incomecol.innerHTML);

        container.insertBefore(row, expense_list)
        container.insertBefore(row, incomeTable)
    }

    window.addEventListener("DOMContentLoaded", async () => {
        await fetchExpenses(currentPage)
        await filterExpenses(prevdate)

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
            console.log("Checking date ", dateCreatedAt);
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

        if (incomeResponse.data.income && incomeResponse.data.allincomesonDate.length > 0) {
            incomeul.innerHTML = "";
            incomecreatedAt = incomeResponse.data.income.createdAt.split('T')[0]
            console.log("Getting Data on refresh!!", incomeResponse.data.savings);
            let arrofincomes = incomeResponse.data.allincomesonDate
            for (let income of arrofincomes) {
                let incomeDate = income.createdAt.split('T')[0]
                displayIncome(incomeDate, income.amount, income.id, income.description)

            }

            console.log("On refresh: ", incomeResponse.data.income.totalsaving);
            displaySavings(incomecreatedAt, incomeResponse.data.income.totalsaving)//for ke bahar
        }
        else {
            incomeul.innerHTML = "";
        }
        listOfExpenses = document.querySelector('.allExpenses')
        console.log("List of expenses: ", listOfExpenses);

        const response = await axios.get(`${api_url}/api/expenses?carouseldate=${date}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        console.log("response for is Premium: ", response);

        let allexpenses = response.data.expenses || [];
        let filteredExpenses = await filter(allexpenses, date)
        console.log("filtered Expenses:: ", filteredExpenses);

        expense_list.innerHTML = ""
        if (response.data.isPremium === true) {
            console.log("Premium user", response.data.isPremium);
            const paidUser = document.querySelector('.premiumUser')
            paidUser.textContent = "You are premium user"
        } else {
            console.log("not a premium user");
            premiumLinks.forEach(link => {
                console.log("link: ", link);

                link.style.color = "grey";
                link.style.cursor = "not-allowed";

                link.addEventListener("click", function (event) {
                    console.log("Leaderboard Clicked! Preventing default...");
                    event.preventDefault();

                    alert("This is a premium feature. Please upgrade to access!");
                });
            })
        }
        if (filteredExpenses.length > 0) {
            await fetchExpenses(currentPage)
            // filteredExpenses.forEach(expense => displayExpenses(expense, expense.id))
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



    function displayExp(expenses, totalPages, currentPage) {

        expense_list.innerHTML = "";
        // paginationContainer.innerHTML = "";
        expenses.forEach(expense => {
            const newExpense = document.createElement('li');
            newExpense.innerHTML = `${expense.amount} - ${expense.description} - ${expense.category}
            <button class="editExpense"><i class="fa-solid fa-pen"></i></button>
            <button class="deleteExpense"><i class="fa-solid fa-trash"></i></button>
        `;
            newExpense.dataset.id = expense.id;
            newExpense.className = "expenseDisplayed";
            expense_list.appendChild(newExpense);
        })
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
                delItem.remove()
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

        } catch (err) {
            console.log("The error is:: ", err.response ? err.response.data : err.message);

            console.log("the error is:: ", err);
        }
    });

    const editBtn = document.querySelector('.editExpense')
    expense_list.addEventListener('click', async (e) => {
        try {
            let newExpenseDetail;
            let key = "expense"
            if (e.target.closest('.editExpense')) {
                const editItem = e.target.closest(".expenseDisplayed");
                const id = editItem.dataset.id
                console.log("edit Button clicked for expense: ", editItem, "of id: ", id)

                openFormtoEditExpense()
                cancelBtn.style.display = "block";
                saveBtn.style.display = "block";
                addBtn.style.display = "none";
                isEditing = true;
                const expensebyId = await axios.get(`${api_url}/api/expenses/${id}`, {
                    params: {
                        prevdate
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                console.log("To edit expense: ", expensebyId);

                let fetchedExpense = populateFields(expensebyId, key)
                if (isEditing) {
                    console.log("is editing in put of expense: ", isEditing);
                    saveBtn.addEventListener("click", async () => {
                        newExpenseDetail = {
                            amount: document.getElementById('amount').value,
                            description: document.getElementById('description').value,
                            category: document.getElementById('category').value,
                        }
                        listOfExpenses.removeChild(editItem)
                        console.log("new expense details: ", newExpenseDetail);
                        try {
                            const newExpense = await axios.put(`${api_url}/api/expenses/${id}`, newExpenseDetail, {
                                params: {
                                    prevdate
                                },
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            })
                            console.log("response from put request: ", newExpense);
                            await fetchExpenses(currentPage)
                            form.reset()
                            // displayExpenses(newExpenseDetail, id)
                            try {
                                const getIncomeonDate = await axios.get(`${api_url}/api/income?carouseldate=${prevdate}`, {
                                    headers: {
                                        Authorization: `Bearer ${token}`
                                    }
                                })
                                console.log("Response on getting the savings after delete: ", getIncomeonDate);
                                displaySavings(prevdate, getIncomeonDate.data.savings)
                            } catch (err) {
                                console.log("error getting incomes after edit: ", err);

                            }
                        } catch (err) {
                            console.log("error editing expense: ", err);

                        }
                    })
                }
            }
        } catch (err) {
            console.log("error in expense list: ", err);
        }
    })


    function populateFields(response, identifier) {
        if (identifier === "expense") {
            let amount = document.getElementById('amount').value = response.data.expense.amount;
            let description = document.getElementById('description').value = response.data.expense.description;
            let category = document.getElementById('category').value = response.data.expense.category;
            return modifyExpense = { amount, description, category }
        } else {
            let amount = document.getElementById('amount').value = response.data.editincome.amount;
            let description = document.getElementById('description').value = response.data.editincome.description;
            return modifyIncome = {
                amount, description
            }
        }
    }

    const incomeDel = document.querySelector(".deleteIncome")


    document.addEventListener('click', async (e) => {
        if (e.target.closest('.deleteIncome')) {
            console.log("Income Delete button: ", incomeDel);
            const deleteItem = e.target.closest(".incomedisplayed")
            const id = deleteItem.dataset.id
            console.log("Delete Button Clicked for item : ", deleteItem, "of id ", id);
            try {
                const response = await axios.delete(
                    `${api_url}/api/income/${id}`, {
                    params: {
                        prevdate
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                console.log("Response on delete: ", response);
                incomeul.removeChild(deleteItem)
                // incomecol.innerHTML = ""
                try {
                    const res = await axios.get(`${api_url}/api/income?carouseldate=${prevdate}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                    console.log("Response on getting the savings after delete: ", res);
                    displaySavings(prevdate, res.data.savings)

                } catch (err) {
                    console.log("Error in getting after deletion: ", err)
                }

            } catch (err) {
                console.log("Error in deleting income: ", err);
            }
        }
    })

    function openFormtoEditIncome() {
        if (!form.classList.contains("show")) {
            showformbtn.click();

        }
        if (togBtn.textContent === "EXPENSE") {
            togBtn.click();
        }
    }

    function openFormtoEditExpense() {
        if (!form.classList.contains("show")) {
            showformbtn.click();
        }
        if (togBtn.textContent === "INCOME") {
            togBtn.click();
        }
    }

    cancelBtn.addEventListener('click', () => {
        console.log("cancel btn clicked");

        isEditing = false;
        console.log("is Editing:: ", isEditing);

        cancelBtn.style.display = "none"
        form.reset()
        showformbtn.click()
    })


    document.addEventListener('click', async (e) => {
        try {
            let editedIncome
            let newIncomeDetail;
            let key = "income";
            if (e.target.closest('.editIncome')) {
                const editIncome = e.target.closest(".incomedisplayed")
                const id = editIncome.dataset.id
                console.log("edit Button Clicked for item : ", editIncome, "of id ", id);
                console.log("incomeul: ", incomeul);
                openFormtoEditIncome();
                cancelBtn.style.display = "block";
                saveBtn.style.display = "block";
                addBtn.style.display = "none";

                isEditing = true;
                const getIncomeRes = await axios.get(
                    `${api_url}/api/income/${id}`, {
                    params: {
                        prevdate
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                console.log("edit income response: ", getIncomeRes);

                let fetchedIncome = populateFields(getIncomeRes, key)
                if (isEditing) {
                    console.log("is editing in put: ", isEditing);
                    saveBtn.addEventListener("click", async () => {
                        console.log("incomeul: ", incomeul);

                        incomeul.removeChild(editIncome)
                        newIncomeDetail = {
                            amount: document.getElementById('amount').value,
                            description: document.getElementById('description').value,
                        }
                        console.log("newIncome detail: ", newIncomeDetail);

                        try {
                            newIncome = await axios.put(`${api_url}/api/income/${id}`, newIncomeDetail, {
                                params: {
                                    prevdate
                                },
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            })
                            console.log("Income after edit response: ", newIncome.data);
                            // editIncome.textContent = `${newIncome.data.editedIncome.amount} `;
                            displayIncome(prevdate, newIncome.data.editedIncome.amount, newIncome.data.editedIncome.id, newIncome.data.editedIncome.description)
                            try {
                                const getIncome = await axios.get(`${api_url}/api/income?carouseldate=${prevdate}`, {
                                    headers: {
                                        Authorization: `Bearer ${token}`
                                    }
                                })
                                console.log("Response on getting the savings after delete: ", getIncome);
                                displaySavings(prevdate, getIncome.data.savings)
                            } catch (err) {
                                console.log("error getting incomes after edit: ", err);

                            }
                        } catch (err) {
                            console.log("Error updating income: ", err);
                        }
                    })
                }
            }

        } catch (err) {
            console.log("error in editing income: ", err);

        }
    })

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

    // const limit = 2;
    async function fetchExpenses(page) {
        try {
            const response = await axios.get(`${api_url}/api/expenses/paginate?page=${page}&limit=${expensesPerPage}&carouseldate=${prevdate}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            const data = response.data;
            console.log("response from get request in fetchExpenses:: ", response, data);
            const expenses = data.expenses;
            console.log("expenses fetched from fetchExpenses: ", expenses);

            document.getElementById("pageNumber").innerText = data.currentPage;
            document.getElementById("prevPage").disabled = data.currentPage === 1;
            document.getElementById("nextPage").disabled = data.currentPage === data.totalPages;
            displayExp(expenses, data.totalPages, currentPage)
            updatePaginationButtons(data.totalPages);
            return response.data.expenses
        } catch (err) {
            console.log("Error fetching expenses:", err);
        }
    }


    function updatePaginationButtons(totalPages) {
        let prevPageBtn = document.getElementById("prevPage")
        let nextPageBtn = document.getElementById("nextPage")
        if (currentPage === 1) {
            prevPageBtn.disabled = true;
            prevPageBtn.classList.add('disabled');
        } else {
            prevPageBtn.disabled = false;
            prevPageBtn.classList.remove('disabled');
        }
        if (currentPage >= totalPages) {
            nextPageBtn.disabled = true;
            nextPageBtn.classList.add('disabled');
        } else {
            nextPageBtn.disabled = false;
            nextPageBtn.classList.remove('disabled');
        }
    }

    document.getElementById("prevPage").addEventListener("click", async () => {
        if (currentPage > 1) {
            currentPage--;
            await fetchExpenses(currentPage);
        }
    });
    document.getElementById("nextPage").addEventListener("click", async () => {
        currentPage++;
        await fetchExpenses(currentPage);
    });
    fetchExpenses(currentPage);
}