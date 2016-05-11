var util = require('./util');
var dbUtil = require('./dbUtil');
var express = require('express');
var app = express();

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
app.post('/budget/create/', function (req, res) {
    // TODO: use promises
    var budgetName = req.body.name;
    var budgetAmt = !isNaN(req.body.amount)? parseInt(req.body.amount) : null;
    var budgetType = req.body.type ? req.body.type : 'weekly';
    if (budgetName != undefined && budgetAmt != null && budgetAmt > 0) {
        dbUtil.createBudget(budgetName, budgetAmt, budgetType);
        res.status(201).json({
            message: 'Created budget { name:'+budgetName+', amount:'+budgetAmt+' }'
        });
    } else {
        res.status(400).json({
            message: 'Check parameters and try again.'
        });
    }
});

app.get('/budget/all/', function (req, res) {
    // TODO: use promises
    var budgets = dbUtil.getAllBudgets(req, res);
});

app.post('/budget/additem/', function (req, res) {
    var budgetId = req.body.budgetId;
    var itemName = req.body.name;
    var itemCost = req.body.cost;
    var endDate = req.body.endDate;
    var startDate = req.body.startDate;
    // TODO: complete the dbUtil function and verify the parameters
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
    console.log('Example app listening on port 3000!');
});







