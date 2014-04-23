//IMPORTS
var Twit = require("twit");
var timer = require("timer");
var mongodb = require("mongodb");
var Geode =require('geode');
var conf = require('./config');
var dbmanager = require('./dbmanager');
var util = require('util')
var io = require('socket.io').listen(conf.sockets.port-1); //just for dev

// Using require config instead of arguments to constructor, breaks
// all modularity... So f*$* y**!
module.exports = function() {

   // Twitter credentials
   var T = new Twit(conf.twitter["watchFire_"]);

   //Geonames credentials
   //var geo = new Geode(conf.geode.name, conf.geode.options);
   var geo = new Geode("watchFire", conf.geode.options);

   // Twitter rates
   var time = 15000*60, maxRate = 179, pendingRequests=maxRate;

   // Tweet class definition
   function Tweet(user, text, coordinates) {
      this.user = user;
      this.text = text;
      this.coordinates = coordinates;
   }

   // Location properties
   function Location(id, area, coordinates, countryCode, name) {
      // We can have the same 'name' for diferent fires, so we use
      // and array of indexes and coordinates
      this.id = [id];
      this.coordinates = [coordinates];
      this.noise = 0;
      this.area = area;
      this.tweets = [];
      this.countryCode = countryCode;
      this.pattern = new RegExp(name, "gi"); // we will use it for dispatching streaming data
   }

   // Extract location names from hotspots
   function parseHotSpots(locations, hotspots, callback) {

      console.log("Looking for " + hotspots.length + " hotspot names");
      // We use anonymous recursive function to sequentialize callbacks,
      // we don't need more params than index since original ones are visible
      (function recursive(j){
         // Final case, do callback and finish 
         if (j == hotspots.length) {
            callback(locations);
         } else {
            geo.findNearby({lat:hotspots[j].coordinates.coordinates[1], lng:hotspots[j].coordinates.coordinates[0]}, function(err, results) {
               if (!err && results.geonames) {
                  var p = hotspots[j], name = results.geonames[0].name, code = results.geonames[0].countryCode;
                  console.log(" - registered " + name);
                  // If this location already exists we add new hotspots to it 
                  if (locations[name]) {
                     locations[name].id.push(p._id);
                     locations[name].coordinates.push(p.coordinates);
                  } else {
                     locations[name] = new Location(p._id, round(p.coordinates.coordinates), p.coordinates, code, name);
                  }
               } else {
                  // Raised API limit. If "return" recursion breaks <- BE CAREFUL
                  console.log("Error geode: " + err); return 
               }
               // Recursion: parse next hotspot
               recursive(j+1);
            });
         }
      })(0);

   }

   // Open twitter stream listening for all locations with hotspots
   function openTwitterStreams(locations) {

      // Access to twitter API
      var filter = [], filterWords = 0;
      console.log(locations);

      // loc is the name location
      for (var loc in locations) {

      	 var search = [], keywords;
         if (locations[loc].countryCode in conf.keywords) {
            // For every search return a string paired with location name
            keywords = conf.keywords[locations[loc].countryCode];
            for (var i = 0; i < keywords.length; i++) {
               search.push(keywords[i]+" "+loc);
            }
            filterWords += loc.split(" ").length*keywords.length;
         } else {
            search.push("fire "+loc);
            filterWords += 2;
         }

         // Twitter API limit = 400 single words / stream filter
         if (filterWords <= 400) {
            filter = filter.concat(search);
      	 } else {
            // TODO: init a new filter, for another stream from pool
         }

         // Convert array of keywords to Twitter Search string query
         search = search.join(" OR ");         
         
         // Buff tweets related to hotspot in this location
         if (pendingRequests-- > 0) {
            console.log("search for " + loc + ": " + search);
            T.get('search/tweets', {q: search, count: 100}, function(err, reply) {
               var l = loc, tweet;
 	           if (err) {
                  console.log("Error 'search/tweets': "+err);
                  return;
               }
 	           console.log("Respuesta - Length: " + reply.statuses.length + ". Location: " + l);
 	           for (var t in reply.statuses) {
                  tweet = reply.statuses[t];
 	              locations[l].tweets.push(new Tweet(tweet.user.screen_name,tweet.text,tweet.coordinates||locations[l].coordinates[0]));
 		          console.log(util.inspect(tweet));
 		          locations[l].noise++;
 	           }
 	        });
 	     }
      }

      // Convert keywords to Twitter Stream API query
      filter = filter.join(",");
      console.log("Twitter Stream filter: " + filter);

      // Once the initial search is done, we connect to streaming API
      this.stream = T.stream("statuses/filter", {track: filter});

      // We have a connection. Now watch the 'data' event for incomming tweets.
      this.stream.on('data', function(t) {
         console.log(" >>> received tweet: " + t.text);
         var tweet, c;
         for (c in locations) {
	        // Since we are listening in a single stream for every hotspot, we need to
	        // filter and find the correct one.
	        if (t.text.match(locations[c].pattern)) {
	           tweet = new Tweet(t.user.screen_name, t.text, t.coordinates||locations[c].coordinates[0]);
	           // if we want to buff more tweets, this is the place
	           // Emit tweet to appropiate listeners
               locations[c].id.map(function(id){
	              io.sockets.emit(id, tweet);
	           });
	           locations[c].noise++;
	           break;
	        }
	     }
      });
   }
   
   // Send all tweets related to fid
   function sendBuffered(locations, fid) {
      for (var loc in locations) {
         for (var id in locations[loc].id) {
            if (id == fid) { 
               io.sockets.emit(id, locations[loc].tweets);
               return;
            }
         }
      } 
   }

   // Update noise to database
   var notify = function(coord, noise) {
      dbmanager.update(conf.bd.HOT_SPOTS, {coordinates:coord}, {$inc:{noise: noise}}, null, function(){});
   } 

   // Checks social noise
   var checkNoise = function(locations) {
      for (var i in locations) {
         if (locations[i].noise > 20) {
            for(var k = 0; k < locations[i].coordinates.length; k++){
              notify(locations[i].coordinates[k], locations[i].noise);
            }
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
      locations : {},
      init : function(hotspots) {
         console.log("Initializing twitta module");
         var that = this;
         that.destroy();
         // Starts structures
         parseHotSpots(that.locations, hotspots, openTwitterStreams);
         // Check if has been enought noise about a hotspot
         that.checker = setInterval(checkNoise, 20000, that.locations);
         // Periodically reset number of tweets we can send
         that.rates = setInterval(function(){pendingRequests = maxRate}, time);
         // Set and open sockets
         io.configure(function(){io.set('resource','/tweets')});
         io.on('connection', function(client) {
            // This socket return tweets based on a point
            client.on('fire', function(data) {
               // emit this.locations[location].tweets
               //client.emit("foo", that.locations);
               console.log("Requested fire: "+data.id);
               sendBuffered(that.locations, data.id);
            });
         });
      },
      destroy : function() {
         var that = this;
         clearInterval(that.checker);
         if (that.stream) that.stream.close();
      },
      rates : null,
      checker : null,
      stream : null
   }

}
