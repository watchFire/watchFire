//REQUIRES
var CronJob = require('cron').CronJob;
var cfg = require('./config');
var fs = require('fs');
var dbmanager = require('./dbmanager');
var twitta = require('./twitta');
var conf = require('./config');

function doEverything() {
    //Create child: Crawler
    dbmanager.erase(cfg.bd.HOT_SPOTS, function(err){
        if (err) {
           console.log("error borrado");
        } else {
           makeJavaChild(function(data) {
              var tmp;
              var counter = 0;
              for (var i=0; i<data.length; i++) {
                 tmp = parseJSON(data[i]);
                 if (tmp.confidence > 60) {
                    counter++;
                    dbmanager.insert(cfg.bd.HOT_SPOTS, parseJSON(data[i]), function(){});
                 } 
              }
              if (err) return console.error(err);
              console.log("Introducidos " + counter + " docs");
              dbmanager.find(conf.bd.HOT_SPOTS, {confidence:{$gt:70}}, function(err, docs) {
              if (!err){
            	  twitter.init(docs);
              }
               });
           });
        }
    });
}
exports.doEverything = doEverything;

function makeJavaChild(callback) {
    console.log("crawler.makeJavaChild()");
    var spawn = require('child_process').spawn;
    try {
       var java = spawn('java', ['-jar', '../serviceUtils/serviceUtils_old.jar', cfg.path.crawler], {detached: false, stdio: ['ignore', 'ignore','ignore']});
        java.on('close', function (code) {
           var data = JSON.parse(fs.readFileSync(cfg.path.crawler, "utf8"));
           console.log("makeJavaChild.makeJavaCrawler() the crawler dies");
           callback(data);
        
        });
    } catch (e) {
        console.log(e);
    }
}

function parseJSON(json) {
    var date = json.acq_date.trim().split("-");
    
    var newjson = {
          coordinates: {type: "Point", coordinates: [json.longitude, json.latitude]},
          windSpeed: json.windSpeed,
          windDirection: json.windDirection,
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
