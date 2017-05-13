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
    }
};


module.exports = function(sequelize) {

    // create a new budget and return the budget object
    router.post('/create/', reqParamValidators.create, (req, res) => {
        console.log('received api request: /budget/create/');

        // TODO: extract these into a dbUtil.js file
        let BudgetType = require('../database/models/BudgetType')(sequelize);
        let Budget = require('../database/models/Budget')(sequelize);
        Budget.belongsTo(BudgetType);

        dbSetup(sequelize).then(() => {
            return BudgetType.findOrCreate({where : {name: req.createParams.type}, defaults: {}});
        }).spread((budgetType) => {
            let budget = Budget.build({
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

        // TODO: extract these into a dbUtil.js file
        let BudgetType = require('../database/models/BudgetType')(sequelize);
        let Budget = require('../database/models/Budget')(sequelize);
        Budget.belongsTo(BudgetType);


        dbSetup(sequelize).then(() => {
            Budget.findAll({
                include: [{ model: BudgetType}]
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
            })
        });
    });


    return router;
};