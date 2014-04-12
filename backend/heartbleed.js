var CronJob = require('cron').CronJob;
var cfg = require('./config');
var fs = require('fs');
var dbmanager = require('./dbmanager');

function startNodeServer() {
    makeJavaCrawler();
    insertJob();
    //deleteJob();
}

function parseJSON(json) {
    var date = json.acq_date.trim().split("-");
    var newjson = {
        coord: [json.longitude, json.latitude],
        windSpeed: json.windSpeed,
        date: new Date(date[0],date[1],date[2],json.acq_time.trim().substring(0,2),json.acq_time.trim().substring(2,4)),
        confidence: json.confidence,
        temperature: json.temperature,
        humidity: json.humidity
    };

    return newjson;
}


function insertJob() {

    var job = new CronJob({
          cronTime: cfg.cron.insert,
          onTick: function() {
              dbmanager.connect(function(ok) {
                  if (ok) {
                      makeJavaCrawler();
                      dbmanager.insert(parseJSON(json), function(ok) {
                          console.log(ok);
                      });
                  }
                  dbmanager.disconnect();
              });
          },
          start: false,
          timeZone: "Europe/Madrid"
    });
    job.start();
}

function deleteJob() {
    var job = new CronJob({
          cronTime: "*/10 * * * * *",
          onTick: function() {
              dbmanager.connect(function(ok) {
                  if (ok) {
                      dbmanager.erase(caca(), function(ok) {
                          console.log(ok);
                      });
                  }
                  dbmanager.disconnect();
              });
          },
          start: false,
          timeZone: "Europe/Madrid"
    });
    job.start();
}

function makeJavaCrawler() {
    var spawn = require('child_process').spawn;
    var java = spawn('java', ['-jar', '../serviceUtils.jar', cfg.path.crawler], {detached: true, stdio: ['ignore', 'ignore','ignore']});
    console.log("Make Java Crawler child");
}

startNodeServer();


