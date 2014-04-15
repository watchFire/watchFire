#!/usr/local/bin/node

var mongodb = require('mongodb');
var crawler = require('./crawler');
var dbmanager = require('./dbmanager');
var jobs = require('./jobs');
var conf = require('./config');
var twitta = require('./twitta');

// Inicializamos el manager
dbmanager.init(conf.bd);
dbmanager.connect(startHeartBeed);

// Launch core
function startHeartBeed(err, client) {

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
