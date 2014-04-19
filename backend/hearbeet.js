#!/usr/local/bin/node

//Run me second
//launches heartbeat

//REQUIRES
var mongodb = require('mongodb');
var crawler = require('./crawler');
var dbmanager = require('./dbmanager');
var jobs = require('./jobs');
var conf = require('./config');
var time = require('time');
var mkdirp = require('mkdirp');
var twitta = require('./twitta');
var filter = require('./filter');


//Initialize database
dbmanager.init(conf.bd);
dbmanager.connect(startHeartBeet);

//Launch core
function startHeartBeet(err, client) {
	crawler.doEverything();
    if (!err) {
       // Registers job who parses raw data to collection
       // HOT_SPOTS
       jobs.insertJob(conf.cron.insert);
       // Use model to determine fires
       jobs.filterJob(conf.cron.filter);
       
       // Update database with social noise
       if (!err) {
    	   GLOBAL.twitter = new twitta(client, conf.bd, conf.twitter);
       }
   }

}
