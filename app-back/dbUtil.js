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
            budgetDb.run("PRAGMA FOREIGN_KEYS = ON");
            // TODO: need to handle foreign key constraint errors
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
// endDate and startDate should be unix epoch timestamp in SECONDS (not milliseconds)
function budgetAddItem(budgetId, itemName, itemCost, endDate, startDate) {
    if (isNaN(budgetId) || itemName=='' ||
        isNaN(itemCost) || isNaN(endDate) ||
        isNaN(startDate) || (startDate > endDate)) {
        return false;
    } else {
        // TODO: calculate the item's duration here ***

        var sqlite3 = require('sqlite3').verbose();
        var path = require('path');
        var budgetDb = new sqlite3.Database(path.join(__dirname, '..', 'database', 'budget.db'));
        budgetDb.serialize(function () {
            budgetDb.run("PRAGMA FOREIGN_KEYS = ON");
            budgetDb.get(
                "SELECT budget_types.id " +
                "FROM budget_types JOIN budgets ON budget_types.id = budgets.type_id " +
                "WHERE budgets.id = ?", [budgetId],
                function (err, row) {
                    var budgetTypeId = row? row.id : null;
                    var budgetDb2 = new sqlite3.Database(path.join(__dirname, '..', 'database', 'budget.db'));
                    budgetDb2.run("PRAGMA FOREIGN_KEYS = ON");
                    // TODO: need to handle foreign key constraint errors
                    budgetDb2.run("INSERT INTO items(budget_id, description, cost, duration, start_date, end_date)" +
                                  "VALUES (?, ?, ?, ?, DATE(?, 'unixepoch'), DATE(?, 'unixepoch'))",
                                  [budgetId, itemName, itemCost, getBudgetDuration(startDate, endDate, budgetTypeId), startDate, endDate]);
                    budgetDb2.close();
                }
            );
        });
        budgetDb.close();
        return true;
    }
}

function getBudgetDuration(startDate, endDate, budgetTypeId) {
    var WEEKLY = 1, MONTHLY = 2, YEARLY = 3;
    var duration = 0;
    var start = new Date(0), end = new Date(0);
    start.setUTCSeconds(startDate);
    end.setUTCSeconds(endDate);
    if (budgetTypeId == WEEKLY) {
        duration = parseInt((end - start) / (1000*60*60*24)/7) + 1;
    } else if (budgetTypeId == MONTHLY) {
        // TODO: not supported at the moment
        duration = -1;
    } else if (budgetTypeId == YEARLY) {
        // TODO: not supported at the moment
        duration = -1;
    } else {
        duration = -1;
    }
    return duration;
}

module.exports = {
    createBudget: createBudget,
    getAllBudgets: getAllBudgets,
    budgetAddItem: budgetAddItem
};