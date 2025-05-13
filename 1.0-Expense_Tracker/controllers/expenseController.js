const Expense = require('../models/expense')
const User = require('../models/user')
const Income = require('../models/income')
const Month = require('../models/monthly')
const { jwtAuthMiddleware, generateToken } = require('../jwtmiddleware');
const { Sequelize, Op } = require('sequelize');
const sequelize=require('../util/database')
async function isPremiumUser(usertocheck) {
    console.log("usertocheck:: ", usertocheck);

    if (usertocheck.premium === true) {
        return true;
    }
    return false;
}

async function finduserIncome(incomedate, userId) {
    return await Income.findOne({
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
}
async function getStartAndEndDate(year, month) {
    const startDate = new Date(`${year}-${month}-01`)
    const endDate = new Date(year, month, 0, 23, 59, 59)
    console.log("start Date: ", startDate);
    console.log("end Date: ", endDate);

    return { startDate, endDate }
}
async function monthlyCalculation (year, month,userId,transaction) {
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
        }

        console.log("balance:: ", balance);
        console.log("carryForward: ", carryForward);
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
            },{ transaction })
        } catch (error) {
        console.log("Error in getting all expenses in expenseController: ", error);
    }

    }
exports.postAddExpense = async (req, res, next) => {
    console.log("expense controller activated!!");
    try {
        const t=await sequelize.transaction() //transaction object and we pass it down to each and every place where we are updating the db.
        const user = await User.findByPk(req.user.id,{transaction:t})
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const { date } = req.query
        let latestsaving = 0
        console.log("type of date: ",typeof(date));
        const expenseMonth = parseInt(date.split('-')[1])
        const expenseYear = parseInt(date.split('-')[0])
        console.log("expenseMonth: ",expenseMonth, "expenseYear: ",expenseYear);
      
        let incomeonThatDate = await Income.findOne({
            where:
            {
                userId: req.user.id,
                createdAt: Sequelize.literal(`DATE(createdAt) = '${date}'`)
            },
            order: [['id', 'DESC']],
            limit: 1,
            transaction:t,
        });
        console.log("incomeonThatDate ", incomeonThatDate)
        let userIncome = incomeonThatDate ? incomeonThatDate : await finduserIncome(date, req.user.id)
        console.log("User Income!!!", userIncome);

        const lastExpense = await Expense.findOne({ //yeh tab milega jab hum 19 mein expense naya add karenge tab karna lastExpense.at(-1)
            where:
            {
                userId: req.user.id,
                createdAt: { [Op.lt]: date }
            },
            order: [['createdAt', 'DESC'], ['id', 'DESC']],
            limit: 1,
            transaction: t,
        })
        console.log("LAst expense in PostAddExp: ", lastExpense);

        const expenses = await Expense.findAll(
            {
                where: {
                    userId: req.user.id,
                    createdAt: date
                },
                transaction: t
            })

        console.log("Expense on date: ", date, ": ", expenses);
        console.log("Previous Expenses!!! ", lastExpense);

        if (!incomeonThatDate && expenses.length > 0) {
            latestsaving = expenses.at(-1).currentsaving
        } else if (!incomeonThatDate && lastExpense) {
            latestsaving = lastExpense.currentsaving;
        } else if (incomeonThatDate) {
            latestsaving = incomeonThatDate.totalsaving
        } else if (userIncome) {
            latestsaving = userIncome.totalsaving
        }

        const amount = req.body.amount
        const description = req.body.description
        const category = req.body.category
        //    const createdAt=req.body.createdAt || new Date();
        latestsaving = latestsaving - amount

        const newExpense = await user.createExpense({
            amount: amount,
            description: description,
            category: category,
            currentsaving: latestsaving,
            createdAt: date, //overriding default value of createdAt
        },
        {transaction:t} //keeps track
        )

        if (incomeonThatDate) {
            incomeonThatDate.totalsaving = latestsaving;
            await incomeonThatDate.save({ transaction: t});
        }
       user.totalExpense+=req.body.amount
        await user.save({ transaction: t })
        // await updateFutureExpenses(req.user.id, date,latestsaving);
        let existingMonth = await Month.findOne({
            where: {
                userId:req.user.id,
                monthNum: expenseMonth,
                year: expenseYear
            },
            transaction: t,
        })
        if (existingMonth) {
            existingMonth.totalExpense += req.body.amount
            existingMonth.balance -= req.body.amount
            console.log("EXISTING MONTH: :",existingMonth);
            
            console.log("existing month Balance!!!! ",existingMonth.balance);
            console.log("existing month CarryForward!!!! ", existingMonth.carryForward);
            console.log("existing month totalIncome!!!! ", existingMonth.totalIncome);
            
            
            await existingMonth.save({ transaction: t })
        } else {
          await  monthlyCalculation(expenseYear, expenseMonth, req.user.id,t)
        }
               
        await updateFutureExpenses(req.user.id, date, req.body.amount,t);

        console.log("Updated Saving after Expense: ", latestsaving);

        console.log("incomes table updated");

        console.log("latest saving !!", latestsaving);

        await t.commit(); //if any step fails nothing would get updated
        res.status(200).json({ message: "New expense created ", expensedetail: newExpense })

    } catch (err) {
        console.log("expense Error!!! ", err);
        await t.rollback();     
        res.status(500).json({ error: "Failed to create a new expense", details: err })
    }
};

