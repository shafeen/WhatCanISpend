var dateUtil = (function () {
    var budgetTypes = {
        WEEKLY : 'weekly',
        MONTHLY : 'monthly',
        YEARLY : 'yearly'
    };

    var months = {
        0: 'January',
        1: 'February',
        2: 'March',
        3: 'April',
        4: 'May',
        5: 'June',
        6: 'July',
        7: 'August',
        8: 'September',
        9: 'October',
        10: 'November',
        11: 'December'
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
        var monthNum = date.getMonth();
        return months[monthNum];
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
