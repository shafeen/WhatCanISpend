var express = require('express');
var app = express();
app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/node_modules/bootstrap/dist/js/bootstrap.js', function (req, res) {
    res.sendfile('node_modules/bootstrap/dist/js/bootstrap.js');
});
app.get('/node_modules/bootstrap/dist/css/bootstrap.css', function (req, res) {
    res.sendfile('node_modules/bootstrap/dist/css/bootstrap.css');
});
app.get('/node_modules/bootstrap/dist/css/bootstrap-theme.css', function (req, res) {
    res.sendfile('node_modules/bootstrap/dist/css/bootstrap-theme.css');
});
app.get('/node_modules/jquery/dist/jquery.js', function (req, res) {
    res.sendfile('node_modules/jquery/dist/jquery.js');
});
app.get('/whatCanISpend.jpg', function (req, res) {
    res.sendfile('whatCanISpend.jpg');
});
app.get('/createBudget.png', function (req, res) {
    res.sendfile('createBudget.png');
});
app.get('/listOfBudgets.png', function (req, res) {
    res.sendfile('listOfBudgets.png');
});

app.get('/shafeen', function (req, res) {
  res.send('<b>Hello Shafeen!</b>');
});

app.get('/budget/monthly/', function (req, res) {
  res.send('<b>Hello Rashmi!</b>');
});

app.get('/our/site/', function (req, res) {
  res.sendfile('index.html');
});

app.get('/createBudget', function (req, res) {
    res.sendfile('createBudget.html');
});


app.get('/our/site/again', function (req, res) {
  res.sendfile('index.html');
});

app.get('/budget', function (req, res) {
    res.sendfile('home.html');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
