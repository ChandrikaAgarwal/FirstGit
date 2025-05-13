const Income = require('../models/income')
const User = require('../models/user')
const Expense = require('../models/expense')
const Month = require('../models/monthly')
const { Sequelize, Op } = require('sequelize')
const sequelize = require('../util/database')
async function finduserIncome(incomedate, userId) {
    const lastIncome = await Income.findOne({
        where:
        {
            userId,
            createdAt: {
                [Op.lt]: incomedate  //incomedate se pehle ki latest entry
            }
        },
        order: [['createdAt', 'DESC'], ['id', 'DESC']],
        limit: 1
    });
    console.log("Last Income on latest date!!!", lastIncome);

    return lastIncome
}

async function getStartAndEndDate(year, month) {
    const startDate = new Date(`${year}-${month}-01`)
    const endDate = new Date(year, month, 0, 23, 59, 59)
    console.log("start Date: ", startDate);
    console.log("end Date: ", endDate);

    return { startDate, endDate }
}
async function monthlyCalculation(year, month, userId,transaction) {
    try {
        let carryForward = 0;
        let balance = 0;
        console.log("month number is: ", month, "of type: ", typeof (month));

        const user = await User.findByPk(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        console.log("Fetching Expenses for User: ", userId);

        const returnedDate = await getStartAndEndDate(year, month)
        const startDate = returnedDate.startDate;
        const endDate = returnedDate.endDate

        const lastExpenseDate = await Expense.findOne({
            where: {
                userId,
                createdAt: { [Op.lt]: new Date(`${year}-${month}`) }  // Before current month
            },
            order: [['createdAt', 'DESC'], ['id', 'DESC']],
            // attributes:['createdAt']
            transaction
        })

        console.log("Last expense date : ", lastExpenseDate)

        const lastIncomeDate = await Income.findOne({
            where: {
                userId,
                createdAt: { [Op.lt]: new Date(`${year}-${month}`) }  // Before current month
            },
            order: [['createdAt', 'DESC'], ['id', 'DESC']],
            // attributes: ['createdAt']
            transaction
        })

        console.log("Last expense date: ", lastExpenseDate?.createdAt);
        console.log("Last income date: ", lastIncomeDate?.createdAt);

        if (!lastExpenseDate && !lastIncomeDate) {
            carryForward = 0;
        }

        let lastDate = lastExpenseDate?.createdAt || lastIncomeDate?.createdAt;
        if (lastExpenseDate && lastIncomeDate) {
            lastDate = lastExpenseDate.createdAt > lastIncomeDate.createdAt ? lastExpenseDate.createdAt : lastIncomeDate.createdAt;
        }

        console.log("last Date: ", lastDate);

        if (lastDate === lastExpenseDate?.createdAt) {
            carryForward = lastExpenseDate?.currentsaving || 0;
        } else if (lastDate === lastIncomeDate?.createdAt) {
            carryForward = lastIncomeDate?.totalsaving || 0;
        }
        console.log("carry Forward: ", carryForward);

        const allexpenses = await Expense.findAll({
            where: {
                userId,
                createdAt: { [Op.between]: [startDate, endDate] }
            },
            order: [["id", "DESC"]],
            transaction
        })

        const allincomes = await Income.findAll({
            where: {
                userId,
                createdAt: { [Op.between]: [startDate, endDate] }
            },
            order: [["id", "DESC"]],
            transaction
        })

        let totalIncome = await Income.sum("amount", {
            where: {
                userId,
                createdAt: { [Op.between]: [startDate, endDate] }
            },
            transaction
        })
        if (!totalIncome) {
            totalIncome = 0;
        }

        let totalExpense = await Expense.sum("amount", {
            where: {
                userId,
                createdAt: { [Op.between]: [new Date(startDate), new Date(endDate)] }
            },
            transaction
        })
        if (!totalExpense) {
            totalExpense = 0;
        }

        if (totalExpense && totalIncome && carryForward) {
            balance = (totalIncome + carryForward) - totalExpense
        } else if (totalIncome && totalExpense) {
            balance = totalIncome - totalExpense
        } else if (totalExpense && carryForward) {
            balance = carryForward - totalExpense
        } else if (totalIncome && carryForward) {
            balance = totalIncome + carryForward
        } else if (totalExpense) {
            balance = -totalExpense
        } else if (carryForward) {
            balance = carryForward
        } else if (totalIncome) {
            balance=totalIncome
        }

        console.log("balance:: ", balance);
        console.log("carryForward: ",carryForward);
        
        console.log("Filtered Expenses: ", allexpenses);
        console.log("total Income: ", totalIncome);
        console.log("total Expense: ", totalExpense);
        
        const newMonth = await user.createMonth({
            monthNum: month,
            year: year,
            totalIncome: totalIncome,
            totalExpense: totalExpense,
            carryForward: carryForward,
            balance: balance,
        }, { transaction })
        console.log("new month updated: ",newMonth);
        
    } catch (error) {
        console.log("Error in getting all expenses in expenseController: ", error);
    }

}

exports.postAddIncome = async (req, res, next) => {
    try {
        const t = await sequelize.transaction()
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const { date } = req.query
        let amount = req.body.amount
        let description = req.body.description;
        let latestSaving = 0;
        const incomeMonth = parseInt(date.split('-')[1])
        const incomeYear = parseInt(date.split('-')[0])
        console.log("incomeMonth: ", incomeMonth, "incomeYear: ", incomeYear);
        let existingMonth = await Month.findOne({
            where: {
                userId: req.user.id,
                monthNum: incomeMonth,
                year: incomeYear
            },
            transaction: t,
        })
        const existingIncome = await Income.findOne({
            where:
            {
                userId: req.user.id,
                createdAt: Sequelize.literal(`DATE(createdAt)='${date}'`)

            },
            order: [['id', 'DESC']],
            limit: 1,
            transaction:t
        })

        console.log("existingIncome: ", existingIncome);

        const lastExpense = await Expense.findOne({
            where: {
                userId: req.user.id,
                createdAt: { [Op.lt]: date }
            },
            order: [['createdAt', 'DESC'], ['id', 'DESC']],
            limit: 1,
            transaction: t
        })

        const lastIncome = await finduserIncome(date, req.user.id)
        console.log("lastIncome: ",lastIncome);
        
        console.log("lastExpense ", lastExpense);
        
        let allexpensesOnDate = await Expense.findAll({
            where: {
                userId: req.user.id,
                createdAt: date
            },
            order: [['id', 'ASC']],
            transaction: t
        })
        if (existingIncome) {
            amount = req.body.amount; // Add to existing income
            latestSaving = existingIncome.totalsaving + req.body.amount;

            if (allexpensesOnDate.length > 0) {  //update the cs of all expenses on that date if present
                for (let expense of allexpensesOnDate) {
                    expense.currentsaving += req.body.amount
                    await expense.save({ transaction: t });
                }
            }
        } else if (allexpensesOnDate.length > 0) {  //update the cs of all expenses on that date if present
            for (let expense of allexpensesOnDate) {
                expense.currentsaving += req.body.amount
                await expense.save({ transaction: t });
                latestSaving=expense.currentsaving
            }
        } else if (lastExpense) {
            latestSaving = lastExpense.currentsaving + req.body.amount;

        } else if (lastIncome) {
            latestSaving = lastIncome.totalsaving + req.body.amount;

        } else {
            latestSaving = req.body.amount;
        }

        console.log("latestSaving:: ", latestSaving);

        const newIncome = await user.createIncome({
            amount,
            description,
            totalsaving: latestSaving,
            createdAt: date
        }, { transaction: t })

        if (existingMonth) {
            existingMonth.totalIncome += req.body.amount
            existingMonth.balance += req.body.amount
            await existingMonth.save({ transaction: t });
        } else {
            await monthlyCalculation(incomeYear, incomeMonth, req.user.id,t)
        }
        
        console.log("req.body.amount:: ", req.body.amount);

        await updateFutureIncomes(req.user.id, date, req.body.amount,t)

        console.log("New Income:", newIncome);
        await t.commit();
        res.status(200).json({ message: "New income created ", incomedetail: newIncome })
    } catch (err) {
        console.log("Error in postAddIncome:: ", err);
        await t.rollback();

        res.status(500).json({ error: "Failed to create an income ", details: err })
    }
}

async function updateFutureIncomes(userId, updatedDate, addedAmount,transaction) {
    try {
        let month = parseInt(updatedDate.split('-')[1])
        let year = parseInt(updatedDate.split('-')[0])
        let futureExpenses = await Expense.findAll({
            where: {
                userId: userId,
                createdAt: { [Op.gt]: updatedDate }  // Get expenses after the updated date
            },
            order: [['createdAt', 'ASC'], ['id', 'ASC']],
            transaction
        });

        let futureIncomes = await Income.findAll({
            where: {
                userId: userId,
                createdAt: { [Op.gt]: updatedDate }
            },
            order: [['createdAt', 'ASC'], ['id', 'ASC']],
            transaction
        })

        let newaddedInc = await Income.findOne({
            where: {
                userId: userId,
                createdAt: updatedDate
            },
            order: [['id', 'DESC']],
            limit: 1,
            transaction
        })

        let monthlyIncomes = await Month.findAll({
            where: {
                userId: userId,
                monthNum: { [Op.gt]: month },
                year:year
            },
            order: [['year', 'ASC'], ['monthNum', 'ASC']],
            transaction
        })
        console.log("new saving:: ", addedAmount);


        for (let expense of futureExpenses) {
            expense.currentsaving += addedAmount
            await expense.save({ transaction }); // Save updated expense
        }
        console.log("New Saving from update function in income::: ", addedAmount);

        for (let income of futureIncomes) {
            income.totalsaving += addedAmount
            await income.save({ transaction })
        }
        for (let month of monthlyIncomes) {
            month.carryForward += addedAmount
            month.balance += addedAmount
            await month.save({ transaction })
            console.log("month's carryForward: ",month.carryForward);
            
        }
        console.log("Future expenses updated successfully");
    } catch (err) {
        console.log("Error in updating future incomes:: ", err);
    }
}

exports.getIncome = async (req, res, next) => {
    try {

        const { carouseldate } = req.query
        let lastIncomeDate;
        let expenseOnLatestDate;
        let expenseOnLatest;
        const income = await Income.findOne({
            where: {
                userId: req.user.id,
                createdAt: Sequelize.literal(`DATE(createdAt)='${carouseldate}'`)
            },
            order: [['id', 'DESC']], //largest id will come first
            limit: 1
        })
        let expenseonDate = await Expense.findAll({
            where: {
                userId: req.user.id,
                createdAt: carouseldate
            },
            order: [['id', 'ASC']]
        })

        const allincomesonDate = await Income.findAll({
            where: {
                userId: req.user.id,
                createdAt: carouseldate
            },
            order: [['id', 'ASC']]
        })

        expenseOnLatest = await Expense.findOne({
            where: {
                userId: req.user.id,
                createdAt: { [Op.lt]: carouseldate }
            },
            order: [['createdAt', 'DESC'], ['id', 'DESC']],
            limit: 1
        })
        console.log("LAtest Expense:: ", expenseOnLatest);

        let lastIncome = await finduserIncome(carouseldate, req.user.id)
        if (lastIncome) {
            lastIncomeDate = lastIncome.createdAt
            lastIncomeDate = lastIncomeDate.toISOString().split('T')[0]
            console.log("Last income date ", lastIncomeDate);
        }
        if (expenseOnLatest) {
            expenseOnLatestDate = expenseOnLatest.createdAt.toISOString().split('T')[0]
            console.log("Expense on latest date:: ", expenseOnLatestDate);
        }
        if (expenseonDate.length > 0) {
            savings = expenseonDate.at(-1).currentsaving
        } else if (income) {
            savings = income.totalsaving
            
        } else if (expenseOnLatest && lastIncome) {
            if (lastIncomeDate > expenseOnLatestDate) {
                savings = lastIncome.totalsaving
            } else if (expenseOnLatestDate >= lastIncomeDate) {
                savings = expenseOnLatest.currentsaving
            }
        } else if (lastIncome) {
            savings = lastIncome.totalsaving
        } else if (expenseOnLatest) {
            savings = expenseOnLatest.currentsaving
        } else {
            savings = 0
        }
        // let savings = lastIncome ? lastIncome.totalsaving : 0;
        console.log("Getting Income:::", income);
        console.log("Last Income ", lastIncome);

        console.log("savings testing ", savings);

        // res.status(200).json({income, savings })
        res.status(200).json({ allincomesonDate, income, savings })

    } catch (err) {
        console.log("Income EERR!!! ", err);

        res.status(500).json({ error: "Failed to get income", details: err })

    }
}
exports.getIncomebyId = async (req, res, next) => {
    try {
        const { id } = req.params
        const { prevdate } = req.query
        const editIncomeonDate = await Income.findByPk(id)
        console.log("editincomeOnDate: ", editIncomeonDate);
        
        res.status(200).json({ message: "Getting income to be edited", editincome: editIncomeonDate })
    } catch (err) {
        console.log("get Income by id EERR!!! ", err);

        res.status(500).json({ error: "Failed to get income", details: err })
    }
}
exports.deleteIncome = async (req, res, next) => {
    try {
        const { id } = req.params
        const { prevdate } = req.query
        await deleteInc(id, prevdate, req.user.id)
        res.status(200).json({ message: "Income deleted successfully" })
    } catch (err) {
        console.log("error in delete income controller function:: ", err);

        res.status(500).json({ error: "Failed to delete income", details: err })
    }
}

async function deleteInc(id, date, userId) {
    let t;
    try {
        t = await sequelize.transaction()
        let month = parseInt(date.split('-')[1])
        let year = parseInt(date.split('-')[0])
        let finalsaving;
        console.log("Date on deletion:: ", date);


        const incometoDel = await Income.findOne({
            where: {
                userId: userId,
                id: id
            },
            transaction: t
        })
        console.log("Income to delete:: ", incometoDel);
        const delAmount = incometoDel.amount

        let incomesbeforeDel = await Income.findAll({
            where: {
                userId: userId,
                createdAt: date
            },
            order: [['id', 'ASC']],
            transaction: t
        })

        console.log("incomes before delete: ", incomesbeforeDel);

        const expensesOnDate = await Expense.findAll({
            where: {
                userId: userId,
                createdAt: date
            },
            order: [['id', 'ASC']], //smallest id will come first
            transaction: t
        })

        if (expensesOnDate.length === 0) {
            await incometoDel.destroy({ transaction: t })
        } else {
            for (let expense of expensesOnDate) {
                expense.currentsaving -= delAmount
                console.log("currentsaving : ", expense.currentsaving);

                finalsaving = expense.currentsaving
                await expense.save({ transaction: t })
            }
            await incometoDel.destroy({ transaction: t })
        }

        let incomeonThatDate = await Income.findOne({
            where:
            {
                userId: userId,
                createdAt: date
            },
            order: [['id', 'DESC']],
            limit: 1,
            transaction: t
        });

        console.log("income on that date:: ", incomeonThatDate);

        const remainingincomes = await Income.findAll({
            where: {
                userId: userId,
                createdAt: date,
                id: { [Op.gt]: id }
            },
            order: [['id', "ASC"]],
            // limit: 1
            transaction: t
        })

        console.log("remaining incomes: ", remainingincomes);

        if (parseInt(id) !== incomesbeforeDel.at(-1).id) {
            for (let income of remainingincomes) {
                income.totalsaving -= delAmount
                await income.save({ transaction: t })
            }
        }

        console.log("final saving: ", finalsaving);
        console.log("income on that date after deletion: ", incomeonThatDate);
        if (incomeonThatDate) {
            incomeonThatDate.totalsaving = finalsaving
            await incomeonThatDate.save({ transaction: t })
        }
     let existingMonth= await Month.findOne({
            where: {
                userId:userId,
                monthNum: month,
                year: year
            },
            transaction: t,
        })
        if (existingMonth) {
            existingMonth.totalIncome -= delAmount
            existingMonth.balance -= delAmount
            console.log("existing month Balance!!!! ", existingMonth.balance);

            await existingMonth.save({ transaction: t })
        }
        await updateAfterDelete(userId, date, delAmount,t)
        await t.commit()
    } catch (err) {
        console.log("Error deleting income from backend ", err);
        await t.rollback()


    }
}

exports.editIncome = async (req, res, next) => {
    try {
        const t=await sequelize.transaction()
        const { id } = req.params
        const { prevdate } = req.query
        const { amount, description } = req.body
        let month = parseInt(prevdate.split('-')[1])
        let year=parseInt(prevdate.split('-')[0])
        let finalSaving;
        console.log("amount: ", req.body.amount);
        console.log("description", req.body.description);

        const incometoEdit = await Income.findByPk(id)
        console.log("Income to edit : ", incometoEdit);

        let oldAmount = incometoEdit.amount
        let difference = amount - oldAmount
        console.log("difference: ", difference);

        incometoEdit.amount = amount
        incometoEdit.description = description
        incometoEdit.totalsaving += difference
        incometoEdit.save({transaction:t})

        const allexpensesOnDate = await Expense.findAll({
            where: {
                userId: req.user.id,
                createdAt: prevdate
            },
            order: [['id', 'ASC']],
            transaction:t
        })
        for (let expense of allexpensesOnDate) {
            expense.currentsaving += difference
            finalSaving = expense.currentsaving
            await expense.save({ transaction: t })
        }

        const remainingincomes = await Income.findAll({
            where: {
                userId: req.user.id,
                createdAt: prevdate,
                id: { [Op.gt]: id }
            },
            order: [['id', "ASC"]],
            // limit: 1
            transaction:t
        })
        console.log("remaining incomes: ", remainingincomes);

        for (let income of remainingincomes) {
            income.totalsaving += difference
            await income.save({ transaction: t })
        }

        let monthtoEdit = await Month.findOne({
            where:{
                userId: req.user.id,
                monthNum: month,
                year: year
            },
            transaction:t
        })
        monthtoEdit.totalIncome += difference
        monthtoEdit.balance+=difference
        monthtoEdit.save({transaction:t})
       await updateFutureIncomes(req.user.id, prevdate, difference, t)
        await t.commit();
        res.status(200).json({ message: "edited income.", editedIncome: incometoEdit })

    } catch (err) {
        console.log("Error editing Income: ", err);
        await t.rollback()
        res.status(500).json({ error: "Failed to edit income", details: err })

    }
}
async function updateAfterDelete(userId, updatedDate, amount,transaction) {
    try {
        let month = parseInt(updatedDate.split('-')[1])
        let year = parseInt(updatedDate.split('-')[0])
        let futureExpenses = await Expense.findAll({
            where: {
                userId: userId,
                createdAt: { [Op.gt]: updatedDate }  // Get expenses after the updated date
            },
            order: [['createdAt', 'ASC'], ['id', 'ASC']],
            transaction
        });

        let futureIncomes = await Income.findAll({
            where: {
                userId: userId,
                createdAt: { [Op.gt]: updatedDate }
            },
            order: [['createdAt', 'ASC'], ['id', 'ASC']],
            transaction

        })
 
        let futureMonths = await Month.findAll({
            where: {
                userId: userId,
                monthNum: { [Op.gt]: month },
                year:year
            },
            transaction
        })
        for (let expense of futureExpenses) {
            // date = expense.createdAt
            expense.currentsaving -= amount
            await expense.save({transaction}); // Save updated expense
        }
        console.log("New Saving from update function in income::: ", amount);

        for (let income of futureIncomes) {
            income.totalsaving -= amount
            await income.save({transaction})
        }
        for (let month of futureMonths) {
            month.carryForward-=amount
            month.balance -= amount
            await month.save({transaction})
        }
    } catch (err) {
        console.log("Error in updating after deletion ", err);

    }
}