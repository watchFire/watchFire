#!/usr/local/bin/node

var crawler = require('./crawler');
var dbmanager = require('./dbmanager');
var mongodb = require('mongodb');
var jobs = require('./jobs');
var conf = require('./config');
var twitta = require('./twitta');

// Launch core
(function startHeartBeed() {

    // Inicializamos el manager
    dbmanager.init(conf.bd);

    // Registra el job que inserta datos raw parseados a la collection
    // HOT_SPOTS 
    jobs.insertJob(conf.cron.insert);

    // Lanza el primer job para probar
    dbmanager.connect(function(err, con) {
        if (!err) crawler.doEverything(con);
        else console.log("Database no conectada");
    });

    // la inteligencia que lee de la BD y crea la nueva BD que leera y servira la interfaz

    // twitta que actualizara con datos de ruido social la BD raw
    var db = mongodb.Db(conf.bd.name, new mongodb.Server(conf.bd.url, conf.bd.port, {auto_reconnect:true}), {w:-1}), con;
    db.open(function(err, client) {
       var twitter = new twitta(client, conf.bd, conf.twitter);
       twitter.init([]);
    });

})()
