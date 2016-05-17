var util = require('./util');
var dbUtil = require('./dbUtil');
var express = require('express');
var app = express();

// compress all requests being served
var compression = require('compression');
app.use(compression());

// using bodyparser for POST body parsing
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function (req, res) {
    res.redirect('/home');
    //res.send(util.add('Hello again,', 'from the other siiiide!'));
});

app.get('/createBudget/', function (req, res) {
    res.sendFile('createBudget.html', {root: '../app-front/'});
});

app.get('/home/', function (req, res) {
    res.sendFile('home.html', {root: '../app-front/'});
});

app.get('/test/', function (req, res) {
    res.sendFile('index.html', {root: '../app-front/'});
});


// THE MAIN ROUTES FOR THE API

// [ params ]
//  name (String),
//  amount (Number),
//  type (String)
app.post('/budget/create/', function (req, res) {
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

app.get('/budget/all/', function (req, res) {
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
app.post('/budget/additem/', function (req, res) {
    var budgetId = req.body.budgetId;
    var itemName = req.body.name;
    var itemCost = req.body.cost;
    var endDate = req.body.endDate;
    var startDate = req.body.startDate;
    // TODO: use promises in dbUtil.budgetAddItem
    if(dbUtil.budgetAddItem(budgetId, itemName, itemCost, endDate, startDate)){
        res.status(201).json({
            message: 'Added item { name:'+itemName+', itemCost:'+itemCost+' }'
        });
    } else {
        res.status(400).json({
            message: 'Check parameters and try again.'
        });
    }

});

// STATIC STUFF
app.use('/lib/', express.static('../node_modules/bootstrap/dist/js/'));
app.use('/lib/', express.static('../node_modules/bootstrap/dist/css/'));
app.use('/lib/', express.static('../node_modules/jquery/dist/'));
app.use('/images/', express.static('../app-front/images/'));

app.listen(3000, function () {
    console.log('WhatCanISpend app listening on port 3000!');
});