async function updateFutureExpenses(userId, updatedDate, newSaving,transaction) {
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
        let monthlyExpenses = await Month.findAll({
            where: {
                userId: userId,
                monthNum: { [Op.gt]: month },
                year: year
            },
            transaction
        })
        console.log("new saving:: ", newSaving);

        for (let expense of futureExpenses) {
            // Deduct each future expense
            expense.currentsaving -= newSaving;
            await expense.save({ transaction }); // Save updated expense

        }
        for (let income of futureIncomes) {
            income.totalsaving -= newSaving
            await income.save({ transaction })
        }
        for (let month of monthlyExpenses) {
            month.carryForward -= newSaving
            month.balance -= newSaving
            await month.save({ transaction })
        }
    } catch (err) {
        console.log("Error in updating future incomes and expenses:: ", err);

    }

}

exports.getExpenses = async (req, res, next) => {
    try {
        const { carouseldate } = req.query
        const userid = req.user.id
        const user = await User.findByPk(userid)
        console.log("got use in get Expenses!!! ", user);
        console.log("Response ", res);
        let isPremium = await isPremiumUser(user)
        console.log("isPremium", isPremium);


        let userIncome;
        let incomeonThatDate = await Income.findOne({
            where:
            {
                userId: req.user.id,
                createdAt: Sequelize.literal(`DATE(createdAt) = '${carouseldate}'`)
            },
            order: [['id', 'DESC']],
            limit: 1
        });

        const expenses = await Expense.findAll(
            {
                where: {
                    userId: userid,
                    createdAt: carouseldate
                }
            })
        if (expenses.length > 0 && expenses.at(-1).currentsaving < 0) {
            // userIncome = incomeonThatDate ? incomeonThatDate : await finduserIncome(carouseldate, userid)
            userIncome = await finduserIncome(carouseldate, userid)
            console.log("user Income:: ", userIncome);
            if (incomeonThatDate) {
                expenses.at(-1).currentsaving = incomeonThatDate.totalsaving
            } else if (userIncome) {
                expenses.at(-1).currentsaving += userIncome.amount
            }
            await expenses.at(-1).save()
        }
        res.status(200).json({ expenses, isPremium })

    } catch (err) {
        console.log("Error in getExpenses: ", err);

        res.status(500).json({ message: "Error fetching expenses ", details: err })
    }
};
exports.deleteExpense = async (req, res, next) => {
    try {
        const t = await sequelize.transaction()
        const { id } = req.params
        const { prevdate } = req.query
        let userIncome;
        const user = await User.findByPk(req.user.id, { transaction: t })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const deleteMonth = parseInt(prevdate.split('-')[1])
        const deleteYear = parseInt(prevdate.split('-')[0])
        const expensetodel = await Expense.findOne({ where: { id, userId: req.user.id }, transaction: t  })
        console.log("Expense to be deleted: ", expensetodel);

        console.log("type of id:: ", typeof (id));

        let incomeonThatDate = await Income.findOne({
            where:
            {
                userId: req.user.id,
                createdAt: prevdate
            },
            order: [['id', 'DESC']],
            limit: 1,
            transaction: t
        });

        let expensesbeforeDel = await Expense.findAll({
            where: {
                userId: req.user.id,
                createdAt: prevdate
            },
            order: [['id', 'ASC']],
            transaction: t
        })

        let delamount = expensetodel.amount
        let delcurrSave = expensetodel.currentsaving
        console.log("Del amount:: ", delamount);
        await expensetodel.destroy({ transaction: t })
        user.totalExpense -= delamount
        await user.save()
        let remainingExpenses = await Expense.findAll({
            where: {
                userId: req.user.id,
                createdAt: prevdate,
                id: { [Op.gt]: id }
            },
            order: [['id', 'ASC']],
            transaction: t
        })
        let lastExpcurrSaving;
        console.log("delete id:: ", id);


        if (parseInt(id) !== expensesbeforeDel.at(-1).dataValues.id) {
            for (let expense of remainingExpenses) {
                expense.currentsaving += delamount
               await expense.save({ transaction: t })
            }

        }
        if (incomeonThatDate) {
            incomeonThatDate.totalsaving += delamount
            await incomeonThatDate.save({ transaction: t })
        }
        let existingMonth = await Month.findOne({
            where: {
                userId: req.user.id,
                monthNum: deleteMonth,
                year: deleteYear
            },
            transaction: t,
        })
        if (existingMonth) {
            existingMonth.totalExpense -= delamount
            existingMonth.balance += delamount
            console.log("existing month Balance!!!! ", existingMonth.balance);

            await existingMonth.save({ transaction: t })
        }
       await updateAfterDelete(req.user.id, prevdate, delamount,t)
       await t.commit();
        res.status(200).json({ message: "Deleted successfully!", expensetodelete: expensetodel });
    } catch (err) {
        console.log("delete error!!! ", err);
       await t.rollback();
        res.status(500).json({ error: 'Failed to delete expense', details: err })
    }
};

