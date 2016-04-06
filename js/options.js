var $timers_container = $(".timers-container"),
    $_timer_row = $(".hidden .timer"),
    $save_btn = $("#save"),
    $add_btn = $("#addTimer");

function blurSaveButton() {
    $save_btn.text("Options Saved");
    $save_btn.attr('disabled', true);
}

function resetSaveButton() {
    $save_btn.text("Save Options");
    $save_btn.attr('disabled', false);
}

function moveTimer($sRow, mod) {
    var newIndex = $sRow.index() + mod, $dRow,
        tName, tDate, tStartOrEnd,
        $sRowName, $sRowDate, $sRowStartOrEnd,
        $dRowName, $dRowDate, $dRowStartOrEnd;

    if (newIndex < 0)
        return;

    $dRow = $($sRow.parent().children().get(newIndex));

    if($sRow.length !== 1 || $dRow.length !== 1)
        return;

    $sRowName = $sRow.find("input[name='name']");
    $sRowDate = $sRow.find("input[name='date']");
    $sRowStartOrEnd = $sRow.find("select[name='startOrEnd']");

    $dRowName = $dRow.find("input[name='name']");
    $dRowDate = $dRow.find("input[name='date']");
    $dRowStartOrEnd = $dRow.find("select[name='startOrEnd']");

    tName = $dRowName.val();
    tDate = $dRowDate.val();
    tStartOrEnd = $dRowStartOrEnd.val();

    $dRowName.val($sRowName.val());
    $dRowDate.val($sRowDate.val());
    $dRowStartOrEnd.val($sRowStartOrEnd.val());

    $sRowName.val(tName);
    $sRowDate.val(tDate);
    $sRowStartOrEnd.val(tStartOrEnd);

    resetSaveButton();
}

function addRowHandlers($row){
    $row.find("input, select").change(function(){
        resetSaveButton();
    });

    $row.find("a.move-up").click(function(){
        moveTimer($row, -1);
    });

    $row.find("a.move-down").click(function(){
        moveTimer($row, 1);
    });

    $row.find("form").submit(function(){
        return false;
    });

    $row.find("a.delete").click(function(){
        if (!confirm("Are you sure you want to delete this?"))
            return;
        $row.remove();
        resetSaveButton();
    });
}

function addTimer() {
    var $new_row = $_timer_row.clone();
    addRowHandlers($new_row);
    $timers_container.append($new_row);
    resetSaveButton();
}

function restore_options() {
    chrome.storage.sync.get('timers', function(items) {
        if (!items.hasOwnProperty('timers'))
            return;
        $('.timers-container .timer').remove();
        $.each(items.timers, function(i, timer) {
            var $new_row = $_timer_row.clone();
            $new_row.find("input[name='name']").val(timer.name);
            $new_row.find("input[name='date']").val(timer.date);
            $new_row.find("select[name='startOrEnd']").val(timer.startOrEnd);

            addRowHandlers($new_row);

            $timers_container.append($new_row);
        });

        blurSaveButton();
    });
}

function save_options() {
    var $timers = $(".timers-container .timer"),
        timers = [];

    $timers.each(function(){
        var timer = {
            "name": "",
            "date": "",
            "startOrEnd": ""
        };

        timer.name = $(this).find("input[name='name']").val().trim();
        timer.date = $(this).find("input[name='date']").val().trim();
        timer.startOrEnd = $(this).find("select[name='startOrEnd']").val().trim();
        timers.push(timer);
    });

    chrome.storage.sync.set({ "timers": timers }, function() {
        restore_options();
        chrome.runtime.sendMessage({
            setupTimers: true
        });
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
$save_btn.click(save_options);
$add_btn.click(addTimer);
