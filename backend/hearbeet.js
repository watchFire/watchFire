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
//var time = require('time');
var mkdirp = require('mkdirp');

//create directory
mkdirp('/data', function(err) { 
    // path was created unless there was error
});

// Inicializamos el manager
dbmanager.init(conf.bd);
dbmanager.connect(startHeartBeed, function(err, db) {
	  if (err) throw err;
	  console.log("Connected to Database");

	  //create collections
	  db.createCollection("hotspots", function(err, collection){
		   if (err) throw err;
		   console.log("hotspots");
		   console.log(collection);
	});
	db.hotspots.ensureIndex({"coordinates":"2dsphere"});
	db.createCollection("fuegoosh", function(err, collection){
		   if (err) throw err;
		   console.log("fuegoosh");
		   console.log(collection);
	});
	db.fuegoosh.ensureIndex({"coordinates":"2dsphere"});
	});

// Launch core
function startHeartBeed(err, client) {
	crawler.doEverything();
	//Create database
    if (!err) {
       // Registra el job que inserta datos raw parseados a la collection
       // HOT_SPOTS 
       jobs.insertJob(conf.cron.insert);
       // Filtra datos de HOT_SPOTS evalua criticidad y recalcula la
       // confidence basado en parametros metereológicos -> FIRES
       jobs.filterJob(conf.cron.filter);

       // Twitta que actualizara con datos de ruido social la BD raw
       if (!err) {
          var twitter = new twitta(client, conf.bd, conf.twitter);
       }
       dbmanager.find(conf.bd.HOT_SPOTS, {confidence:{$gt:90}}, function(err, docs) {
          if (!err) twitter.init(docs);
       });
   }

}
