var budgetUtil = (function($) {

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
                var baseUnitForBudgetType = getBaseUnitForBudgetType(budgetType);
                $('#modal-add-item').attr('data-budget-type', budgetType);
                initAddItemComponent(true);
                budgetInfo.items = budgetInfo.items.map(function (item) {
                    item.formattedTotalCost = item.cost.toFixed(2);
                    item.amortizedCost = (item.cost/item.duration);
                    item.formattedAmortizedCost = item.amortizedCost.toFixed(2);
                    item.durationStr = item.duration + ' ' + baseUnitForBudgetType + '(s)';
                    // set some useful text about the items end date
                    var americanDateStr = dateUtil.convertISOtoAmericanStr(item.end_date);
                    var amortizeLenRemaining = dateUtil.getAmortizeLenRemainingFromToday(new Date(americanDateStr), budgetType);
                    if (amortizeLenRemaining == 1) {
                        item.actionableEndDuration = 'ending this ' + baseUnitForBudgetType;
                    } else if (amortizeLenRemaining == 2) {
                        item.actionableEndDuration = 'ends next ' + baseUnitForBudgetType;
                    } else {
                        item.actionableEndDuration = amortizeLenRemaining + ' ' + baseUnitForBudgetType + '(s) remaining';
                    }
                    return item;
                });
                var currentExpenditure = budgetInfo.items.reduce(function (prevItem, curItem) {
                    curItem.amortizedCost = prevItem.amortizedCost + curItem.amortizedCost;
                    return curItem;
                }).amortizedCost;
                budgetInfo.totals = {
                    expenditure : currentExpenditure,
                    formattedExpenditure : currentExpenditure.toFixed(2),
                    remaining : budgetInfo.budgetAmount - currentExpenditure,
                    formattedRemaining : (budgetInfo.budgetAmount - currentExpenditure).toFixed(2)
                };
                var $budgetItemList = $('.budgetItemList').filter('[data-budget-id=' + budgetId + ']');
                $budgetItemList.siblings('.panel-footer').html(
                    'Total remaining this ' + baseUnitForBudgetType + ': <b>$' + budgetInfo.totals.formattedRemaining+ '</b>')
                    .attr('title', '$'+budgetInfo.budgetAmount.toFixed(2) + ' - $' + budgetInfo.totals.formattedExpenditure);

                var $items = $(_compiledTemplate('listItemTemplate')(budgetInfo));
                $budgetItemList.empty().append($items);
                $items.hide().fadeIn('slow');
                $budgetItemList.parent().find('[data-toggle="tooltip"]').tooltip();
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
                $(this).val(amortizeLen);
                var endDate = new Date(startDate);
                while (amortizeLen) {
                    endDate = dateUtil.getEndDateFor(endDate, budgetType);
                    endDate.setDate(endDate.getDate() + 1);
                    amortizeLen--;
                }
                endDate.setDate(endDate.getDate() - 1);
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

    function initAddItemComponent(reset) {
        var $addItemModal = $('#modal-add-item');
        $('#item-start-date').datepicker('destroy').datepicker({
            minDate : reset? dateUtil.getStartDateFor(new Date(), $addItemModal.attr('data-budget-type')) : null,
            maxDate : reset? dateUtil.getEndDateFor(new Date(), $addItemModal.attr('data-budget-type')) : null
        }).change(_changeHandlers.itemStartDate);
        $('#item-end-date').datepicker('destroy').datepicker({
            minDate : reset? dateUtil.getStartDateFor(new Date(), $addItemModal.attr('data-budget-type')) : null
        });
        $('#amortize-length').off('change').change(_changeHandlers.itemAmortizeLen);
        $('#budget-add-item-btn').off('click').click(_clickHandlers.budgetAddItem);
    }

    function getBaseUnitForBudgetType(budgetType) {
        var baseUnit = budgetType.substr(0, budgetType.search('ly'));
        return baseUnit? baseUnit : 'unknown';
    }

    var _compiledTemplate = function () {
        var compiledTemplates = {};
        function getCompiledTemplate(templateId) {
            if (!compiledTemplates[templateId]) {
                var $templateHtml = $('#'+templateId).html();
                if ($templateHtml) {
                    compiledTemplates[templateId] = Handlebars.compile($templateHtml);
                }
            }
            return compiledTemplates[templateId];
        }
        return getCompiledTemplate
    }();

    return {
        initClickHandlers: initClickHandlers,
        initAddItemComponent: initAddItemComponent
    }
})(jQuery);

$(document).ready(function () {
    budgetUtil.initClickHandlers();
    budgetUtil.initAddItemComponent();
    $('#budget-list-all')[0].click();
});