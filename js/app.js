var background = chrome.extension.getBackgroundPage(),
    $_timerRow = background.$('.timer-row'),
    $_unitTag = background.$('.unit'),
    $container = $('#timers-container');

String.prototype.lpad = function(padString, length) {
    var str = this;
    while (str.length < length)
        str = padString + str;
    return str;
};

function createUnitTag(unit) {
    var $tag = $_unitTag.clone();
    $tag.addClass(unit);
    return $tag[0].outerHTML;
}

function setUnitTag($status, unit, value, styleZero) {
    var $unit = $status.find('.' + unit),
        $value = $unit.find('.unit-value span'),
        $label = $unit.find('.unit-label'),
        pValue = value.toString().lpad('0', 2),
        pLabel = (value != 1) ? unit + 's' : unit;

    if (typeof styleZero === "undefined")
        styleZero = true;

    if(styleZero && value === 0) {
        $value.addClass('zero');
    } else {
        $value.removeClass('zero');
    }

    $value.html(pValue);
    $label.text(pLabel);

    return value;
}

function populateTimer(i, timer, ts) {
    var $status = $('#timer_' + i + ' .timer-status'), nonZero;

    if($status.length < 1)
        return;

    if (timer.startOrEnd === "start" && ts.value >= 0){
        $status.removeClass('ago').addClass('countup');
    } else if (timer.startOrEnd === "end" && ts.value <= 0) {
        $status.removeClass('countup').addClass('ago');
    } else {
        $status.removeClass('countup', 'ago');
    }

    nonZero = setUnitTag($status, 'month', ts.months, true);
    nonZero = setUnitTag($status, 'week', ts.weeks, !nonZero) || nonZero;
    nonZero = setUnitTag($status, 'day', ts.days, !nonZero) || nonZero;
    nonZero = setUnitTag($status, 'hour', ts.hours, !nonZero) || nonZero;
    nonZero = setUnitTag($status, 'minute', ts.minutes, !nonZero) || nonZero;
    nonZero = setUnitTag($status, 'second', ts.seconds, !nonZero) || nonZero;
}

function setupTimer(i, timer) {
    var $new_row = $_timerRow.clone(), status = '', date;
    date = moment(timer.date);

    if( timer.name === "" || !date.isValid())
        return;

    $new_row.find('.timer-name').html(timer.name);
    $new_row.find('.timer-date').html(date.format('(dddd, MMMM Do YYYY @ HH:mm)'));

    status += createUnitTag('month');
    status += createUnitTag('week');
    status += createUnitTag('day');
    status += createUnitTag('hour');
    status += createUnitTag('minute');
    status += createUnitTag('second');
    $new_row.find('.timer-status').html(status);

    $new_row.attr('id', 'timer_' + i);
    $container.append($new_row);
}

function clearTimers() {
    $('.timer-row').remove();
}

chrome.runtime.onMessage.addListener(function(msg) {
    if(msg.hasOwnProperty('clearTimers'))
        clearTimers();
    else if(msg.hasOwnProperty('setupTimer'))
        setupTimer(msg.setupTimer, msg.timer);
    else if (msg.hasOwnProperty('populateTimer'))
        populateTimer(msg.populateTimer, msg.timer, msg.ts);
});

chrome.runtime.sendMessage({setupTimers: true});

setInterval(function(){
    chrome.runtime.sendMessage({tickTock: true});
}, 1000);
