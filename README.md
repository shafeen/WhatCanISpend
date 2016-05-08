# WhatCanISpend
The budget application we were all looking for!!!!

**Overall Goals**
- weekly/monthly/yearly allowance tracking
- amortize item costs (start - end)
- calculate amount of spending money available per week/month/year
- display the amounts in chart form.
- display reasonable hints/tips/data from the available data


**RESTful API**
- [ ] Creating a budget:
    - ***POST*** ```/budget/create/```
    - params: {name: *str*, amount: *int*}
- [ ] List all budgets:
    - ***GET*** ```/budget/all/```
- [ ] Add an item to the budget:
    - ***POST*** ```/budget/additem/```
    - params: {budgetId: *int*, itemName: *str*, itemCost: *int*, endDate: *datetime str*}
- [ ] Get all items in a budget:
    - ***GET*** ```/budget/:id/getitems/```
