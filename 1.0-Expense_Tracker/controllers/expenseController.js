const Expense = require('../models/expense')
const User = require('../models/user')
const Income = require('../models/income')
const Month = require('../models/monthly')
const { default: mongoose } = require('mongoose')



async function isPremiumUser(usertocheck) {
    console.log("usertocheck:: ", usertocheck);

    if (usertocheck.premium === true) {
        return true;
    }
    return false;
}

async function finduserIncome(incomedate, userId) {
    return await Income.findOne(
        { userId: userId , 
            createdAt: { $lt: incomedate }  //incomedate se pehle ki latest entry
    }
    ).sort({createdAt: -1, _id:-1}).exec();
}
async function getStartAndEndDate(year, month) {
    const startDate = new Date(`${year}-${month}-01`)
    const endDate = new Date(year, month, 0, 23, 59, 59)
    console.log("start Date: ", startDate);
    console.log("end Date: ", endDate);

    return { startDate, endDate }
}
async function monthlyCalculation (year, month,userId) {
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

        const lastExpenseDate = await Expense.findOne({ userId: userId,
            createdAt: { $lt: new Date(`${year}-${month}`) }  // Before current month
        }           
        ).sort({ createdAt: -1, _id: -1 }).exec()

        console.log("Last expense date : ", lastExpenseDate)

        const lastIncomeDate = await Income.findOne({
            userId: userId,
            createdAt: { $lt: new Date(`${year}-${month}`) }  // Before current month
        }
            
        ).sort({ createdAt: -1, _id: -1 }).exec()

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
            userId: userId,
            createdAt: { $gte: startDate, $lte:endDate}
        }          
        ).sort({_id:-1}).exec()

        const allincomes = await Income.find({
            userId: userId,            
            createdAt: { $gte: startDate, $lte: endDate }
            }
        ).sort({ _id: -1 }).exec()

        let totalIncome = await Income.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.user.id),
                    createdAt: { $gte:startDate, $lte:endDate }
                }                
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" }
                }
            }
        ])
        const total_I=totalIncome.length>0?totalIncome[0].totalAmount:0
        // if (!totalIncome) {
        //     totalIncome = 0;
        // }

        let totalExpense = await Expense.aggregate([
            {
               $match: {
                    userId: new mongoose.Types.ObjectId(req.user.id),
                    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
                }
                
            },
            {
                $group: {
                    _id: null,
                    totalAmount:{$sum:"$amount"}
                }
            }
        ])
        const total_E=totalExpense.length>0?totalExpense[0].totalAmount:0
        // if (!totalExpense) {
        //     totalExpense = 0;
        // }

        if (total_E && total_I && carryForward) {
            balance = (total_I + carryForward) - total_E
        } else if (total_I && total_E) {
            balance = total_I - total_E
        } else if (total_E && carryForward) {
            balance = carryForward - total_E
        } else if (total_I && carryForward) {
            balance = total_I + carryForward
        } else if (total_E) {
            balance = -total_E
        } else if (carryForward) {
            balance = carryForward
        }

        console.log("balance:: ", balance);
        console.log("carryForward: ", carryForward);
        console.log("Filtered Expenses: ", allexpenses);
        console.log("total Income: ", total_I);
        console.log("total Expense: ", total_E);
            const newMonth = new Month({
                monthNum: month,
                year: year,
                totalIncome: total_I,
                totalExpense: total_E,
                carryForward: carryForward,
                balance: balance,
                userId:userId
            })
        await newMonth.save()
        } catch (error) {
        console.log("Error in getting all expenses in expenseController: ", error);
    }

    }
