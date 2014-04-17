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
dbmanager.connect(function(err, con) {

   console.log("Connected to database");

   dbmanager.db.createCollection(conf.bd.HOT_SPOTS, function(err, col) {
      if (err) throw err;
      console.log(" - created " + conf.bd.HOT_SPOTS);

      dbmanager.db.ensureIndex(col.collectionName,{"coordinates":"2dsphere"}, function(){
         dbmanager.db.createCollection(conf.bd.FIRES, function(err, col) {
            if (err) throw err;
            console.log(" - created " + conf.bd.FIRES);

            dbmanager.db.ensureIndex(col.collectionName,{"coordinates":"2dsphere"}, function(){
               dbmanager.disconnect(process.kill);
            });
            console.log("Index created on " + col.collectionName);
         });
      });      
      console.log("Index created on " + col.collectionName);
   });
});