async function updateAfterDelete(userId, updatedDate, addedAmount,transaction) {
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

        let monthlyExpenses = await Month.findAll({
            where: {
                userId: userId,
                monthNum: { [Op.gt]: month },
                year:year
            },
            order: [["id", "ASC"]],
            transaction

        })
        console.log("new saving:: ", addedAmount);
        for (let expense of futureExpenses) {
            // date = expense.createdAt
            expense.currentsaving += addedAmount
            await expense.save({transaction}); // Save updated expense
        }
        console.log("New Saving from update function in income::: ", addedAmount);

        for (let income of futureIncomes) {
            income.totalsaving += addedAmount
            await income.save({transaction})
        }
        for (let month of monthlyExpenses) { 
            month.carryForward += addedAmount
            month.balance += addedAmount
            await month.save({transaction})
        }
       
        console.log("Future expenses updated successfully");
    } catch (err) {
        console.log("update error!! ", err);
        
        console.log("Error in updating future incomes:: ", err);
    }
}

exports.getExpenseById = async (req, res, next) => {
    try {
        const { id } = req.params
        const expense = await Expense.findByPk(id)
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.status(200).json({ expense });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch expense', details: err.message });
    }
};

exports.updateExpense = async (req, res, next) => {
    try {
        const t = await sequelize.transaction()
        const { id } = req.params
        const { prevdate } = req.query
        let oldAmount = 0
        const user = await User.findByPk(req.user.id, { transaction: t })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const editMonth = parseInt(prevdate.split('-')[1])
        const editYear = parseInt(prevdate.split('-')[0])
        const { amount, description, category } = req.body
        const allExpensesOnDate = await Expense.findAll({
            where:
            {
                userId: req.user.id,
                createdAt: prevdate,
                id: { [Op.gt]: id }
            },
            order: [['id', 'ASC']],
            transaction: t
        })
        console.log("PreExpenses:: ", allExpensesOnDate);

        const allIncomesOnDate = await Income.findAll({
            where:
            {
                userId: req.user.id,
                createdAt: prevdate
            },
            order: [['id', 'ASC']],
            transaction: t
        })
        const expenseToEdit = await Expense.findByPk(id, { transaction: t })
        console.log(expenseToEdit);
        let existingMonth = await Month.findOne({
            where: {
                userId: req.user.id,
                monthNum: editMonth,
                year: editYear
            },
            transaction: t,
        })
        oldAmount = expenseToEdit.amount
        const difference = oldAmount - amount
        if (!expenseToEdit) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        if (difference < 0) {
            user.totalExpense += Math.abs(difference)
            await user.save({ transaction: t })
            if (existingMonth) {
                existingMonth.totalExpense += Math.abs(difference)
                existingMonth.balance -= Math.abs(difference)
                await existingMonth.save({ transaction: t })
            }
        } else {
            user.totalExpense -= Math.abs(difference)
            await user.save({ transaction: t })
            if (existingMonth) { 
                existingMonth.totalExpense -= Math.abs(difference)
                existingMonth.balance += Math.abs(difference)
                await existingMonth.save({ transaction: t })
            }
        }
        expenseToEdit.amount = amount
        expenseToEdit.description = description
        expenseToEdit.category = category
        expenseToEdit.currentsaving += difference
        await expenseToEdit.save({ transaction: t })
        console.log("expense edited: ", expenseToEdit);

        for (let expense of allExpensesOnDate) {
            expense.currentsaving += difference
            console.log("expense.currentsaving:: ", expense.currentsaving);
            finalSaving = expense.currentsaving
            await expense.save({ transaction: t })
        }

        for (let income of allIncomesOnDate) {
            income.totalsaving += difference
            await income.save({ transaction: t })
        }
        
        await updateAfterDelete(req.user.id, prevdate, difference,t)
        await t.commit();
        res.status(200).json({ message: 'Updated expense', editexpense: expenseToEdit })

    } catch (err) {
        console.log("error in updateExpense:: ", err);
        await t.rollback();
        res.status(500).json({ error: 'Failed to edit expense', details: err.message });
    }
}

exports.getPaginatedData = async (req, res, next) => {
    try {
        const userid = req.user.id
        const user = await User.findByPk(userid)
        let { page, limit, carouseldate } = req.query
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        let offset = (page - 1) * limit

        const { count, rows } = await Expense.findAndCountAll({
            where: {
                userId: req.user.id,
                createdAt: carouseldate
            },
            offset: offset,
            limit: limit,
            order: [['id', 'DESC']]
        });
        console.log("fetching expenses page by page");
        console.log("count: ", count, "Rows ", rows);

        res.status(200).json({ totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, expenses: rows })

    } catch (err) {
        console.log("error in getPaginatedData:: ", err);
        res.status(500).json({ error: 'Failed to get paginated data', details: err })
    }
}