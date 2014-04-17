//IMPORTS
var Twit = require("twit");
var timer = require("timer");
var mongodb = require("mongodb");
var Geode =require('geode');
var conf = require('./config');
var util = require('util')

var numTweets=0;
var geo = new Geode('watchFire', {language: 'en', country : 'US'});
function Tweet(user, text, coordinates) {
    this.user = user;
    this.text = text;
    this.coordinates = coordinates;
}

module.exports = function(con, bd, twit) {

	//Twitter credentials
   var T = new Twit({
      consumer_key: twit["watchFire_"].key,
      consumer_secret: twit["watchFire_"].secret,
      access_token: twit["watchFire_"].token,
      access_token_secret: twit["watchFire_"].token_secret 
   });

   //City properties
   function City(area, coordinates) {
      this.coordinates = coordinates
      this.noise = 0;
      this.area = area;
      this.tweets = [];
   }
   //Extract cities from hotspots
   function citiesFromHotspots(cities,hotspots){
	   var keys = Object.keys(hotspots);
	   var tasksToGo = keys.length;
	   if (tasksToGo === 0){
		   openTwitterStream(cities);
	   }else{
	   		keys.forEach(function(key){
	   			var p = hotspots[key];
	   			geo.findNearby({lat:p.coordinates.coordinates[1],lng:p.coordinates.coordinates[0]}, function(err, results){
	   	          	if (err) { console.log(err); return; }
	   		        var name = results.geonames[0].name;
	   		        console.log("City " + name + " ["+p.coordinates.coordinates+"]...");
	   		        cities[name] = new City(round(p.coordinates.coordinates), p.coordinates);
	   		        if(--tasksToGo === 0){
	   		           openTwitterStream(cities);
	   		        }
	   	        });
	   		});
	   }
   }
   //Open twitter stream
   function openTwitterStream(cities){
	   console.log("cities: "+Object.keys(cities).length);
       console.log("keywords: "+conf.keywords.length);
       var watchSymbols="";
       for (var city in cities) {
       		for (var j = 0; j < conf.keywords.length; j++) {
       			symbol=conf.keywords[j]+" "+city
       			watchSymbols+=symbol+",";//',' as or ' ' as and
       			numTweets++;
       			if(numTweets<150){
       		       T.get('search/tweets', { q: symbol, count: 100 }, function(err, reply) {
       		    	   if (err) { console.log(err); return; }
       		    	   for (var j = 0; j < reply.statuses.length; j++) {
       		    		   if(reply.statuses[j].coordinates===null){//if the tweet doesn't come with coordinates, set city coordinates
       		    			   cities[city].tweets.push( new Tweet(reply.statuses[j].user.screen_name),(reply.statuses[j].text),cities[city].coordinates);
       		    		   }else{
       		    			   cities[city].tweets.push( new Tweet(reply.statuses[j].user.screen_name),(reply.statuses[j].text),reply.statuses[j].coordinates);
       		    		   }
       		    		   console.log(util.inspect(cities[city].tweets));
       		    		   cities[city].noise++;
       		    	   }
       		       })
       			}
       		}
      }
       console.log("watchSymbols:"+watchSymbols);
       this.stream = T.stream("statuses/filter", {track: watchSymbols});
       this.stream.on("tweet", function(t) {
    	   console.log(t.text);
    	   for (var city in cities) {
   				if (t.text.toLowerCase().indexOf(city.toLowerCase()) !== -1) {
   					if(t.coordinates===null){//if the tweet doesn't come with coordinates, set city coordinates
		    			   cities[city].tweets.push( new Tweet(t.user.screen_name),(t.text),cities[city].coordinates);
		    		   }else{
		    			   cities[city].tweets.push( new Tweet(t.user.screen_name),(t.text),t.coordinates);
		    		   }
   					console.log(util.inspect(cities[city].tweets));
   					cities[city].noise++; //noise in the city
   					break;
   				}
   			}
       });
   }

   //Update noise to database
   var notify = function(coord, noise) {
//	   FIXME:
//      new mongodb.Collection(con, bd.HOT_SPOTS).update({coordenadas:coord}, {$inc:{noise: noise}});
   } 

   //Starts watching twitter
   //Checks noise
   var checkNoise = function(cities) {
//	  openTwitterStream(cities);
      console.log("  checking noise...")
      for (var i in cities) {
         if (cities[i].noise > 5) {
            console.log("  ALERT ["+cities[i].noise+"] on "+cities[i].coordinates);
            notify(cities[i].coordinates, cities[i].noise);
         }
      }
   }
   var resetNumTweets = function(){
	   numTweets=0;
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
         citiesFromHotspots (that.cities,hotspots);
         this.checker = setInterval(checkNoise, 20000, that.cities);
         this.tweetLimiter = setInterval(resetNumTweets,15000);//Periodically reset number of tweets we can send
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