exports.postAddExpense = async (req, res, next) => {
    console.log("expense controller activated!!");
    try {
        // const t=await sequelize.() // object and we pass it down to each and every place where we are updating the db.
        const user = await User.findById(req.user.id)
        console.log("user: ",user);
        console.log("request user: ",req.user);
        
        
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const { date } = req.query
        console.log("date: ",date);
        
        let latestsaving = 0
        console.log("type of date: ",typeof(date));
        const expenseMonth = parseInt(date.split('-')[1])
        const expenseYear = parseInt(date.split('-')[0])
        console.log("expenseMonth: ",expenseMonth, "expenseYear: ",expenseYear);
      
        let incomeonThatDate = await Income.findOne({ userId: req.user.id , 
            createdAt: { $eq: new Date(date) } 
        }
            
        ).sort({_id:-1}).exec();
        console.log("incomeonThatDate ", incomeonThatDate)
        let userIncome = incomeonThatDate ? incomeonThatDate : await finduserIncome(date, req.user.id)
        console.log("User Income!!!", userIncome);
        
            const lastExpense = await Expense.findOne({ //yeh tab milega jab hum 19 mein expense naya add karenge tab karna lastExpense.at(-1)
                userId: req.user.id,
                createdAt: { $lt: new Date(date) }
            }).sort({ createdAt: -1, _id: -1 }).exec()
            console.log("LAst expense in PostAddExp: ", lastExpense);
        

        const expenses = await Expense.find({ userId: req.user.id, createdAt: {$eq:new Date(date) } })

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

        const newExpense = new Expense({
            amount: amount,
            description: description,
            category: category,
            currentsaving: latestsaving,
            createdAt: date, //overriding default value of createdAt
            userId:req.user.id
        })
         await newExpense.save()
        if (incomeonThatDate) {
            incomeonThatDate.totalsaving = latestsaving;
            await incomeonThatDate.save();
        }
       user.totalExpense+=req.body.amount
        await user.save()
        // await updateFutureExpenses(req.user.id, date,latestsaving);
        let existingMonth = await Month.findOne({
            userId: req.user.id, monthNum: { $eq: expenseMonth }, year: { $eq: expenseYear }
        })
        if (existingMonth) {
            existingMonth.totalExpense += req.body.amount
            existingMonth.balance -= req.body.amount
            console.log("EXISTING MONTH: :",existingMonth);
            
            console.log("existing month Balance!!!! ",existingMonth.balance);
            console.log("existing month CarryForward!!!! ", existingMonth.carryForward);
            console.log("existing month totalIncome!!!! ", existingMonth.totalIncome);
            
            
            await existingMonth.save()
        } else {
          await  monthlyCalculation(expenseYear, expenseMonth, req.user.id)
        }
               
        await updateFutureExpenses(req.user.id, date, req.body.amount);

        console.log("Updated Saving after Expense: ", latestsaving);

        console.log("incomes table updated");

        console.log("latest saving !!", latestsaving);

        // await t.commit(); //if any step fails nothing would get updated
        res.status(200).json({ message: "New expense created ", expensedetail: newExpense })

    } catch (err) {
        console.log("expense Error!!! ", err);
        // await t.rollback();     
        res.status(500).json({ error: "Failed to create a new expense", details: err })
    }
};

async function updateFutureExpenses(userId, updatedDate, newSaving) {
    try {
        let month = parseInt(updatedDate.split('-')[1])
        let year = parseInt(updatedDate.split('-')[0])
        let futureExpenses = await Expense.find({
                userId: userId,
                createdAt: { $gt: new Date(updatedDate) }  // Get expenses after the updated date
            // order: [['createdAt', 'ASC'], ['id', 'ASC']],
            // 
        }).sort({createdAt:1, _id:1}).exec();

        let futureIncomes = await Income.find({
        
                userId: userId,
                createdAt: { $gt: updatedDate }
           
            // order: [['createdAt', 'ASC'], ['id', 'ASC']],
            // 
        }).sort({ createdAt: 1, _id: 1 }).exec()
        let monthlyExpenses = await Month.find({
            
                userId: userId,
                monthNum: { $gt: month },
                year: { $eq: year }
           
        })
        console.log("new saving:: ", newSaving);

        for (let expense of futureExpenses) {
            // Deduct each future expense
            expense.currentsaving -= newSaving;
            await expense.save(); // Save updated expense

        }
        for (let income of futureIncomes) {
            income.totalsaving -= newSaving
            await income.save()
        }
        for (let month of monthlyExpenses) {
            month.carryForward -= newSaving
            month.balance -= newSaving
            await month.save()
        }
    } catch (err) {
        console.log("Error in updating future incomes and expenses:: ", err);

    }

}

