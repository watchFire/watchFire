#!/usr/local/bin/node

//Run me second
//launches heartbeat

//REQUIRES
var mongodb = require('mongodb');
var crawler = require('./crawler');
var dbmanager = require('./dbmanager');
var jobs = require('./jobs');
var cfg = require('./config');
var time = require('time');
var mkdirp = require('mkdirp');
var twitta = require('./twitta');
var filter = require('./filter');

// Check if we are on test version to avoid conflicts
if (process.argv[2] == "testing") {
   console.log("testing");
   cfg.bd.name = "test";
}

//Initialize database
dbmanager.init(cfg.bd);
dbmanager.connect(startHeartBeet);

//Launch core
function startHeartBeet(err, client) {
	crawler.doEverything();
    if (!err) {
       // Registers job who parses raw data to collection
       // HOT_SPOTS
       jobs.insertJob(cfg.cron.insert);
       // Use model to determine fires
       jobs.filterJob(cfg.cron.filter);

       // Update database with social noise
       if (!err) {
    	   GLOBAL.twitter = new twitta(client, cfg.bd, cfg.twitter);
       }
   }

}
