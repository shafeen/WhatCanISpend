var budgetPageUtil = (function($) {

    var _clickHandlers = {
        budgetCreate: function budgetCreate (e) {
            var $createBudgetModal = $('#modal-create-budget');
            var requestParams = {
                name: $createBudgetModal.find('#budget-name').val(),
                amount: $createBudgetModal.find('#budget-amount').val(),
                type: $createBudgetModal.find('#budget-type').val()
            };
            $.post('/budget/create/', requestParams).done(function (successInfoObj) {
                alert(successInfoObj.message);
                $createBudgetModal.find('#budget-name, #budget-amount, #budget-type').val('');
                $('#modal-create-budget').modal('hide');
            }).fail(function (failInfoObj) {
                alert(failInfoObj.responseText);
            });
        },
        budgetAddItem: function budgetAddItem (e) {
            var addItemParams =  {
                budgetId : parseInt($(e.target).attr('data-budget-id')),
                name : $('#item-name').val(),
                cost : $('#item-amount').val(),
                endDate : new Date($('#item-end-date').val()).getTime()/1000,
                startDate : new Date($('#item-start-date').val()).getTime()/1000
            };
            if (!addItemParams.name) {
                alert('Please enter a name for the item!');
                $('#item-name').focus();
            } else if (isNaN(addItemParams.cost) || Number(addItemParams.cost) <= 0) {
                alert('Item cost must be a number and nonzero!');
                $('#item-amount').focus();
            } else if (isNaN(addItemParams.startDate)) {
                alert('Please enter a valid start date!');
                $('#item-start-date').val('').focus();
            } else if (isNaN(addItemParams.endDate)) {
                alert('Please enter a valid end date!');
                $('#item-end-date').val('').focus();
            } else {
                $.post('/budget/addItem/', addItemParams).done(function () {
                    alert('Added item to budget.');
                    $('#item-name, ' +
                      '#item-amount, ' +
                      '#item-start-date, ' +
                      '#amortize-length, ' +
                      '#item-end-date').val('');
                    $('#modal-add-item').modal('hide');
                    _clickHandlers.budgetGetInfo(e); // reload info for this budget item list
                }).fail(function (failInfoObj) {
                    alert('Could not add item!\n'+failInfoObj.responseText);
                });
            }
        },
        budgetListAll: function budgetListAll (e) {
            $.get('/budget/all/').done(function (budgetList) {
                var $budgetList = $('#budgetList').empty();
                var $budgets = $(_compiledTemplate('budgetListAccordionTemplate')({budgets: budgetList}));
                $budgetList.append($budgets);
                $budgets.hide().fadeIn('slow');
                // attach click handlers to each of the "Get Info" budgets
                $('.get-budget-info-btn').each(function () {
                    $(this).click(_clickHandlers.budgetGetInfo);
                });

            }).fail(function () {
                alert("Couldn't get budget list!");
            })
        },
        budgetGetInfo: function budgetGetInfo (e) {
            var budgetId = $(e.target).attr('data-budget-id');
            var infoApiPath = '/budget/'+budgetId+'/info/';
            $.get(infoApiPath).done(function (budgetInfo) {
                var budgetType = $(e.target).attr('data-budget-type');
                budgetInfo.items = budgetInfo.items.map(function (item) {
                    var durationPostfix;
                    if (budgetType == 'weekly') {
                        durationPostfix = ' week(s)'
                    } else if (budgetType == 'monthly') {
                        durationPostfix = ' month(s)';
                    } else if (budgetType == 'yearly') {
                        durationPostfix = ' year(s)';
                    } else {
                        durationPostfix = ' unit(s)';
                    }
                    item.durationStr = item.duration + durationPostfix;
                    return item;
                });
                var $budgetItemList = $('.budgetItemList').filter('[data-budget-id=' + budgetId + ']');
                var $items = $(_compiledTemplate('listItemTemplate')(budgetInfo));
                $budgetItemList.empty().append($items);
                $items.hide().fadeIn('slow');
                $budgetItemList.find('[data-toggle="tooltip"]').tooltip();
                $budgetItemList.find('.budget-add-item-show-btn').click(function () {
                    $('#budget-add-item-btn').attr('data-budget-id', budgetId);
                    $('#amortize-length').attr('data-budget-type', budgetType);
                });
            }).fail(function () {
                alert("Couldn't get budget info from: "+infoApiPath);
            });
        }
    };

    var _changeHandlers = {
        itemAmortizeLen: function itemAmortizeLen(e) {
            var DEFAULT_AMORTIZE_LEN = 1;
            var amortizeLen = $(this).val();
            var startDate = $('#item-start-date').val();
            if (!isNaN(amortizeLen) && Number(amortizeLen) > 0 && startDate) {
                var budgetType = $(e.target).attr('data-budget-type');
                amortizeLen = parseInt(Number(amortizeLen));
                var endDate = new Date(startDate);
                $(this).val(amortizeLen);
                if (budgetType == 'weekly') {
                    while (amortizeLen > 1) {
                        endDate.setDate(endDate.getDate() + 7);
                        amortizeLen--;
                    }
                    while (endDate.getDay() !== 6) { // choose saturday of final week
                        endDate.setDate(endDate.getDate() + 1);
                    }
                    ;
                } else if (budgetType == 'monthly') {
                    // TODO: this way of finding the last day of the month can be easily improved
                    while (amortizeLen > 1) {
                        var startMonth = endDate.getMonth();
                        while (startMonth == endDate.getMonth()) {
                            endDate.setDate(endDate.getDate() + 1);
                        }
                        amortizeLen--;
                        endDate.setDate(endDate.getDate() + 27);
                    }
                    // choose the last day of that month
                    var startMonth = endDate.getMonth();
                    while (startMonth == endDate.getMonth()) {
                        endDate.setDate(endDate.getDate() + 1);
                    }
                    endDate.setDate(endDate.getDate() - 1);
                } else if (budgetType == 'yearly') {
                    while (amortizeLen > 1) {
                        endDate.setYear(endDate.getFullYear() + 1);
                        amortizeLen--;
                    }
                    // choose the last day of that year
                    endDate.setMonth(11);
                    endDate.setDate(31);
                }
                $('#item-end-date').datepicker("setDate", endDate)
            } else {
                if (!startDate) {
                    alert('You need to set a start date first!');
                    $('#item-start-date').focus();
                } else {
                    alert('Invalid length entered, setting to default value!');
                    $(this).val(DEFAULT_AMORTIZE_LEN).change();
                }
            }
        },
        itemStartDate: function itemStartDate(e) {
            $('#item-end-date').datepicker('destroy').datepicker({
                minDate: new Date($('#item-start-date').val())
            });
        }
    };

    function initClickHandlers() {
        $('#budget-create-btn').click(_clickHandlers.budgetCreate);
        $('#budget-list-all').click(_clickHandlers.budgetListAll);
    }

    function initAddItemComponent() {
        $('#item-start-date').datepicker({
            minDate : getStartDateForWeekOf(new Date()),
            maxDate : getEndDateForWeekOf(new Date())
        }).change(_changeHandlers.itemStartDate);
        $('#item-end-date').datepicker({
            minDate : getStartDateForWeekOf(new Date())
        });
        $('#amortize-length').change(_changeHandlers.itemAmortizeLen);
        $('#budget-add-item-btn').click(_clickHandlers.budgetAddItem);
    }

    function getStartDateForWeekOf(date) {
        date = date ? date : new Date();
        while (date.getDay() != 0) {
            date.setDate(date.getDate()-1);
        }
        return date;
    }

    function getEndDateForWeekOf(date) {
        date = date ? date : new Date();
        while (date.getDay() != 6) {
            date.setDate(date.getDate()+1);
        }
        return date;
    }

    var compiledTemplates = {};
    function _compiledTemplate(templateId) {
        if (!compiledTemplates[templateId]) {
            var $templateHtml = $('#'+templateId).html();
            if ($templateHtml) {
                compiledTemplates[templateId] = Handlebars.compile($templateHtml);
            }
        }
        return compiledTemplates[templateId];
    }

    return {
        initClickHandlers: initClickHandlers,
        initAddItemComponent: initAddItemComponent
    }
})(jQuery);

$(document).ready(function () {
    budgetPageUtil.initClickHandlers();
    budgetPageUtil.initAddItemComponent();
    $('#budget-list-all')[0].click();
});