exports.getExpenses = async (req, res, next) => {
    try {
        const { carouseldate } = req.query
        const userid = req.user.id
        const user = await User.findById(userid)
        console.log("got use in get Expenses!!! ", user);
        console.log("Response ", res);
        let isPremium = await isPremiumUser(user)
        console.log("isPremium", isPremium);


        let userIncome;
        let incomeonThatDate = await Income.findOne({
           
                userId: userid,
                createdAt: {$eq:carouseldate}
            // order: [['id', 'DESC']],
            // limit: 1
        }).sort({_id:-1}).exec();

        const expenses = await Expense.find(
            {  
                    userId: userid,
                createdAt: { $eq: carouseldate }
                
            })
        console.log("expenses",expenses);
        
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
        // let { id } = req.params
        const id = new mongoose.Types.ObjectId(req.params)
        
        const { prevdate } = req.query
        let userIncome;
        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const deleteMonth = parseInt(prevdate.split('-')[1])
        const deleteYear = parseInt(prevdate.split('-')[0])
        const expensetodel = await Expense.findOne({ 
               _id: id,
            userId: req.user.id
        })
        console.log("Expense to be deleted: ", expensetodel);

        console.log("type of id:: ", typeof (id));

        let incomeonThatDate = await Income.findOne({
            
                userId: req.user.id,
                createdAt: prevdate

            // order: [['id', 'DESC']],
            // limit: 1,
            // : t
        }).sort({_id:-1}).exec();

        let expensesbeforeDel = await Expense.find({
          
                userId: req.user.id,
                createdAt: prevdate

            // order: [['id', 'ASC']],
            // : t
        }).sort({_id:1}).exec()

        let delamount = expensetodel.amount
        let delcurrSave = expensetodel.currentsaving
        console.log("Del amount:: ", delamount);
        if (expensetodel) {
            await Expense.findByIdAndDelete(id)
        }
        user.totalExpense -= delamount
        await user.save()
        let remainingExpenses = await Expense.find({
                userId: req.user.id,
                createdAt: prevdate,
                _id: { $gt: id }
            // order: [['id', 'ASC']],
            // : t
        }).sort({_id:1}).exec()
        let lastExpcurrSaving;
        console.log("delete id:: ", id);
        console.log("expenses before deletion: ",expensesbeforeDel);
        

        if (!expensesbeforeDel.at(-1)._id.equals(id)) {
            for (let expense of remainingExpenses) {
                expense.currentsaving += delamount
               await expense.save()
            }

        }
        if (incomeonThatDate) {
            incomeonThatDate.totalsaving += delamount
            await incomeonThatDate.save()
        }
        let existingMonth = await Month.findOne({
            
            userId: req.user.id,
            monthNum: { $eq: deleteMonth },
            year: { $eq: deleteYear }
            
            // : t,
        })
        if (existingMonth) {
            existingMonth.totalExpense -= delamount
            existingMonth.balance += delamount
            console.log("existing month Balance!!!! ", existingMonth.balance);

            await existingMonth.save()
        }
       await updateAfterDelete(req.user.id, prevdate, delamount)
    
        res.status(200).json({ message: "Deleted successfully!", expensetodelete: expensetodel });
    } catch (err) {
        console.log("delete error!!! ", err);
        res.status(500).json({ error: 'Failed to delete expense', details: err })
    }
};

async function updateAfterDelete(userId, updatedDate, addedAmount) {
    try {
        let month = parseInt(updatedDate.split('-')[1])
        let year = parseInt(updatedDate.split('-')[0])
        let futureExpenses = await Expense.find({
            
                userId: userId,
                createdAt: { $gt: updatedDate }  // Get expenses after the updated date
            
        }).sort({createdAt:1, _id:1}).exec();

        let futureIncomes = await Income.find({
            
            userId: userId,
            createdAt: { $gt: updatedDate }
    
        }).sort({ createdAt: 1, _id: 1 }).exec();

        let monthlyExpenses = await Month.find({
        
            userId: userId,
            monthNum: { $gt: month },
            year: {$eq: year}

          

        }).sort({_id:1}).exec()
        console.log("new saving:: ", addedAmount);
        for (let expense of futureExpenses) {
            // date = expense.createdAt
            expense.currentsaving += addedAmount
            await expense.save(); // Save updated expense
        }
        console.log("New Saving from update function in income::: ", addedAmount);

        for (let income of futureIncomes) {
            income.totalsaving += addedAmount
            await income.save()
        }
        for (let month of monthlyExpenses) { 
            month.carryForward += addedAmount
            month.balance += addedAmount
            await month.save()
        }  
        console.log("Future expenses updated successfully");
    } catch (err) {
        console.log("update error!! ", err);
        console.log("Error in updating future incomes:: ", err);
    }
}

