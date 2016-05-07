var util = require('./util');
var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send(util.add('Hello again,', 'from the other siiiide!'));
});

app.get('/createBudget', function (req, res) {
    res.sendFile('createBudget.html', {root: '../app-front/'});
});

app.get('/home', function (req, res) {
    res.sendFile('home.html', {root: '../app-front/'});
});

app.get('/test/', function (req, res) {
  res.sendFile('index.html', {root: '../app-front/'});
});


// STATIC STUFF
app.use('/lib/', express.static('../node_modules/bootstrap/dist/js/'));
app.use('/lib/', express.static('../node_modules/bootstrap/dist/css/'));
app.use('/lib/', express.static('../node_modules/jquery/dist/'));
app.use('/images/', express.static('../app-front/images/'));

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});







