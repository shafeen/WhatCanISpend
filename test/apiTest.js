var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var assert = chai.assert;
var expect = chai.expect;

describe('Testing the /budget/ api', function () {
    describe('/budget/all/', function () {
        it('should return an array of correct budget objects as JSON', function (done) {
            chai.request('http://localhost:3000')
                .get('/budget/all/')
                .end(function (err, res) {
                    let budgetObjects = res.body;
                    if(budgetObjects) {
                        let firstBudget = budgetObjects[0];
                        expect(budgetObjects).to.be.a('array');
                        expect(firstBudget).to.be.a('object');
                        expect(Object.keys(firstBudget)).to.have.lengthOf(4);
                        expect(firstBudget.type).to.be.oneOf(['weekly', 'monthly', 'yearly']);
                    }
                    done();
                });
        });
    });

    describe('/budget/create/', function () {
        it('should create and return a budget object as JSON', function (done) {
            chai.request('http://localhost:3000')
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


});

