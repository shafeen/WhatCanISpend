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
            $.get('/budget/1/info').done(function (budgetInfo) {
                $('#budgetItemList').append(budgetInfo.budgetName);
                var listItemTemplate = Handlebars.compile($('#listItemTemplate').html());
                budgetInfo.items.forEach(function (item) {
                    var $item = $(listItemTemplate(item));
                    $('#budgetItemList').append($item);
                    $item.hide().fadeIn('slow');
                });
            }).fail(function () {
                alert("Couldn't get budget info!");
            });
        });
    }

    return {
        hideUnusedForms: hideUnusedForms,
        initClickHandlers: initClickHandlers
    }
})(jQuery);
