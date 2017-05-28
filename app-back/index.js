let path = require('path');
let express = require('express');
let app = express();

// compress all requests being served
let compression = require('compression');
app.use(compression());

// using bodyparser for POST body parsing
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// setting up pug as the view engine
app.set('views', path.join(__dirname, '..', 'app-front', 'views'));
app.set('view engine', 'pug');

// set up the db using seqelize
let Sequelize = require('sequelize');
let sequelize = new Sequelize({
    dialect: 'sqlite',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    logging: false,
    storage: './db.sqlite3'
});

app.get('/', function (req, res) {
    res.sendFile('index.html', {root: '../app-front/'});
});

app.get('/createBudget/', function (req, res) {
    res.sendFile('createBudget.html', {root: '../app-front/'});
});

app.get('/home/', function (req, res) {
    res.sendFile('home.html', {root: '../app-front/'});
});

app.get('/test/', function (req, res) {
    res.render('index');
});


// THE MAIN ROUTES FOR THE API
app.use('/budget/', require('./routes/budgetApi')(sequelize));
//app.use('/budget/', require('./routes/budgetApi_old'));

// STATIC STUFF
app.use('/lib/', express.static('../node_modules/bootstrap/dist/js/'));
app.use('/lib/', express.static('../node_modules/bootstrap/dist/css/'));
app.use('/lib/', express.static('../node_modules/jquery/dist/'));
app.use('/lib/', express.static('../node_modules/handlebars/dist/'));
app.use('/images/', express.static('../app-front/images/'));
app.use('/scripts/', express.static('../app-front/scripts/'));
app.use('/fonts/', express.static('../node_modules/bootstrap/fonts/'));

app.listen(3000, function () {
    console.log('WhatCanISpend app listening on port 3000!');
});







