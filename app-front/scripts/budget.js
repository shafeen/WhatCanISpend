$(document).ready(function () {
    budgetPageUtil.hideUnusedForms();
    budgetPageUtil.initClickHandlers();
});

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
                var listItemTemplate = Handlebars.compile($('#listItemTemplate').html());
                budgetInfo.items.forEach(function (item) {
                    var $item = $(listItemTemplate(item));
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
                budgetList.forEach(function (budgetObj) {
                    // TODO: update this to a better list (use a template)
                    $budgetList.append(JSON.stringify(budgetObj)).append('<br/>');
                });
            }).fail(function () {
                alert("Couldn't get budget list!");
            })
        });
    }

    return {
        hideUnusedForms: hideUnusedForms,
        initClickHandlers: initClickHandlers
    }
})(jQuery);