exports.getExpenseById = async (req, res, next) => {
    try {
        const id = new mongoose.Types.ObjectId(req.params)
        const expense = await Expense.findById(id)
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
       
        const id = new mongoose.Types.ObjectId(req.params)
        const { prevdate } = req.query
        let oldAmount = 0
        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const editMonth = parseInt(prevdate.split('-')[1])
        const editYear = parseInt(prevdate.split('-')[0])
        const { amount, description, category } = req.body
        const allExpensesOnDate = await Expense.find({
            
                userId: req.user.id,
                createdAt: prevdate,
                id: { $gt: id }
                
            // order: [['id', 'ASC']],
            // : t
        }).sort({_id:1}).exec()
        console.log("PreExpenses:: ", allExpensesOnDate);

        const allIncomesOnDate = await Income.find({
            
                userId: req.user.id,
                createdAt: {$eq: prevdate }
    
            // order: [['id', 'ASC']],
            // : t
        }).sort({_id:1}).exec()
        const expenseToEdit = await Expense.findById(id)
        console.log(expenseToEdit);
        let existingMonth = await Month.findOne({
            userId: req.user.id,
            monthNum: { $eq: editMonth },
            year: { $eq: editYear }

        })
        oldAmount = expenseToEdit.amount
        const difference = oldAmount - amount
        if (!expenseToEdit) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        if (difference < 0) {
            user.totalExpense += Math.abs(difference)
            await user.save()
            if (existingMonth) {
                existingMonth.totalExpense += Math.abs(difference)
                existingMonth.balance -= Math.abs(difference)
                await existingMonth.save()
            }
        } else {
            user.totalExpense -= Math.abs(difference)
            await user.save()
            if (existingMonth) { 
                existingMonth.totalExpense -= Math.abs(difference)
                existingMonth.balance += Math.abs(difference)
                await existingMonth.save()
            }
        }
        expenseToEdit.amount = amount
        expenseToEdit.description = description
        expenseToEdit.category = category
        expenseToEdit.currentsaving += difference
        await expenseToEdit.save()
        console.log("expense edited: ", expenseToEdit);

        for (let expense of allExpensesOnDate) {
            expense.currentsaving += difference
            console.log("expense.currentsaving:: ", expense.currentsaving);
            finalSaving = expense.currentsaving
            await expense.save()
        }

        for (let income of allIncomesOnDate) {
            income.totalsaving += difference
            await income.save()
        }
        
        await updateAfterDelete(req.user.id, prevdate, difference)
        
        res.status(200).json({ message: 'Updated expense', editexpense: expenseToEdit })

    } catch (err) {
        console.log("error in updateExpense:: ", err);
        
        res.status(500).json({ error: 'Failed to edit expense', details: err.message });
    }
}

exports.getPaginatedData = async (req, res, next) => {
    try {
        const userid = req.user.id
        const user = await User.findById(userid)
        let { page, limit, carouseldate } = req.query
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        let skip = (page - 1) * limit
        
            const expensesCount = await Expense.countDocuments({
                userId: req.user.id,
                createdAt: { $eq: carouseldate }
            })
            let totalPages = Math.ceil(expensesCount / limit)
        let expenses = await Expense.find({
            userId: req.user.id,
            createdAt: { $eq: carouseldate }
        }).skip(skip).limit(limit)
        console.log("fetching expenses page by page");
        // console.log("count: ", count, "Rows ", rows);

        res.status(200).json({ totalItems: expensesCount, totalPages, currentPage: page, expenses: expenses })

    } catch (err) {
        console.log("error in getPaginatedData:: ", err);
        res.status(500).json({ error: 'Failed to get paginated data', details: err })
    }
}