$(function() {
    // $(document).on('contextmenu', function() {
    //   return false;
    // });
    // Handler for .ready() called.
    $('input[type=text]').each(function() {
        if ($(this).data('msg') != undefined) {
            $(this).change(function() {
                // console.log(eval($(this).data('min'))+' > '+eval($(this).val())+' || '+eval($(this).data('max'))+' < '+eval($(this).val()));
                if ((eval($(this).data('min')) > eval($(this).val())) || (eval($(this).data('max')) < eval($(this).val()))) {
                    // $(this).closest('div').find('.help-block').html($(this).data('msg'));
                    // confirm($(this).data('msg'));
                    $('#modal').modal('show').find('.modal-body').html($(this).data('msg'));
                }
            });
        }
    });
    startTime();
    $("#time-display").closest("a").on("click", function(e) {
        e.preventDefault();
    });
    $("ul.dropdown-menu > li.active").closest("li.dropdown").addClass("active");
    var input;
    var submit_form = false;
    var filter_selector = '.grid-view .filters input';
    // $("body").on('beforeFilter', ".grid-view", function(event) {
    //     // return submit_form;
    // });
    // $("body").on('afterFilter', ".grid-view", function(event) {
    //     submit_form = false;
    //     cancelEvent = false;
    //     var i = $("[name='" + input + "']");
    //     var val = i.val();
    //     i.focus().val(val);
    // });
    // $(document)
    //     .off('keyup.yiiGridView', filter_selector)
    //     .on('keyup.yiiGridView', filter_selector, function(e) {
    //         e.preventDefault();
    //         input = $(this).attr('name');
    //         console.log(input);
    //         console.log(submit_form);
    //         if (submit_form === false) {
    //             submit_form = true;
    //             // $(".grid-view").yiiGridView("applyFilter");
    //         }
    //     })
    //     .on('pjax:success', function() {
    //         var i = $("[name='" + input + "']");
    //         var val = i.val();
    //         i.focus().val(val);
    //     });
});

function showmsg(txt) {
    if (txt != "")
        $('#modal').modal('show').find('.modal-body').html(txt);
}

function startTime() {
    var today = new Date();
    var day = today.getDate();
    var month = today.getMonth() + 1;
    var year = today.getFullYear();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    day = checkTime(day);
    month = checkTime(month);
    h = checkTime(h);
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('time-display').innerHTML = day + "-" + month + "-" + year + " " + h + ":" + m + ":" + s;
    var t = setTimeout(startTime, 500);
}

function checkTime(i) {
    if (i < 10) { i = "0" + i }; // add zero in front of numbers < 10
    return i;
}

function addPicker(fmt, id = "") {
    if(id == "") {
        $('.datepicker').datepicker({autoclose: true, startDate: '01-01-1900', endDate: '0', format: fmt});
    } else {
        $(id).datepicker({autoclose: true, startDate: '01-01-1900', endDate: '0', format: fmt});
    }
}

function getAge(dateString) {
    first = dateString.replace(/^(\d\d)-(\d\d)-(\d\d\d\d)$/,"$3/$2/$1");
    var today = new Date();
    var birthDate = new Date(first);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

var _MS_PER_DAY = 1000 * 60 * 60 * 24;
// a and b are javascript Date objects
function dateDiffInDays(a, b) {
    // Discard the time and time-zone information.
    var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}