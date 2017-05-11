var dbUtil = require('../dbUtil');
let router = require('express').Router();

// [ params ]
//  name (String),
//  amount (Number),
//  type (String)
router.post('/create/', function (req, res) {
    console.log('received api request: /budget/create/');
    var budgetName = req.body.name;
    var budgetAmt = !isNaN(req.body.amount)? Number(req.body.amount) : null;
    var budgetType = req.body.type ? req.body.type : 'weekly';
    if (budgetName != undefined && budgetAmt != null && budgetAmt > 0) {
        dbUtil.createBudget(budgetName, budgetAmt, budgetType)
            .then(function (budgetObj) {
                res.status(201).json({
                    message: 'Successfully created budget: ' + budgetObj.name,
                    budget: budgetObj
                });
            }).catch(function (failReasonsObj) {
            if (failReasonsObj.type) {
                res.status(400).json({
                    message: 'Check parameters and try again.',
                    reasons: failReasonsObj
                });
            } else {
                res.status(500).json({
                    message: 'Server Error.',
                    reasons: failReasonsObj
                });
            }
        });
    } else {
        res.status(400).json({
            message: 'Check parameters and try again.',
            reasons: {
                name: (budgetName==undefined? 'in':'')+'valid name',
                amount: ((budgetAmt==null || budgetAmt <=0)? 'in':'')+'valid amount'
            }
        });
    }
});

router.get('/all/', function (req, res) {
    console.log('received api request: /budget/all/');
    dbUtil.getAllBudgets()
        .then(function (budgetsArray) {
            res.json(budgetsArray);
        }).catch(function () {
        res.status(500).json({
            message: 'Server error.'
        });
    });
});

// [ params ]
//  budgetId (int),
//  name (String),
//  cost (Number),
//  endDate (unix timestamp seconds),
//  startDate (unix timestamp seconds)
router.post('/additem/', function (req, res) {
    console.log('received api request: /budget/additem/');
    var budgetId = req.body.budgetId;
    var itemName = req.body.name;
    var itemCost = req.body.cost;
    var endDate = req.body.endDate;
    var startDate = req.body.startDate;
    dbUtil.budgetAddItem(budgetId, itemName, itemCost, endDate, startDate)
        .then(function (itemObj) {
            res.status(201).json({
                message: 'Added item',
                item: itemObj
            });
        }).catch(function (failReasonsObj) {
        var failStatus = (failReasonsObj.serverError)? 500 : 400;
        res.status(failStatus).json({
            message: failStatus==500? 'Server Error' : 'Check params and try again',
            reason: failReasonsObj
        });
    });

});

// [ params ]
//  budgetId (int)
router.get('/:id/info/', function (req, res) {
    console.log('received api request: /budget/:id/info/ (id = %d)', req.params.id);
    if(!isNaN(req.params.id)) {
        var budgetId = Number(req.params.id);
        dbUtil.getBudgetInfo(budgetId)
            .then(function (budgetInfoObj) {
                res.json(budgetInfoObj);
            }).catch(function (failReasonsObj){
            res.status(500).json({
                message: 'Server Error',
                reason: failReasonsObj
            });
        });
    } else {
        res.status(400).json({
            message: 'check params and try again',
            reason: {
                id: 'invalid'
            }
        });
    }
});

module.exports = router;