#!/usr/local/bin/node
//Run me first
//launches server

// Requires
var mongodb = require("mongodb");
var express = require("express");
var cfg = require("./config.js");

// DB connection and run main
var db = mongodb.Db(cfg.bd.name, new mongodb.Server(cfg.bd.url, cfg.bd.port, {auto_reconnect:true}), {w:-1}), con;

var server = function() {

   var app = express();

   app.get("/", function(req, res) {
      res.send("it works");
   });

   app.all("*", function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "*");
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
         sps.find({coordenadas : {$near: {$geometry: {type: "Point", coordinates: [lon, lat]}, $maxDistance: radio}}}).toArray(function(err, docs) {
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
