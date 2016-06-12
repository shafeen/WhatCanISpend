var budgetPageUtil = (function($) {

    var _clickHandlers = {
        budgetCreate: function budgetCreate (e) {
            var $createBudgetForm = $('#form-create-budget');
            var requestParams = {
                name: $createBudgetForm.find('#budget-name').val(),
                amount: $createBudgetForm.find('#budget-amount').val(),
                type: $createBudgetForm.find('#budget-type').val()
            };
            $.post('/budget/create/', requestParams).done(function (successInfoObj) {
                alert(successInfoObj.message);
                $createBudgetForm.find('#budget-name, #budget-amount, #budget-type').val('');
                $('#form-create-budget').modal('hide');
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
                    $('#form-add-item').modal('hide');
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
                var $budgetItemList = $('.budgetItemList').filter('[data-budget-id=' + budgetId + ']');
                var $items = $(_compiledTemplate('listItemTemplate')(budgetInfo));
                $budgetItemList.empty().append($items);
                $items.hide().fadeIn('slow');
                $budgetItemList.find('.budget-add-item-show-btn').click(function () {
                    $('#budget-add-item-btn').attr('data-budget-id', budgetId);
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
                amortizeLen = parseInt(Number(amortizeLen));
                $(this).val(amortizeLen);
                var endDate = new Date(startDate);
                while (amortizeLen > 1) {
                    endDate.setDate(endDate.getDate() + 7);
                    amortizeLen--;
                }
                while (endDate.getDay() !== 6) { // choose saturday of final week
                    endDate.setDate(endDate.getDate() + 1);
                }
                $('#item-end-date').datepicker("setDate", endDate);
            } else {
                if (!startDate) {
                    alert('You need to set a start date first!');
                    $('#item-start-date').focus();
                } else {
                    alert('Invalid length entered, setting to default value!');
                    $(this).val(DEFAULT_AMORTIZE_LEN).change();
                }
            }
        }
    };

    function initClickHandlers() {
        $('#budget-create-btn').click(_clickHandlers.budgetCreate);
        $('#budget-list-all').click(_clickHandlers.budgetListAll);
    }

    // TODO: get addItem component of web interface working
    function initAddItemComponent() {
        $('#item-start-date, #item-end-date').datepicker();
        // TODO: form verification code can also go here
        $('#amortize-length').change(_changeHandlers.itemAmortizeLen);
        $('#budget-add-item-btn').click(_clickHandlers.budgetAddItem);
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
});