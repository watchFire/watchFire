var dbmanager = require('./dbmanager');
var mongodb = require('mongodb');
var cfg = require('./config');
var mkdirp = require('mkdirp');

// Check testing version
if (process.argv[2] == "testing") {
   console.log("testing");
   cfg.bd.name = "test";
}

// Create directory
mkdirp('data', function(err) {
   if (err) console.log(err);
});

// Create DB collections and indexes
dbmanager.init(cfg.bd);
dbmanager.connect(function(err, con) {

   console.log("Connected to database");

   dbmanager.db.createCollection(cfg.bd.HOT_SPOTS, function(err, col) {
      if (err) throw err;
      console.log(" - created " + cfg.bd.HOT_SPOTS);

      dbmanager.db.ensureIndex(col.collectionName,{"coordinates":"2dsphere"}, function(){
         dbmanager.db.createCollection(cfg.bd.FIRES, function(err, col) {
            if (err) throw err;
            console.log(" - created " + cfg.bd.FIRES);

            dbmanager.db.ensureIndex(col.collectionName,{"coordinates":"2dsphere"}, function(){
               dbmanager.disconnect(process.kill);
            });
            console.log("Index created on " + col.collectionName);
         });
      });      
      console.log("Index created on " + col.collectionName);
   });
});
