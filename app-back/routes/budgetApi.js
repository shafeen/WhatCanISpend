let dbSetup = require('../dbSetup');
let router = require('express').Router();

const BUDGET_TYPE_DEFAULT = 'weekly';
const POSSIBLE_BUDGET_TYPES = { weekly: true, monthly: true, yearly: true };

let reqParamValidators = {
    create: (req, res, next) => {
        var budgetName = req.body.name;
        var budgetAmt = !isNaN(req.body.amount)? Number(req.body.amount) : null;
        var budgetType = req.body.type ? req.body.type : BUDGET_TYPE_DEFAULT;
        if (budgetName != undefined &&
            budgetAmt != null &&
            budgetAmt > 0 &&
            POSSIBLE_BUDGET_TYPES[budgetType] == true) {
            req.createParams = {
                name: budgetName,
                amount: budgetAmt,
                type: budgetType
            };
            next();
        } else {
            res.status(400).json({
                message: 'Check create parameters and try again.',
                reasons: {
                    name: (budgetName==undefined? 'in':'')+'valid',
                    amount: ((budgetAmt==null || budgetAmt <=0)? 'in':'')+'valid',
                    type: (POSSIBLE_BUDGET_TYPES[budgetType] != true? 'in':'')+'valid'
                }
            });
        }
    },
    additem: (req, res, next) => {
        let budgetId = req.body.budgetId;
        let itemName = req.body.name;
        let itemCost = req.body.cost;
        let endDate = req.body.endDate;
        let startDate = req.body.startDate;
        if (isNaN(budgetId) || itemName=='' ||
            isNaN(itemCost) || isNaN(endDate) ||
            isNaN(startDate) || (startDate > endDate)) {
            res.status(400).json({
                message: 'Check create parameters and try again.',
                reason: {
                    budgetId: (isNaN(budgetId) ? 'in' : '') + 'valid',
                    name: (itemName == '' ? 'in' : '') + 'valid',
                    cost: (isNaN(itemCost) ? 'in' : '') + 'valid',
                    endDate: (isNaN(endDate) ? 'in' : '') + 'valid',
                    startDate: (isNaN(startDate) ? 'in' : '') + 'valid',
                    other: (startDate > endDate) ? 'startDate must be before endDate' : 'n/a'
                }
            });
        } else {
            req.addItemParams = {
                budgetId: req.body.budgetId,
                itemName: req.body.name,
                itemCost: req.body.cost,
                endDate: req.body.endDate,
                startDate: req.body.startDate
            };
            next();
        }
    }
};

function getBudgetDuration(startDate, endDate, budgetType) {
    var WEEKLY = 'weekly', MONTHLY = 'monthly', YEARLY = 'yearly';
    var duration = 1;
    var start = new Date(0), end = new Date(0);
    start.setUTCSeconds(startDate);
    end.setUTCSeconds(endDate);
    if (budgetType == WEEKLY) {
        duration = parseInt((end - start) / (1000*60*60*24)/7) + 1;
    } else if (budgetType == MONTHLY) {
        while (start.getTime() != end.getTime()) {
            var startMonth = start.getMonth();
            start.setDate(start.getDate() + 1);
            if (startMonth != start.getMonth()) {
                duration++;
            }
        }
    } else if (budgetType == YEARLY) {
        duration = end.getFullYear() - start.getFullYear() + 1;
    } else {
        duration = -1;
    }
    return duration;
}

module.exports = function(sequelize) {

    let dbSync = dbSetup(sequelize);

    // create a new budget and return the budget object
    router.post('/create/', reqParamValidators.create, (req, res) => {
        console.log('received api request: /budget/create/');

        let db = null;
        dbSync.then((_db) => {
            db = _db;
            return db.BudgetType.findOrCreate({where : {name: req.createParams.type}, defaults: {}});
        }).spread((budgetType) => {
            let budget = db.Budget.build({
                name : req.createParams.name,
                amount : req.createParams.amount
            });
            budget.setBudget_type(budgetType, {save: false});
            return budget.save();
        }).then((budget) => {
            res.status(201).json({
                message: 'Successfully created budget: ' + budget.get('name'),
                budget: {
                    name: budget.get('name'),
                    amount: budget.get('amount'),
                    type: req.createParams.type
                }
            });
        }).catch((reason) => {
            res.status(500).json({
                message: 'Server Error.'
            });
        });
    });

    router.get('/all/', (req, res) => {
        console.log('received api request: /budget/all/');

        dbSync.then((db) => {
            return db.Budget.findAll({
                include: [{ model: db.BudgetType}]
            });
        }).then((budgets) => {
            budgets = budgets.map((budget) => {
                return {
                    id: budget.get('name'),
                    name: budget.get('name'),
                    amount: budget.get('amount'),
                    type: budget.get('budget_type').name
                }
            });
            res.json(budgets);
        });
    });

    router.post('/additem/', reqParamValidators.additem, (req, res) => {
        // todo: complete this and extract it to a dbUtil.js file
        let db = null;
        dbSync.then((_db) => {
            db = _db;
            return db.Budget.findOne({
                where: {id : req.addItemParams.budgetId},
                include: [{ model: db.BudgetType }]
            });
        }).then((budget) => {
            return db.Item.create({
                description: req.addItemParams.itemName,
                cost: req.addItemParams.itemCost,
                duration: getBudgetDuration(req.addItemParams.startDate,
                    req.addItemParams.endDate, budget.get('budget_type').name),
                start_date: new Date(req.addItemParams.startDate*1000),
                end_date: new Date(req.addItemParams.endDate*1000)
            }).then((item) => {
                budget.addItem(item);
                return item;
            });
        }).then((item) => {
            res.status(201).json({
                message: 'Added item',
                item: {
                    id: item.get('id'),
                    description: item.get('description'),
                    cost: item.get('cost'),
                    duration: item.get('duration'),
                    start_date: item.get('start_date'),
                    end_date: item.get('end_date')
                }
            });
        });
    });

    return router;
};