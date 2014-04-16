//IMPORTS
var Twit = require("twit");
var timer = require("timer");
var mongodb = require("mongodb");
var Geode =require('geode');
var conf = require('./config');
var geo = new Geode('watchFire', {language: 'en', country : 'US'})

module.exports = function(con, bd, twit) {

	//Twitter credentials
   var T = new Twit({
      consumer_key: twit["watchFireZar"].key,
      consumer_secret: twit["watchFireZar"].secret,
      access_token: twit["watchFireZar"].token,
      access_token_secret: twit["watchFireZar"].token_secret 
   });

   //City properties
   function City(area, coordinates) {
      this.coordinates = coordinates
      this.noise = 0;
      this.area = area;
   }

   //Update noise to database
   var notify = function(coord, noise) {
      new mongodb.Collection(con, bd.HOT_SPOTS).update({coordenadas:coord}, {$inc:{noise: noise}});
   } 

   //Starts watching twitter
   //Checks noise
   var checkNoise = function(cities) {
	   console.log("cities: "+Object.keys(cities).length);
       console.log("keywords: "+conf.keywords.length);
       var watchSymbols="";
       for (var i in cities) {
       		for (var j = 0; j < conf.keywords.length; j++) {
       			watchSymbols+=conf.keywords[j]+" "+i+",";//',' as or ' ' as and
       		}
      }
       console.log("watchSymbols:"+watchSymbols);
       this.stream = T.stream("statuses/filter", {track: watchSymbols});
       this.stream.on("tweet", function(t) {
    	   console.log(t.text);
    	   for (var i in cities) {
   				if (t.text.toLowerCase().indexOf(i.toLowerCase()) !== -1) {
   					cities[i].noise++; //noise in the city
   					break;
   				}
   			}
       });
      console.log("  checking noise...")
      for (var i in cities) {
         if (cities[i].noise > 5) {
            console.log("  ALERT ["+cities[i].noise+"] on "+cities[i].coordinates);
            notify(cities[i].coordinates, cities[i].noise);
         }
      }
   }

   //Create a surface from coordinates
   var round = function(coords) {
      var c = 0.5;
      return [Math.floor(coords[0]*10)/10-c, Math.floor(coords[1]*10)/10-c, Math.floor(coords[0]*10)/10+c, Math.floor(coords[0]*10)/10+c]; 
   }

   //Return object
   return {
      cities : {},
      init : function(hotspots) {
         console.log("init twitta");
         var that = this;
         this.destroy();
         console.log("Hotspots :"+hotspots.length);
         //translate coordinates to city names
         for (var i in hotspots) {
            var p = hotspots[i];
            geo.findNearby({lat:p.coordinates.coordinates[1],lng:p.coordinates.coordinates[0]}, function(err, results){
            	if (err) { console.log(err); return; }
	        	var name = results.geonames[0].name;
	            console.log("City " + name + " ["+p.coordinates.coordinates+"]...");
	            that.cities[name] = new City(round(p.coordinates.coordinates), p.coordinates);
            });
         }
         this.checker = setInterval(checkNoise, 10000, this.cities);
      },
      destroy : function() {
         //Clear structures
         clearInterval(this.checker);
         if (this.stream) this.stream.close();
      },
      checker : null,
      stream : null
   }

}
