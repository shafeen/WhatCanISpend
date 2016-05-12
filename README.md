# WhatCanISpend
The budget application we were all looking for!!!!

**Overall Goals**
- weekly/monthly/yearly allowance tracking
- amortize item costs (start - end)
- calculate amount of spending money available per week/month/year
- display the amounts in chart form.
- display reasonable hints/tips/data from the available data


**RESTful API**
- [X] Creating a budget:
    - ***POST*** ```/budget/create/```
    - params: {name: *String*, amount: *Number*, type: *String*}
- [X] List all budgets:
    - ***GET*** ```/budget/all/```
- [X] Add an item to the budget: ***(weekly amortized items only for now)***
    - ***POST*** ```/budget/additem/```
    - params: {budgetId: *int*, itemName: *String*, itemCost: *Number*, startDate: *datetime str*, endDate: *datetime str*}
- [ ] Get all items in a budget:
    - ***GET*** ```/budget/:id/getitems/```
