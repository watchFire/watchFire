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
   var T = new Twit(twit["watchFire_"]);

   // Twitter rates
   var time = 15000*60, maxRate = 179, pendingRequests;

   // Tweet class definition
   function Tweet(user, text, coordinates) {
      this.user = user;
      this.text = text;
      this.coordinates = coordinates;
   }

   // Location properties
   function Location(id, area, coordinates, countryCode) {
      this.id = id;
      this.coordinates = coordinates;
      this.noise = 0;
      this.area = area;
      this.tweets = [];
      this.countryCode = countryCode;
   }

   // Extract location names from hotspots
   function parseHotSpots(locations, hotspots, callback) {
      var geo = new Geode('watchFire', {language: 'en', country : 'US'});
      var p, name, code, pending = hotspots.length;
      for (var i in hotspots) {
         geo.findNearby({lat:hotspots[i].coordinates.coordinates[1], lng:hotspots[i].coordinates.coordinates[0]}, function(err, results) {
        	if (err) { console.log(err); return }
        	if (!err && results.geonames) {
               var p = hotspots[i];
               var name = results.geonames[0].name;
               var code = results.geonames[0].countryCode;
               locations[name] = new Location(p._id, round(p.coordinates.coordinates), p.coordinates, code);
            }
            if (--pending === 0) {
               callback(locations);
            }
         });
      }
   }

   // Open twitter stream listening for all locations with hotspots
   function openTwitterStreams(locations) {

      // Access to twitter API
      var filter = "", tweet, search, keywords, pending = Object.keys(locations).length, filterSize=0;
      console.log("pending: " + pending);
      for (var location in locations) {
      	search="";
         if (locations[location].countryCode in conf.keywords) {
            // For every search return a string paired with location name
         	keywords = conf.keywords[locations[location].countryCode];
         	for (var i = 0; i < keywords.length; i++) {
       			search+=keywords[i]+" "+location+","
       			filterSize+=2;
            }
         } else {
            search = location+" fire,";
            filterSize+=2;
         }
         if (filterSize<=400){//twitter API limit = 400 single words for filter
         	filter+=search;
      	}
         search = search.substring(0, search.length - 1);//remove last character
         console.log("search: " + search);
         
         // Buff tweets related to hotspot in this location
         if (pendingRequests > 0) {
            pendingRequests--; 
            T.get('search/tweets', {q: search, count: 100}, function(err, reply) {
            	if (err) { console.log(err); return }
               console.log("search/tweets " + reply.statuses.length + " tweets");
               var t, tweet;
               for (t in reply.statuses) {
            	   console.log(" >>> found tweet: " + util.inspect(tweet));
                  tweet = reply.statuses[t];
                  locations[location].tweets.push(new Tweet(tweet.user.screen_name, tweet.text, tweet.coordinates||locations[location].coordinates));
                  console.log(util.inspect(locations[location].tweets[locations[location].tweets.length-1]));
               }
               locations[location].noise += reply.statuses.length;
            });
         }
      }
		filter = filter.substring(0, filter.length - 1);//remove last character
		console.log("filter: " + filter);
		// Once the initial search is done, we connect to streaming API
		this.stream = T.stream("statuses/filter", {track: filter});
		console.log("set stream");
		this.stream.on("tweet", function(t) {
			console.log(" >>> received tweet: " + t.text);
			var tweet, c;
			for (c in locations) {
				// Since we are listening in a single stream for every hotspot, we need to
				// filter and find the correct one.
				if (t.text.match(locations[c].regexp)) {
					tweet = new Tweet(t.user.screen_name, t.text, t.coordinates||locations[c].coordinates);
					// if we want to buff more tweets, this is the place
					// Emit tweet to appropiate listener 
					io.sockets.emit("tweet"+locations[c].id, tweet);
					locations[location].noise++;
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
   var checkNoise = function(locations) {
      console.log("  checking noise...")
      for (var i in locations) {
         if (locations[i].noise > 20) {
            notify(locations[i].coordinates, locations[i].noise);
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
               client.emit("foo", that.locations);
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
