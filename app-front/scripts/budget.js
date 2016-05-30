var budgetPageUtil = (function($) {

    function hideUnusedForms() {
        $('#form-create-budget, #form-add-item').hide();
    }

    var _clickHandlers = {
        budgetCreate: function budgetCreate (e) {
            $('#form-create-budget').fadeIn();
        },
        budgetAddItem: function budgetAddItem (e) {
            $('#item-start-date, #item-end-date' ).datepicker();
            $('#form-add-item').fadeIn();
        },
        budgetListAll: function budgetListAll (e) {
            $.get('/budget/all/').done(function (budgetList) {
                var $budgetList = $('#budgetList').empty();
                var $budgets = $(_compiledTemplate('budgetListTemplate')({budgets: budgetList}));
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
            var budgetId = $(this).attr('data-budget-id');
            var infoApiPath = '/budget/'+budgetId+'/info/';
            $.get(infoApiPath).done(function (budgetInfo) {
                var $budgetItemList = $('.budgetItemList').hide()
                    .filter('[data-budget-id=' + budgetId + ']').empty().show();
                var $items = $(_compiledTemplate('listItemTemplate')(budgetInfo));
                $budgetItemList.append($items);
                $items.hide().fadeIn('slow');
            }).fail(function () {
                alert("Couldn't get budget info from: "+infoApiPath);
            });
        }
    };

    function initClickHandlers() {
        $('#budget-create-btn').click(_clickHandlers.budgetCreate);
        $('#budget-add-item-btn').click(_clickHandlers.budgetAddItem);
        $('#budget-list-all').click(_clickHandlers.budgetListAll);
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
        hideUnusedForms: hideUnusedForms,
        initClickHandlers: initClickHandlers
    }
})(jQuery);

$(document).ready(function () {
    budgetPageUtil.hideUnusedForms();
    budgetPageUtil.initClickHandlers();
});