var dbmanager = require('./dbmanager');
var mongodb = require('mongodb');
var conf = require('./config');
var mkdirp = require('mkdirp');

// Create directory
mkdirp('data', function(err) {
   if (err) throw err;
});

// Create DB collections and indexes
dbmanager.init(conf.bd);
dbmanager.connect();
dbmanager.disconnect();

dbmanager.db.createCollection(conf.bd.HOT_SPOTS, function(err, col) {
   if (err) throw err;
   console.log(" - created " + conf.bd.HOT_SPOTS);
   col.ensureIndex({"coordinates":"2dsphere"});
   close(sem++);
});
dbmanager.db.createCollection(conf.bd.FIRES, function(err, col) {
   if (err) throw err;
   console.log(" - created " + conf.bd.FIRES);
   col.ensureIndex({"coordinates":"2dsphere"});
   close(sem++);
});

