const Income = require('../models/income')
const User = require('../models/user')
const Expense = require('../models/expense')
const Month = require('../models/monthly');
const mongoose=require('mongoose')
async function finduserIncome(incomedate, userId) {
    const lastIncome = await Income.findOne({
        
        userId,
        createdAt: {
                $lt: incomedate  //incomedate se pehle ki latest entry
            }
        // order: [['createdAt', 'DESC'], ['id', 'DESC']],
        // limit: 1
    }).sort({ createdAt: -1, _id: -1 }).exec();
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
async function monthlyCalculation(year, month, userId, newIncomeAmount = 0) {
    try {
        let carryForward = 0;
        let balance = 0;
        console.log("month number is: ", month, "of type: ", typeof (month));

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        console.log("Fetching Expenses for User: ", userId);

        const returnedDate = await getStartAndEndDate(year, month)
        const startDate = returnedDate.startDate;
        const endDate = returnedDate.endDate

        console.log("going to calc lastExpense: ");
        
        const lastExpenseDate = await Expense.findOne({
                userId:userId,
                createdAt: { $lt: new Date(`${year}-${month}`) }  // Before current month
            // order: [['createdAt', 'DESC'], ['id', 'DESC']],
            // // attributes:['createdAt']
            // 
        }).sort({createdAt:-1, _id:-1}).exec()

        console.log("Last expense date : ", lastExpenseDate)

        const lastIncomeDate = await Income.findOne({
            userId:userId,
            createdAt: { $lt: new Date(`${year}-${month}`) }  // Before current month
            // order: [['createdAt', 'DESC'], ['id', 'DESC']],
            // // attributes: ['createdAt']
            // 
        }).sort({ createdAt: -1, _id: -1 }).exec()

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

        const allexpenses = await Expense.find({
            
                userId:userId,
                createdAt: { $gte: startDate, $lte: endDate }
            // order: [["id", "DESC"]],
            // 
        }).sort({_id:-1}).exec()

        const allincomes = await Income.find({
           
                userId:userId,
                createdAt: { $gte: startDate, $lte: endDate }
            // order: [["id", "DESC"]],
            // 
        }).sort({ _id: -1 }).exec()

        let totalIncome = await Income.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.user.id),
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },  
            {
                $group: {
                    _id: null,
                    totalAmount:{$sum:"$amount"}
                }
            }
        ])
        console.log("totalIncome in monthly Calculation: ",totalIncome);
        
        let total_I = totalIncome.length > 0 ? totalIncome[0].totalAmount : 0
        console.log("totalInc: total_I: ",total_I);
        if (total_I === 0 && newIncomeAmount > 0) {
            total_I=newIncomeAmount
        }
        let totalExpense = await Expense.aggregate([
            {
                $match: {
                    userId:new mongoose.Types.ObjectId(req.user.id),
                    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
             
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" }
                }
            }
        ])
        const total_E = totalExpense.length > 0 ? totalExpense[0].totalAmount : 0

        if (total_E && total_I && carryForward) {
            balance = (total_I + carryForward) - total_E
        } else if (total_I && total_E) {
            balance = total_I- total_E
        } else if (total_I && carryForward) {
            balance = carryForward - total_E
        } else if (total_I && carryForward) {
            balance = total_I + carryForward
        } else if (total_E) {
            balance = -total_E
        } else if (carryForward) {
            balance = carryForward
        } else if (total_I) {
            balance=total_I
        }

        console.log("balance:: ", balance);
        console.log("carryForward: ",carryForward);
        
        console.log("Filtered Expenses: ", allexpenses);
        console.log("total Income: ", total_I);
        console.log("total Expense: ", total_E);
        
        const newMonth =new Month({
            monthNum: month,
            year: year,
            totalIncome: total_I,
            totalExpense: total_E,
            carryForward: carryForward,
            balance: balance,
            userId:userId
        })
        await newMonth.save()
        console.log("new month updated: ",newMonth);
        
    } catch (error) {
        console.log("Error in getting all expenses in expenseController: ", error);
    }

}

