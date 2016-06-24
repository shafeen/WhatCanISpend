var dateUtil = (function () {
    var budgetTypes = {
        WEEKLY : 'weekly',
        MONTHLY : 'monthly',
        YEARLY : 'yearly'
    };

    function getStartDateFor(date, budgetType) {
        date = date ? date : new Date();
        if (budgetType == budgetTypes.WEEKLY) {
            while (date.getDay() != 0) {
                date.setDate(date.getDate()-1);
            }
        } else if (budgetType == budgetTypes.MONTHLY) {
            date.setDate(1);
        } else if (budgetType == budgetTypes.YEARLY) {
            date.setMonth(0);
            date.setDate(1);
        }
        return date;
    }

    function getEndDateFor(date, budgetType) {
        date = date ? date : new Date();
        if (budgetType == budgetTypes.WEEKLY) {
            date.setDate(date.getDate()+(6-date.getDay()));
        } else if (budgetType == budgetTypes.MONTHLY) {
            date.setMonth(date.getMonth()+1);
            date.setDate(0);
        } else if (budgetType == budgetTypes.YEARLY) {
            date.setYear(date.getFullYear()+1);
            date.setMonth(0);
            date.setDate(0);
        }
        return date;
    }

    function getAmortizeLenRemainingFromToday(itemEndDate, budgetType) {
        itemEndDate = getEndDateFor(itemEndDate, budgetType); // floor value for the date according to budgetType
        var startingPoint = getEndDateFor(new Date(), budgetType);
        var amortizeLen = 1;
        while (startingPoint < itemEndDate) {
            startingPoint.setDate(startingPoint.getDate() + 1);
            startingPoint = getEndDateFor(startingPoint, budgetType);
            amortizeLen += (startingPoint < itemEndDate)? 1 : 0;
        }
        return amortizeLen;
    }

    function convertISOtoAmericanStr(isoDateStr) {
        isoDateStr = isoDateStr.split('-');
        return isoDateStr[1] + '/' + isoDateStr[2] + '/' + isoDateStr[0];
    }

    function getReadableDate(date) {
        var dateStr = String(date.getDate());
        var lastDigit = dateStr.substr(dateStr.length-1, 1);
        var postfix = '';
        if (lastDigit == 1) {
            postfix = 'st';
        } else if (lastDigit == 2) {
            postfix = 'nd';
        } else if (lastDigit == 3) {
            postfix = 'rd';
        } else {
            postfix = 'th';
        }
        return date.getDate() + postfix;
    }

    function getReadableMonth(date) {
        var month = date.getMonth();
        if (month == 0) {
            return 'January';
        } else if (month == 1) {
            return 'February';
        } else if (month == 2) {
            return 'March';
        } else if (month == 3) {
            return 'April';
        } else if (month == 4) {
            return 'May';
        } else if (month == 5) {
            return 'June';
        } else if (month == 6) {
            return 'July';
        } else if (month == 7) {
            return 'August';
        } else if (month == 8) {
            return 'September';
        } else if (month == 9) {
            return 'October';
        } else if (month == 10) {
            return 'November';
        } else {
            return 'December';
        }
    }

    function getFullReadableDate(date) {
        return getReadableDate(date) + ' ' +
            getReadableMonth(date) + ' ' + date.getFullYear();
    }

    return {
        getStartDateFor : getStartDateFor,
        getEndDateFor : getEndDateFor,
        getAmortizeLenRemainingFromToday : getAmortizeLenRemainingFromToday,
        convertISOtoAmericanStr : convertISOtoAmericanStr,
        getReadableDate : getReadableDate,
        getReadableMonth : getReadableMonth,
        getFullReadableDate : getFullReadableDate
    }
})();
