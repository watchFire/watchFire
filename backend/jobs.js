var CronJob = require('cron').CronJob;
var filter = require('./filter');
var crawler = require('./crawler');
var dbmanager = require('./dbmanager');

function insertJob(time) {
    var job = new CronJob({
        cronTime: time,
        onTick: function() {
           crawler.doEverything();
        },
        start: true,
        timeZone: "Europe/Madrid"
    });
}

exports.insertJob = insertJob;

function filterJob(time) {
    var job = new CronJob({
        cronTime: time,
        onTick: function() {
           filter.run();
        },
        start: true,
        timeZone: "Europe/Madrid"
    });
}
exports.filterJob = filterJob;