exports.postAddIncome = async (req, res, next) => {
    try {
       
        const user = await User.findById(req.user.id)
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
            
            userId: req.user.id,
            monthNum: { $eq: incomeMonth },
            year: { $eq: incomeYear }
            
        })
        const existingIncome = await Income.findOne({
            
                userId: req.user.id,
                createdAt: {$eq:new Date(date)}

        }).sort({_id:-1}).exec()

        console.log("existingIncome: ", existingIncome);

        const lastExpense = await Expense.findOne({
            
                userId: req.user.id,
                createdAt: { $lt: new Date(date) }
            // order: [['createdAt', 'DESC'], ['id', 'DESC']],
            // limit: 1,
            // : t
        }).sort({createdAt:-1 ,_id: -1 }).exec()

        const lastIncome = await finduserIncome(date, req.user.id)
        console.log("lastIncome: ",lastIncome);
        
        console.log("lastExpense ", lastExpense);
        
        let allexpensesOnDate = await Expense.find({
           
                userId: req.user.id,
               createdAt: { $eq: new Date(date) }
           
            // order: [['id', 'ASC']],
            // : t
        }).sort({ _id: -1 }).exec()
        if (existingIncome) {
            amount = req.body.amount; // Add to existing income
            latestSaving = existingIncome.totalsaving + req.body.amount;

            if (allexpensesOnDate.length > 0) {  //update the cs of all expenses on that date if present
                for (let expense of allexpensesOnDate) {
                    expense.currentsaving += req.body.amount
                    await expense.save();
                }
            }
        } else if (allexpensesOnDate.length > 0) {  //update the cs of all expenses on that date if present
            for (let expense of allexpensesOnDate) {
                expense.currentsaving += req.body.amount
                await expense.save();
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

        const newIncome = new Income({
            amount,
            description,
            totalsaving: latestSaving,
            createdAt: date,
            userId:req.user.id
        })
        await newIncome.save()
        console.log("new Income: ",newIncome);
        
        if (existingMonth) {
            console.log("entering existing month!!!!");
            
            existingMonth.totalIncome += req.body.amount
            existingMonth.balance += req.body.amount
            await existingMonth.save();
        } else {
            console.log("calling monthlyCalc function!!!");
            await monthlyCalculation(incomeYear, incomeMonth, req.user.id,newIncome.amount)
        }
        
        console.log("req.body.amount:: ", req.body.amount);

        await updateFutureIncomes(req.user.id, date, req.body.amount)

        console.log("New Income:", newIncome);
        
        res.status(200).json({ message: "New income created ", incomedetail: newIncome })
    } catch (err) {
        console.log("Error in postAddIncome:: ", err);

        res.status(500).json({ error: "Failed to create an income ", details: err })
    }
}

