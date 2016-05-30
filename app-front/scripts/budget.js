var budgetPageUtil = (function($) {
    function hideUnusedForms() {
        $('#form-create-budget, #form-add-item').hide();
    }

    function initClickHandlers() {
        $('#budget-create-btn').click(function (e) {
            $('#form-create-budget').fadeIn();
        });

        $('#budget-add-item-btn').click(function (e) {
            $('#item-start-date, #item-end-date' ).datepicker();
            $('#form-add-item').fadeIn();
        });

        $('#getItemList').click(function (e) {
            var infoApiPath = '/budget/'+$('#budget-id').val()+'/info/';
            $.get(infoApiPath).done(function (budgetInfo) {
                var $budgetItemList = $('#budgetItemList').empty();
                $budgetItemList.append(budgetInfo.budgetName);
                budgetInfo.items.forEach(function (item) {
                    var $item = $(_compiledTemplate('listItemTemplate')(item));
                    $budgetItemList.append($item);
                    $item.hide().fadeIn('slow');
                });
            }).fail(function () {
                alert("Couldn't get budget info from: "+infoApiPath);
            });
        });

        $('#budget-list-all').click(function (e) {
            $.get('/budget/all/').done(function (budgetList) {
                var $budgetList = $('#budgetList').empty();
                var $budgets = $(_compiledTemplate('budgetListTemplate')({budgets: budgetList}));
                $budgetList.append($budgets);
                $budgets.hide().fadeIn('slow');
            }).fail(function () {
                alert("Couldn't get budget list!");
            })
        });
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