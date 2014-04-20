//IMPORTS
var Twit = require("twit");
var timer = require("timer");
var mongodb = require("mongodb");
var Geode =require('geode');
var conf = require('./config');
var util = require('util')
var io = require('socket.io').listen(conf.sockets.port-1); // temp for test


module.exports = function(con, bd, twit) {

   // Twitter credentials
   var T = new Twit(twit["watchFireZar"]);

   // Twitter rates
   var time = 15000*60, maxRate = 180, pendingRequests;

   // Tweet class definition
   function Tweet(user, text, coordinates) {
      this.user = user;
      this.text = text;
      this.coordinates = coordinates;
   }

   // City properties
   function City(id, area, coordinates, countryCode) {
      this.id = id;
      this.coordinates = coordinates;
      this.noise = 0;
      this.area = area;
      this.tweets = [];
      this.countryCode = countryCode;
   }

   // Extract city names from hotspots
   function parseHotSpots(cities, hotspots, callback) {
      var geo = new Geode('watchFire', {language: 'en', country : 'US'});
      var p, name, code, pending = hotspots.length;
      for (var i in hotspots) {
         geo.findNearby({lat:hotspots[i].coordinates.coordinates[1], lng:hotspots[i].coordinates.coordinates[0]}, function(err, results) {
            if (!err && results.geonames) {
               var p = hotspots[i];
               var name = results.geonames[0].name;
               var code = results.geonames[0].countryCode;
               cities[name] = new City(p._id, round(p.coordinates.coordinates), p.coordinates, code);
            }
            pending--;
            if (pending == 0) {
               callback(cities);
            }
         });
      }
   }

   // Open twitter stream listening for all cities with hotspots
   function openTwitterStreams(cities) {

      // Define watch symbols to search on twitter 
      var watchSymbols = [], tweet, keyword;
      for (var city in cities) {
         if (cities[city].countryCode in conf.keywords) {
            // For every keyword return a string paired with city name
            keyword = conf.keywords[cities[city].countryCode].map(function(a){return a+" "+city});
         } else {
            keyword = "fire "+city;
         }

         // Query and future regexp for streaming
         watchSymbols.push(keyword);
         cities[city].regexp = new RegExp(city, "gi");

         // Buff tweets related to hotspot in this city
         if (pendingRequests > 0) {
            pendingRequests--; 
            T.get('search/tweets', {q: symbol, count: 100}, function(err, reply) {
               if (err) { console.log(err); return }
               var t, tweet;
               for (t in reply.statuses) {
                  tweet = reply.statuses[t];
                  cities[city].tweets.push(new Tweet(tweet.user.screen_name, tweet.text, tweet.coordinates||cities[city].coordinates));
               }
               cities[city].noise += reply.statuses.length;
            });
         }
      }

      // Once the initial search is done, we connect to streaming API
      this.stream = T.stream("statuses/filter", {track: watchSymbols.toString()});
      this.stream.on("tweet", function(t) {
         console.log(" >>> received tweet: " + t.text);
         var tweet, c;
         for (c in cities) {
            // Since we are listening in a single stream for every hotspot, we need to
            // filter and find the correct one.
            if (t.text.match(cities[c].regexp)) {
               tweet = new Tweet(t.user.screen_name, t.text, t.coordinates||cities[c].coordinates);
               // if we want to buff more tweets, this is the place
               // Emit tweet to appropiate listener 
               io.sockets.emit("tweet"+cities[c].id, tweet);
               cities[city].noise++;
               break;
            }
         }
      });

   }

   // Update noise to database
   var notify = function(coord, noise) {
      dbmanager.update(bd.HOT_SPOTS, {coordinates:coord}, {$inc:{noise: noise}}, null, function(){});
   } 

   // Checks social noise
   var checkNoise = function(cities) {
      console.log("  checking noise...")
      for (var i in cities) {
         if (cities[i].noise > 20) {
            notify(cities[i].coordinates, cities[i].noise);
         }
      }
   }

   // Create a surface from coordinates
   var round = function(coords) {
      var c = 0.5;
      return [Math.floor(coords[0]*10)/10-c, Math.floor(coords[1]*10)/10-c, Math.floor(coords[0]*10)/10+c, Math.floor(coords[0]*10)/10+c]; 
   }

   // Return object
   return {
      cities : {},
      init : function(hotspots) {
         console.log("init twitta");
         var that = this;
         this.destroy();
         // Starts structures
         parseHotSpots(this.cities, hotspots, openTwitterStreams);
         // Check if has been enought noise about a hotspot
         this.checker = setInterval(checkNoise, 20000, that.cities);
         // Periodically reset number of tweets we can send
         this.rates = setInterval(function(){pendingRequests = maxRate}, time);
         // Set and open sockets
         io.configure(function(){io.set('resource','/tweets')});
         io.on('connection', function(client) {
            // This socket return tweets based on a point
            client.on('fire', function(data) {
               // emit this.cities[city].tweets
               client.emit("foo", that.cities);
            });
         });
      },
      destroy : function() {
         clearInterval(this.checker);
         if (this.stream) this.stream.close();
      },
      rates : null,
      checker : null,
      stream : null
   }

}
