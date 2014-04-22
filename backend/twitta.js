//IMPORTS
var Twit = require("twit");
var timer = require("timer");
var mongodb = require("mongodb");
var Geode =require('geode');
var conf = require('./config');
var dbmanager = require('./dbmanager');
var util = require('util')
var io = require('socket.io').listen(conf.sockets.port-1); // temp for test


module.exports = function(con, bd, twit) {

   // Twitter credentials
   var T = new Twit(twit["watchFire_"]);
   //Geonames credentials
   var geo = new Geode('watchFire', {language: 'en', country : 'US'});

   // Twitter rates
   var time = 15000*60, maxRate = 179, pendingRequests=maxRate;

   // Tweet class definition
   function Tweet(user, text, coordinates) {
      this.user = user;
      this.text = text;
      this.coordinates = coordinates;
   }

   // Location properties
   function Location(id, area, coordinates, countryCode) {
      this.id = [id];
      this.coordinates = [coordinates];
      this.noise = 0;
      this.area = area;
      this.tweets = [];
      this.countryCode = countryCode;
   }

   // Extract location names from hotspots
   /*function parseHotSpots(locations, hotspots, callback) {
      var p, name, code, pending = hotspots.length, k=0;
      for (var i in hotspots) {
         (function(j) {
            geo.findNearby({lat:hotspots[j].coordinates.coordinates[1], lng:hotspots[j].coordinates.coordinates[0]}, function(err, results) {
               console.log("HERE!");
               if (err) { console.log(err); k++; return }
               if (!err && results.geonames) {
                  //var j = hotspots.length - pending;
                  var p = hotspots[j];
                  var name = results.geonames[0].name;
                  var code = results.geonames[0].countryCode;
               
                  if(locations[name]){
                     locations[name].id.push(p._id);
                     locations[name].id.push(p.coordinates);
                  }else{
                     locations[name] = new Location(p._id, round(p.coordinates.coordinates), p.coordinates, code);
                  }
               }
               //if(k == (hotspots.length-2)){
               //   callback(locations);
               //}
               console.log("Antes: " + k);
               k++;
               console.log("Despues: " + k);
            });
         })(i);
      }

   }*/

   // Extract location names from hotspots
   function parseHotSpots(locations, hotspots, callback) {
      var recursive = function(locations, hotspots, callback, j){
      
         if(j == hotspots.length){callback(locations);}
         else{
            geo.findNearby({lat:hotspots[j].coordinates.coordinates[1], lng:hotspots[j].coordinates.coordinates[0]}, function(err, results) {
               if (err) { console.log(err); k++; return }
               if (!err && results.geonames) {
                  var p = hotspots[j];
                  var name = results.geonames[0].name;
                  var code = results.geonames[0].countryCode;
               
                  if(locations[name]){
                     locations[name].id.push(p._id);
                     locations[name].id.push(p.coordinates);
                  }else{
                     locations[name] = new Location(p._id, round(p.coordinates.coordinates), p.coordinates, code);
                  }
               }
               recursive(locations, hotspots, callback, j+1);
            });
         }
      };

      recursive(locations, hotspots, callback, 0);

   }

   // Open twitter stream listening for all locations with hotspots
   function openTwitterStreams(locations) {

      // Access to twitter API
      var filter = "", tweet, search, keywords, pending = Object.keys(locations).length, filterSize=0;
      console.log("pending: " + pending);
      for (var location in locations) {
      	 search="";
      	 var location_parts = location.split(' ');
         if (locations[location].countryCode in conf.keywords) {
            // For every search return a string paired with location name
            keywords = conf.keywords[locations[location].countryCode];
            for (var i = 0; i < keywords.length; i++) {
               search+=keywords[i]+" "+location+",";
       	       filterSize+=location_parts+2;
            }
         } else {
            search = location+" fire,";
            filterSize+=location_parts+2;
         }
         if (filterSize<=400){//twitter API limit = 400 single words for filter
            filter+=search;
      	 }
         search = search.substring(0, search.length - 1);//remove last ',' character
         search = search.replace(/,/g, ' OR ');         
         
         // Buff tweets related to hotspot in this location
         if (pendingRequests-- > 0) {
            (function(own_location, own_search) {
               T.get('search/tweets', { q: own_search, count: 100 }, function(err, reply) {
 	          if (err) {console.log("error"); console.log(err); return; }
 	          console.log("Respuesta - Length: " + reply.statuses.length + ". Location: " + own_location);
 	          for (var j = 0; j < reply.statuses.length; j++) {
 	             var tweet = new Tweet(reply.statuses[j].user.screen_name,reply.statuses[j].text,reply.statuses[j].coordinates||locations[own_location].coordinates[0]);
 		     locations[own_location].tweets.push(tweet);
 		     //io.sockets.emit('tweet', tweet); //TODO: delete
 		     console.log(util.inspect(tweet));
 		     locations[own_location].noise++;
 	          }
 	       });
 	    })(location, search);
         }
      }
      
      filter = filter.substring(0, filter.length - 1);//remove last character
      console.log("filter: " + filter);
      // Once the initial search is done, we connect to streaming API
      this.stream = T.stream("statuses/filter", {track: filter});
      console.log("set stream");
      //We have a connection. Now watch the 'data' event for incomming tweets.
      this.stream.on('data', function(t) {
         console.log(" >>> received tweet: " + t.text);
         var tweet, c;
         for (c in locations) {
	    // Since we are listening in a single stream for every hotspot, we need to
	    // filter and find the correct one.
	    if (t.text.match(new RegExp(locations[c], "i"))) {
	       tweet = new Tweet(t.user.screen_name, t.text, t.coordinates||locations[c].coordinates[0]);
	       // if we want to buff more tweets, this is the place
	       // Emit tweet to appropiate listener
	       for(var k = 0; k < locations[c].id.length; k++){
	         io.sockets.emit(locations[c].id[k], tweet);
	       }
	       locations[c].noise++;
	       break;
	    }
	 }
      });
   }
   
   function sendBuffered(locations, fid) {
      dance:
      for (var location in locations) {
         for(var k = 0; k < locations[location].id.length; k++){
            if (locations[location].id[k] == fid) {
               for(var i = 0; i < locations[location].tweets.length; i++){
	          io.sockets.emit(locations[location].id[k], locations[location].tweets[i]);
               }
               break dance;
            }
         }
      }
   }

   // Update noise to database
   var notify = function(coord, noise) {
      dbmanager.update(bd.HOT_SPOTS, {coordinates:coord}, {$inc:{noise: noise}}, null, function(){});
   } 

   // Checks social noise
   var checkNoise = function(locations) {
      console.log("checking noise...")
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
         console.log("init twitta");
         var that = this;
         this.destroy();
         // Starts structures
         parseHotSpots(this.locations, hotspots, openTwitterStreams);
         // Check if has been enought noise about a hotspot
         this.checker = setInterval(checkNoise, 20000, that.locations);
         // Periodically reset number of tweets we can send
         this.rates = setInterval(function(){pendingRequests = maxRate}, time);
         // Set and open sockets
         io.configure(function(){io.set('resource','/tweets')});
         io.on('connection', function(client) {
            // This socket return tweets based on a point
            client.on('fire', function(data) {
               // emit this.locations[location].tweets
               //client.emit("foo", that.locations);
               sendBuffered(that.locations, data.id);
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
