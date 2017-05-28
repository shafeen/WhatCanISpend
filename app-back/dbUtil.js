let Promise = require('bluebird');
let sqlite3 = require('sqlite3').verbose();
let path = require('path');

function getBudgetDuration(startDate, endDate, budgetTypeId) {
    let WEEKLY = 1, MONTHLY = 2, YEARLY = 3;
    let duration = 1;
    let start = new Date(0), end = new Date(0);
    start.setUTCSeconds(startDate);
    end.setUTCSeconds(endDate);
    if (budgetTypeId == WEEKLY) {
        duration = parseInt((end - start) / (1000*60*60*24)/7) + 1;
    } else if (budgetTypeId == MONTHLY) {
        while (start.getTime() != end.getTime()) {
            let startMonth = start.getMonth();
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

// TODO: extract budget api logic into this file from budgetApi.js

module.exports = {

};