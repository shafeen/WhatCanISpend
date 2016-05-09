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
    // TODO: return something better since we can't return the lastId
    return null;
}

module.exports = {
    createBudget: createBudget
};