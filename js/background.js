// Application Code
var units = countdown.MONTHS | countdown.WEEKS | countdown.DAYS | countdown.HOURS | countdown.MINUTES | countdown.SECONDS;

function tickTock(){
    if (chrome.extension.getViews({type: 'popup'}).length === 0) {
        return;
    }
    chrome.storage.sync.get('timers', function (items) {
        var timers = items.timers || [], ts;

        $.each(timers, function(i, v){
            var arg1, arg2, msg;
            arg1 = arg2 = moment();

            if(v.startOrEnd === "start")
                arg1 = moment(v.date).toDate();
            else if (v.startOrEnd === "end")
                arg2 = moment(v.date).toDate();

            ts = countdown(arg1, arg2, units);
            msg = {populateTimer: i, timer: v, ts: ts};
            chrome.runtime.sendMessage(msg);
        });
    });
}

function setupTimers(){
    chrome.storage.sync.get('timers', function(items) {
        var timers = items.timers || [];
        lastTs = [];

        $.each(timers, function(i, v){
            var msg = {setupTimer: i, timer: v};
            chrome.runtime.sendMessage(msg);
        });
        tickTock();
    });
}

chrome.runtime.onMessage.addListener(function(msg) {
    if(msg.hasOwnProperty('setupTimers')) {
        chrome.runtime.sendMessage({clearTimers: true});
        setupTimers();
    } else if (msg.hasOwnProperty('tickTock')) {
        tickTock();
    }
});