async function updateFutureIncomes(userId, updatedDate, addedAmount) {
    try {
        let month = parseInt(updatedDate.split('-')[1])
        let year = parseInt(updatedDate.split('-')[0])
        let futureExpenses = await Expense.find({
            
                userId: userId,
                createdAt: { $gt: updatedDate }  // Get expenses after the updated date
        
            // order: [['createdAt', 'ASC'], ['id', 'ASC']],
            // 
        }).sort({ createdAt: 1, _id: 1 }).exec();

        let futureIncomes = await Income.find({
            
                userId: userId,
                createdAt: { $gt: updatedDate }
            // order: [['createdAt', 'ASC'], ['id', 'ASC']],
            // 
        }).sort({ createdAt: 1, _id: 1 }).exec()

        let newaddedInc = await Income.findOne({
            
                userId: userId,
                createdAt: updatedDate

            // order: [['id', 'DESC']],
            // limit: 1,
            // 
        }).sort({ _id: -1 }).exec()

        let monthlyIncomes = await Month.find({
           
                userId: userId,
                monthNum: { $gt: month },
                year: { $eq: year }
            // order: [['year', 'ASC'], ['monthNum', 'ASC']],
            // 
        }).sort({ year: 1, monthNum: 1 }).exec()
        console.log("new saving:: ", addedAmount);


        for (let expense of futureExpenses) {
            expense.currentsaving += addedAmount
            await expense.save(); // Save updated expense
        }
        console.log("New Saving from update function in income::: ", addedAmount);

        for (let income of futureIncomes) {
            income.totalsaving += addedAmount
            await income.save()
        }
        for (let month of monthlyIncomes) {
            month.carryForward += addedAmount
            month.balance += addedAmount
            await month.save()
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
           
                userId: req.user.id,
                createdAt: {$eq: carouseldate}
            // order: [['id', 'DESC']], //largest id will come first
            // limit: 1
        }).sort({_id:-1}).exec()
        let expenseonDate = await Expense.find({
            
                userId: req.user.id,
                createdAt: carouseldate
        
            // order: [['id', 'ASC']]
        }).sort({ _id: 1 }).exec()

        const allincomesonDate = await Income.find({
           
                userId: req.user.id,
                createdAt: carouseldate

            // order: [['id', 'ASC']]
        }).sort({ _id: 1 }).exec()

        expenseOnLatest = await Expense.findOne({
            
                userId: req.user.id,
                createdAt: { $lt: carouseldate }
            
            // order: [['createdAt', 'DESC'], ['id', 'DESC']],
            // limit: 1
        }).sort({ createdAt:-1 ,_id: -1 }).exec()
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
        const id  = new mongoose.Types.ObjectId(req.params)
        const { prevdate } = req.query
        const editIncomeonDate = await Income.findById(id)
        console.log("editincomeOnDate: ", editIncomeonDate);
        
        res.status(200).json({ message: "Getting income to be edited", editincome: editIncomeonDate })
    } catch (err) {
        console.log("get Income by id EERR!!! ", err);

        res.status(500).json({ error: "Failed to get income", details: err })
    }
}
exports.deleteIncome = async (req, res, next) => {
    try {
        const id = new mongoose.Types.ObjectId(req.params)
        const { prevdate } = req.query
        await deleteInc(id, prevdate, req.user.id)
        res.status(200).json({ message: "Income deleted successfully" })
    } catch (err) {
        console.log("error in delete income controller function:: ", err);

        res.status(500).json({ error: "Failed to delete income", details: err })
    }
}

async function deleteInc(id, date, userId) {
    
    try {
      
        let month = parseInt(date.split('-')[1])
        let year = parseInt(date.split('-')[0])
        let finalsaving;
        console.log("Date on deletion:: ", date);


        const incometoDel = await Income.findOne({
            
                userId: userId,
                _id: id
          
        })
        console.log("Income to delete:: ", incometoDel);
        const delAmount = incometoDel.amount

        let incomesbeforeDel = await Income.find({
            
                userId: userId,
            createdAt: { $eq: new Date(date) }
        
            // order: [['id', 'ASC']],
            // : t
        }).sort({_id:1}).exec()

        console.log("incomes before delete: ", incomesbeforeDel);

        const expensesOnDate = await Expense.find({
            
                userId: userId,
            createdAt: { $eq: new Date(date) }

            // order: [['id', 'ASC']], //smallest id will come first
            // : t
        }).sort({_id:1}).exec()

        if (expensesOnDate.length === 0) {
            await Income.findByIdAndDelete(id)
        } else {
            for (let expense of expensesOnDate) {
                expense.currentsaving -= delAmount
                console.log("currentsaving : ", expense.currentsaving);

                finalsaving = expense.currentsaving
                await expense.save()
            }
            await Income.findByIdAndDelete(id)
        }

        let incomeonThatDate = await Income.findOne({
            
                userId: userId,
                createdAt: date
        
            // order: [['id', 'DESC']],
            // limit: 1,
            // : t
        }).sort({_id:-1}).exec();

        console.log("income on that date:: ", incomeonThatDate);

        const remainingincomes = await Income.find({
           
                userId: userId,
                createdAt: date,
                id: { $gt: id }
            
            // order: [['id', "ASC"]],
            // // limit: 1
            // : t
        }).sort({_id:1}).exec()

        console.log("remaining incomes: ", remainingincomes);

        if (parseInt(id) !== incomesbeforeDel.at(-1).id) {
            for (let income of remainingincomes) {
                income.totalsaving -= delAmount
                await income.save()
            }
        }

        console.log("final saving: ", finalsaving);
        console.log("income on that date after deletion: ", incomeonThatDate);
        if (incomeonThatDate) {
            incomeonThatDate.totalsaving = finalsaving
            await incomeonThatDate.save()
        }
     let existingMonth= await Month.findOne({
          
                userId:userId,
                monthNum: month,
                year: year
            
            // : t,
        })
        if (existingMonth) {
            existingMonth.totalIncome -= delAmount
            existingMonth.balance -= delAmount
            console.log("existing month Balance!!!! ", existingMonth.balance);

            await existingMonth.save()
        }
        await updateAfterDelete(userId, date, delAmount)
        
    } catch (err) {
        console.log("Error deleting income from backend ", err)

    }
}

