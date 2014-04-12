var CronJob = require('cron').CronJob;
var cfg = require('./config');
var dbmanager = require('./dbmanager');

function startNodeServer() {
    insertJob();
    //deleteJob();
}


function random(min,max,redondeo) {
    var r = Math.random()*max+min;
    if (redondeo) {
        r = Math.floor(r);
    }
    return r;
}

function caca() {
    return {
       coordenadas: [random(1,300,false), random(1,300,false)],
       fecha: new Date(),
       hora: random(0,24,true),
       confidence: random(0,100,true),
       brightness: random(0,300),
       bright_31: random(0,300),
       frp: random(0,100)
    };
}


function insertJob() {
    var job = new CronJob({
          cronTime: cfg.crawl.cron,
          onTick: function() {
              dbmanager.connect(function(ok) {
                  if (ok) {
                      dbmanager.insert(caca(), function(ok) {
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
/*
function parseJSON(json) {
    var newJSON = {
        coordenadas = [json.latitude, json.longitude],
        fecha = new Date(json.)




    }

}*/


startNodeServer();


