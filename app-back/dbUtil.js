var Promise = require('bluebird');
var sqlite3 = require('sqlite3').verbose();
var path = require('path');

function createBudget(name, amount, type) {
    return new Promise(function (resolve, reject) {
        getSelectQueryResults("SELECT id from budget_types WHERE budget_types.name=? LIMIT 1", [type])
        .then(function (resultArray) {
            if (!resultArray.length) {
                reject({type: 'invalid budget type: ' + type});
                return;
            }
            var budgetTypeId = resultArray[0].id;
            runInsertQuery("INSERT INTO budgets(type_id, name, amount) VALUES (?,?,?)", [budgetTypeId, name, amount])
            .then(function (lastInsertedId) {
                resolve({
                    id: lastInsertedId,
                    name: name,
                    type: type,
                    amount: amount
                });
            }).catch(function (errorObj) {
                reject(errorObj);
            });
        }).catch(function (errorObj) {
            reject(errorObj);
        });
    });
}

function getAllBudgets() {
    return new Promise(function (resolve, reject) {
        getSelectQueryResults("SELECT budgets.id, budgets.name, " +
            "amount, budget_types.name type " +
            "FROM budgets " +
            "JOIN budget_types on budget_types.id=budgets.type_id")
        .then(function (budgetObjsArray) {
            resolve(budgetObjsArray);
        }).catch(function (errorObj) {
            reject(errorObj);
        });
    });
}

//params: {budgetId: *int*, itemName: *str*, itemCost: *int*, endDate: *datetime str*}
// endDate and startDate should be unix epoch timestamp in SECONDS (not milliseconds)
function budgetAddItem(budgetId, itemName, itemCost, endDate, startDate) {
    return new Promise(function (resolve, reject) {
        if (isNaN(budgetId) || itemName=='' ||
            isNaN(itemCost) || isNaN(endDate) ||
            isNaN(startDate) || (startDate > endDate)) {
            reject({
                budgetId: (isNaN(budgetId)? 'in':'')+'valid',
                name: (itemName==''? 'in':'')+'valid',
                cost: (isNaN(itemCost)? 'in':'')+'valid',
                endDate: (isNaN(endDate)? 'in':'')+'valid',
                startDate: (isNaN(startDate)? 'in':'')+'valid',
                other: (startDate > endDate)? 'startDate must be before endDate':'n/a',
                serverError: false
            });
        } else {
            getSelectQueryResults("SELECT budget_types.id " +
                "FROM budget_types JOIN budgets " +
                "ON budget_types.id = budgets.type_id " +
                "WHERE budgets.id = ?", [budgetId])
            .then(function (resultArray) {
                var budgetTypeId = resultArray[0].id;
                runInsertQuery("INSERT INTO items(budget_id, description, cost, duration, start_date, end_date)" +
                    "VALUES (?, ?, ?, ?, DATE(?, 'unixepoch'), DATE(?, 'unixepoch'))",
                    [budgetId, itemName, itemCost, getBudgetDuration(startDate, endDate, budgetTypeId), startDate, endDate])
                .then(function (lastInsertedId) {
                    resolve({
                        id: lastInsertedId,
                        name: itemName,
                        cost: itemCost
                    });
                }).catch(function (errorObj) {
                    reject({serverError: true});
                });
            }).catch(function (errorObj) {
                reject({serverError: true});
            });
        }
    });
}

function getBudgetDuration(startDate, endDate, budgetTypeId) {
    var WEEKLY = 1, MONTHLY = 2, YEARLY = 3;
    var duration = 1;
    var start = new Date(0), end = new Date(0);
    start.setUTCSeconds(startDate);
    end.setUTCSeconds(endDate);
    if (budgetTypeId == WEEKLY) {
        duration = parseInt((end - start) / (1000*60*60*24)/7) + 1;
    } else if (budgetTypeId == MONTHLY) {
        while (start.getTime() != end.getTime()) {
            var startMonth = start.getMonth();
            start.setDate(start.getDate() + 1);
            if (startMonth != start.getMonth()) {
                duration++;
            }
        }
    } else if (budgetTypeId == YEARLY) {
        duration = end.getFullYear() - start.getFullYear() + 1;
    } else {
        duration = -1;
    }
    return duration;
}