exports.editIncome = async (req, res, next) => {
    try {
       
        const id = new mongoose.Types.ObjectId(req.params)
        const { prevdate } = req.query
        const { amount, description } = req.body
        let month = parseInt(prevdate.split('-')[1])
        let year=parseInt(prevdate.split('-')[0])
        let finalSaving;
        console.log("amount: ", req.body.amount);
        console.log("description", req.body.description);

        const incometoEdit = await Income.findById(id)
        console.log("Income to edit : ", incometoEdit);

        let oldAmount = incometoEdit.amount
        let difference = amount - oldAmount
        console.log("difference: ", difference);

        incometoEdit.amount = amount
        incometoEdit.description = description
        incometoEdit.totalsaving += difference
        incometoEdit.save()

        const allexpensesOnDate = await Expense.find({
        
                userId: req.user.id,
                createdAt: prevdate
            
            // order: [['id', 'ASC']],
            
        }).sort({_id:1}).exec()
        for (let expense of allexpensesOnDate) {
            expense.currentsaving += difference
            finalSaving = expense.currentsaving
            await expense.save()
        }

        const remainingincomes = await Income.find({
           
                userId: req.user.id,
                createdAt: prevdate,
                _id: {$gt: id }
        
            // order: [['id', "ASC"]],
            // // limit: 1
            // :t
        }).sort({_id:1}).exec()
        console.log("remaining incomes: ", remainingincomes);

        for (let income of remainingincomes) {
            income.totalsaving += difference
            await income.save()
        }

        let monthtoEdit = await Month.findOne({
            
            userId: req.user.id,
            monthNum: {$eq:month},
            year:{$eq: year}
            
        })
        monthtoEdit.totalIncome += difference
        monthtoEdit.balance+=difference
        await monthtoEdit.save()
        
       await updateFutureIncomes(req.user.id, prevdate, difference)
        // await t.commit();
        res.status(200).json({ message: "edited income.", editedIncome: incometoEdit })

    } catch (err) {
        console.log("Error editing Income: ", err);
        // await t.rollback()
        res.status(500).json({ error: "Failed to edit income", details: err })

    }
}
async function updateAfterDelete(userId, updatedDate, amount) {
    try {
        let month = parseInt(updatedDate.split('-')[1])
        let year = parseInt(updatedDate.split('-')[0])
        let futureExpenses = await Expense.find({
           
                userId: userId,
                createdAt: { $gt: updatedDate }  // Get expenses after the updated date
            
            // order: [['createdAt', 'ASC'], ['id', 'ASC']],
            // 
        });

        let futureIncomes = await Income.find({
            
                userId: userId,
                createdAt: { $gt: updatedDate }
            
            // order: [['createdAt', 'ASC'], ['id', 'ASC']],
            // 

        }).sort({createdAt:1,_id:1}).exec()
 
        let futureMonths = await Month.find({
            
                userId: userId,
                monthNum: { $gt: month },
                year:year
            
            
        })
        for (let expense of futureExpenses) {
            // date = expense.createdAt
            expense.currentsaving -= amount
            await expense.save(); // Save updated expense
        }
        console.log("New Saving from update function in income::: ", amount);

        for (let income of futureIncomes) {
            income.totalsaving -= amount
            await income.save()
        }
        for (let month of futureMonths) {
            month.carryForward-=amount
            month.balance -= amount
            await month.save()
        }
    } catch (err) {
        console.log("Error in updating after deletion ", err);

    }
}