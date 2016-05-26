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
- [X] Get all information regarding a specific budget:
    - ***GET*** ```/budget/:id/info/```


**Web Interface**
- [ ] List and view all existing budgets.
    - [ ] Option to create a budget at the end of the list.
- [ ] Click on a budget and be able to view all items in that budget.
    - [ ] Option to add items at the end of the item list.
- [ ] Edit items and information about a specific budget.
    - [ ] more details to be added soon.... 