function getBudgetInfo(budgetId) {
    return new Promise(function (resolve, reject) {
        getSelectQueryResults("SELECT budget_types.name " +
            "FROM budget_types JOIN budgets " +
            "ON budget_types.id = budgets.type_id " +
            "WHERE budgets.id = ?", [budgetId])
        .then(function (resultArray) {
            var budgetTypeName = resultArray[0].name;
            getSelectQueryResults(
                "SELECT budgets.name, items.id item_id, " +
                "items.description, items.cost, " +
                "items.duration, budget_types.name budget_type, " +
                "DATE(items.start_date) start_date, DATE(items.end_date) end_date " +
                "FROM budgets JOIN " +
                "items ON budgets.id = items.budget_id JOIN " +
                "budget_types ON budgets.type_id = budget_types.id " +
                "WHERE budgets.id=? AND " +
                "start_date <= DATE(?, 'unixepoch') AND " +
                "end_date >= DATE(?, 'unixepoch')",
                [budgetId, getEndDateFor(new Date(), budgetTypeName), getStartDateFor(new Date(), budgetTypeName)])
            .then(function (itemObjsArray) {
                var budgetInfoObj = {
                    budgetName: itemObjsArray.length? itemObjsArray[0].name : undefined,
                    budgetType: itemObjsArray.length? itemObjsArray[0].budget_type : undefined,
                    items: itemObjsArray.length? itemObjsArray : []
                };
                budgetInfoObj.items.forEach(function (item) {
                    delete item.name;
                    delete item.budget_type;
                });
                resolve(budgetInfoObj);
            }).catch(function (errorObj) {
                reject(errorObj);
            });
        }).catch(function (errorObj) {
            reject(errorObj);
        });
    });
}

function getStartDateFor(date, budgetType) {
    date = date ? date : new Date();
    if (budgetType == 'weekly') {
        while (date.getDay() != 0) {
            date.setDate(date.getDate()-1);
        }
    } else if (budgetType == 'monthly') {
        date.setDate(1);
    } else if (budgetType == 'yearly') {
        date.setMonth(0);
        date.setDate(1);
    }
    return parseInt(date.getTime()/1000);
}

function getEndDateFor(date, budgetType) {
    date = date ? date : new Date();
    if (budgetType == 'weekly') {
        while (date.getDay() != 6) {
            date.setDate(date.getDate()+1);
        }
    } else if (budgetType == 'monthly') {
        date.setMonth(date.getMonth()+1);
        date.setDate(0);
    } else if (budgetType == 'yearly') {
        date.setYear(date.getFullYear()+1);
        date.setMonth(0);
        date.setDate(0);
    }
    return parseInt(date.getTime()/1000);
}

function getSelectQueryResults(query, params) {
    return new Promise(function (resolve, reject) {
        var returnObj = [];
        var budgetDb = new sqlite3.Database(path.join(__dirname, '..', 'database', 'budget.db'));
        budgetDb.serialize(function () {
            budgetDb.each(query, params,
                function(err, row) {
                    if (err) {
                        reject({});
                    } else {
                        returnObj.push(row);
                    }
                },
                function () {
                    resolve(returnObj);
                }
            );
        });
        budgetDb.close();
    });
}

function runInsertQuery(query, params) {
    return new Promise(function (resolve, reject) {
        var budgetDb = new sqlite3.Database(path.join(__dirname, '..', 'database', 'budget.db'));
        budgetDb.serialize(function () {
            budgetDb.run("PRAGMA FOREIGN_KEYS = ON");
            budgetDb.run(query, params, function (err) {
                if(!err) {
                    resolve(this.lastID);
                } else {
                    reject({});
                }
            });
        });
        budgetDb.close();
    });
}

module.exports = {
    createBudget: createBudget,
    getAllBudgets: getAllBudgets,
    budgetAddItem: budgetAddItem,
    getBudgetInfo: getBudgetInfo
};