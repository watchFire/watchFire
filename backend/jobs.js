var CronJob = require('cron').CronJob;
var dbmanager = require('./dbmanager');
var cfg = require('./config');

function insertJob() {
    var job = new CronJob({
        cronTime: cfg.cron.insert,
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