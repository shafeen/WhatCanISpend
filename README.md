# WhatCanISpend
The budget application we were all looking for!!!!

**Overall Goals**
- weekly/monthly/yearly allowance tracking
- amortize item costs (start - end)
- calculate amount of spending money available per week/month/year
- display the amounts in chart form.
- display reasonable hints/tips/data from the available data


**RESTful API**
- Creating a budget:
    - ***POST*** ```/budget/create/```
    - params: {name: *String*, amount: *Number*, type: *String*}
- List all budgets:
    - ***GET*** ```/budget/all/```
- Add an item to the budget: ***(weekly amortized items only for now)***
    - ***POST*** ```/budget/additem/```
    - params: {budgetId: *int*, itemName: *String*, itemCost: *Number*, startDate: *datetime str*, endDate: *datetime str*}
- Get all information regarding a specific budget:
    - ***GET*** ```/budget/:id/info/```


**Web Interface**
- [X] Ability to create a budget available with navigation options.
- [X] List and view all existing budgets.
- [X] Click on a budget and be able to view all items in that budget.
    - [X] Option to add items displayed with the item list.
- [ ] Ability to delete items from a budget list.
- [ ] Edit items and information about a specific budget.
    - [ ] more details to be added soon.... 