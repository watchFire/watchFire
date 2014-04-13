var crawler = require('./crawler');
var dbmanager = require('./dbmanager');
var jobs = require('./jobs');
var conf = require('./config.js');
var twitta = require('./twitta.js');

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
    /*dbmanager.connect(function(err, con) {
        if (!err) {
           var twitter = new twitta(con, conf.bd, conf.twitter);
        }
    });*/

})()
