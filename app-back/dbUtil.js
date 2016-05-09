function createBudget(name, amount, type) {
    var sqlite3 = require('sqlite3').verbose();
    var path = require('path');

    //var budgetDb = new sqlite3.Database('../database/budget.db'); // <--- also works
    var budgetDb = new sqlite3.Database(path.join(__dirname, '..', 'database', 'budget.db'));
    var budgetTypeId = null;
    budgetDb.serialize(function() {
        budgetDb.run("PRAGMA FOREIGN_KEYS = ON");
        budgetDb.get("SELECT id from budget_types WHERE budget_types.name=? LIMIT 1", [type], function (err, row) {
            budgetTypeId = row? row.id : null;
            var budgetDb2 = new sqlite3.Database(path.join(__dirname, '..', 'database', 'budget.db'));
            budgetDb2.run("INSERT INTO budgets(type_id, name, amount) VALUES (?,?,?)", [budgetTypeId, name, amount]);
            budgetDb2.close();
        });
    });
    budgetDb.close();
}

function getAllBudgets(req, res) {
    var sqlite3 = require('sqlite3').verbose();
    var path = require('path');
    var returnObj = [];
    var budgetDb = new sqlite3.Database(path.join(__dirname, '..', 'database', 'budget.db'));
    budgetDb.serialize(function () {
        budgetDb.each("select budgets.id, budgets.name, budget_types.name type, amount " +
            "from budgets JOIN budget_types on budget_types.id=budgets.type_id",
            function(err, row) {
                returnObj.push({
                    id: row.id,
                    name: row.name,
                    amount: row.amount,
                    type: row.type
                });
            },
            function () {
                res.json(returnObj);
            }
        );
    });
    budgetDb.close();
}

//params: {budgetId: *int*, itemName: *str*, itemCost: *int*, endDate: *datetime str*}
function budgetAddItem(budgetId, itemName, itemCost, endDate, startDate) {
    //TODO: calculate duration based off the startdate and enddate

    var sqlite3 = require('sqlite3').verbose();
    var path = require('path');
    var budgetDb = new sqlite3.Database(path.join(__dirname, '..', 'database', 'budget.db'));
    // TODO: add item logic goes here ...
    budgetDb.close();
}

module.exports = {
    createBudget: createBudget,
    getAllBudgets: getAllBudgets
};