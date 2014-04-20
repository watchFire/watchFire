#!/usr/local/bin/node

// Requires
var mongodb = require("mongodb");
var express = require("express");
var cfg = require("./config.js");

// URL
var domain = "watchfireproject.com";
var originRegExp = new RegExp("^https?:\\/\\/(\\w+\\.)*"+domain+"$");

// Check if we are executing test version and avoid conflicts
if (process.argv[2] == "testing") {
   console.log("testing port");
   cfg.interface.port = 9998;
   cfg.bd.name = "test";
}

// DB connection and run main
var db = mongodb.Db(cfg.bd.name, new mongodb.Server(cfg.bd.url, cfg.bd.port, {auto_reconnect:true}), {w:-1}), con;

var server = function() {

   var app = express();

   app.all("*", function(req, res, next) {
      if (originRegExp.test(req.header.origin)) {
         res.header("Access-Control-Allow-Origin", req.header.origin);
         res.header("Access-Control-Allow-Headers", "*");
      }
      next();
   });

   app.get("/points/:longitude/:latitude/:radio?", function(req, res) {
      res.contentType("application/json");
      var sps = new mongodb.Collection(con, cfg.bd.FIRES);
      var lon = parseFloat(req.params.longitude), lat = parseFloat(req.params.latitude), radio = parseFloat(req.params.radio);

      if (isNaN(lon) || isNaN(lat)) {
         res.send("{\"error\":\"invalid\"}", 400);
      } else {
         radio = isNaN(radio)?100000:radio;
         sps.find({coordinates : {$near: {$geometry: {type: "Point", coordinates: [lon, lat]}, $maxDistance: radio}}}).toArray(function(err, docs) {
            if (err) {
               console.log(err);
               res.send("{\"error\":\"bd\"}", 500);
            } else {
               res.send(JSON.stringify(docs), 200);
            }
         });
      }
   });

   console.log("web server running...");
   app.listen(cfg.interface.port);

}

db.open(function(err, client) {
   if (err) {
      db.close();
      console.log(err);
      process.exit(1);
   }
   con = client;
   server();
}); 
