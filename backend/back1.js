var crawler = require('./crawler');
var dbmanager = require('./dbmanager');
var jobs = require('./jobs');

function startBack1() {
    // Registra el job 
    jobs.insertJob();
    // Lanza el primer job
    dbmanager.connect(function(err) {
        if (!err) crawler.doEverything(doNothing);
        else console.log("Database no conectada");
    });
}

var doNothing = function() {};

startBack1();


