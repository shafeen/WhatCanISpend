var util = require('./util');
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


// THE MAIN ROUTES FOR THE APP
app.get('/budget/all/', function(req, res) {
    // TODO: complete this to return info about all available budgets
    res.json([
        {message: 'Hello, Earth!'},
        {message: 'Hello, Mars!'},
        {message: 'Hello, Venus!'}
    ]);
});

app.post('/budget/create/', function (req, res) {
    // TODO: complete this to create one budget
    var budgetName = req.body.name;
    var budgetAmt = parseInt(req.body.amount);
    if (budgetName != undefined && !Number.isNaN(budgetAmt) && budgetAmt > 0) {
        res.status(200).send(
            'Creating budget with\nname: ' + budgetName +
            '\namount: ' + budgetAmt
        );
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







