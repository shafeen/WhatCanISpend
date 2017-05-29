let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let assert = chai.assert;
let expect = chai.expect;

let SERVER_ADDR = 'http://localhost:3000';

describe('Testing the /budget/ api', function () {

    describe('/budget/create/', function () {
        it('should create and return a budget object in the JSON response', function (done) {
            chai.request(SERVER_ADDR)
                .post('/budget/create/')
                .send({name: 'Test Budget', amount: 1250, type: 'yearly'})
                .end(function (err, res) {
                    let creationResponse = res.body;
                    let budget = creationResponse.budget;
                    expect(res.status).to.equal(201);
                    expect(budget.name).to.equal('Test Budget');
                    expect(budget.amount).to.equal(1250);
                    expect(budget.type).to.equal('yearly');
                    done();
                });
        });
    });

    describe('/budget/all/', function () {
        it('should return an array of correct budget objects as JSON', function (done) {
            chai.request(SERVER_ADDR)
                .get('/budget/all/')
                .end(function (err, res) {
                    let budgetObjects = res.body;
                    if(budgetObjects) {
                        let firstBudget = budgetObjects[0];
                        expect(budgetObjects).to.be.a('array');
                        expect(firstBudget).to.be.a('object');
                        expect(Object.keys(firstBudget)).to.have.lengthOf(4);
                        expect(firstBudget.id).to.be.a('number');
                        expect(firstBudget.name).to.be.a('string');
                        expect(firstBudget.amount).to.be.a('number');
                        expect(firstBudget.type).to.be.oneOf(['weekly', 'monthly', 'yearly']);
                    }
                    done();
                });
        });
    });

    describe('/budget/additem/', function () {
        it('should add item to budget id#1 then return the item object in the JSON response', function (done) {
            chai.request(SERVER_ADDR)
                .post('/budget/additem')
                .send({
                    budgetId: 1,
                    name: 'test item: bananas',
                    cost: 3.25,
                    startDate: new Date().getTime()/1000,
                    endDate: new Date().getTime()/1000
                }).end(function (err, res) {
                    let itemObj = res.body.item;
                    expect(res.status).to.equal(201);
                    expect(itemObj.id).to.be.a('number');
                    expect(itemObj.description).to.equal('test item: bananas');
                    expect(itemObj.cost).to.equal(3.25);
                    done();
                });
        });
    });

    describe('/budget/1/info/', function () {
        it('should return the info for budget id#1 as JSON', function (done) {
            chai.request(SERVER_ADDR)
                .get('/budget/1/info')
                .end(function (err, res) {
                    let budgetInfoObj = res.body;
                    let items = budgetInfoObj.items;
                    expect(res.status).to.equal(200);
                    expect(budgetInfoObj.budgetAmount).to.be.a('number');
                    expect(budgetInfoObj.budgetName).to.be.a('string');
                    expect(budgetInfoObj.budgetType).to.be.oneOf(['weekly', 'monthly', 'yearly']);
                    expect(items).to.be.an('array');
                    if(items.length) {
                        expect(items[0].start_date).to.be.a('string');
                        expect(items[0].end_date).to.be.a('string');
                    }
                    done();
                });
        });
    });

    describe('budget/delete/:id', function () {
        it('should be able to delete an existing budget', function () {
            // TODO: complete stub function
        });
    });

});

