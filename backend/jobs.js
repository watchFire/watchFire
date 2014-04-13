var CronJob = require('cron').CronJob;
var dbmanager = require('./dbmanager');

function insertJob(time) {
    var job = new CronJob({
        cronTime: time,
        onTick: function() {
            dbmanager.connect(function(err) {
                if (!err) {
                    crawler.doEverything();
                } else {
                    console.log("Database no conectada");
                }
            });
        },
        start: true,
        timeZone: "Europe/Madrid"
    });
}

exports.insertJob = insertJob;
