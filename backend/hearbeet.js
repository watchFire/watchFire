#!/usr/local/bin/node

//Run me second
//launches heartbeat

//REQUIRES
var mongodb = require('mongodb');
var crawler = require('./crawler');
var dbmanager = require('./dbmanager');
var jobs = require('./jobs');
var conf = require('./config');
var twitta = require('./twitta');
var time = require('time');
var mkdirp = require('mkdirp');

//Initialize database
dbmanager.init(conf.bd);
dbmanager.connect(startHeartBeet);

//Launch core
function startHeartBeet(err, client) {
	crawler.doEverything();
    if (!err) {
       // Registers job who parses raw data to colection
       // HOT_SPOTS
       jobs.insertJob(conf.cron.insert);
       // Use model to determine fires
       jobs.filterJob(conf.cron.filter);

       // Update database with social noise
       if (!err) {
          var twitter = new twitta(client, conf.bd, conf.twitter);
       }
       dbmanager.find(conf.bd.HOT_SPOTS, {confidence:{$gt:90}}, function(err, docs) {
          if (!err) twitter.init(docs);
       });
   }

}
