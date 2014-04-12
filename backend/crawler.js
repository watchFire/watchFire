var CronJob = require('cron').CronJob;
var cfg = require('./config');
var fs = require('fs');
var dbmanager = require('./dbmanager');


function doEverything() {
    // Crea hijo Java que crawlea info
    makeJavaChild(function(data) {
        for (var i=0; i<data.length; i++) {
            dbmanager.insert(parseJSON(data[i]), doNothing);
        }
        console.log("Introducidos " + data.length + " docs");
        updateData();
        dbmanager.disconnect();
    });
}
exports.doEverything = doEverything;


function makeJavaChild(callback) {
    console.log("crawler.makeJavaChild()");
    var spawn = require('child_process').spawn;
    var java = spawn('java', ['-jar', '../serviceUtils.jar', cfg.path.crawler], {detached: false, stdio: ['ignore', 'ignore','ignore']});
    java.on('close', function (code) {
        var data = JSON.parse(fs.readFileSync(cfg.path.crawler, "utf8"));
        console.log("makeJavaChild.makeJavaCrawler() the crawler dies");
        callback(data);
        
    });
}

function parseJSON(json) {
    var date = json.acq_date.trim().split("-");
    var newjson = {
          coord: {type: "Point", coordinates: [json.longitude, json.latitude]},
          windSpeed: json.windSpeed,
          date: new Date(date[0],date[1],date[2],json.acq_time.trim().substring(0,2),json.acq_time.trim().substring(2,4)),
          confidence: json.confidence,
          temperature: json.temperature,
          humidity: json.humidity,
          vegetation: json.vegetation,
          frp: json.frp,
          noise: 0.0
      };
    return newjson;
}

var doNothing = function() {};
