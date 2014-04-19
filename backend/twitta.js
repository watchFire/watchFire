//IMPORTS
var Twit = require("twit");
var timer = require("timer");
var mongodb = require("mongodb");
var Geode =require('geode');
var conf = require('./config');
var util = require('util')
var io = require('socket.io').listen(conf.sockets.port);

//TODO:
//-test socket
//-save noise to database
//-save number of tweets we can still send the next 15 min in database

//Variables
var numTweets=0;
var geo = new Geode('watchFire', {language: 'en', country : 'US'});

//Tweet class definition
function Tweet(user, text, coordinates) {
    this.user = user;
    this.text = text;
    this.coordinates = coordinates;
}

//Open socket for receiving data
io.sockets.on('connection', function (mysocket) {
	  socket.on('fire', function (data) {
		  console.log(data);
	  });
});

module.exports = function(con, bd, twit) {

	//Twitter credentials
   var T = new Twit(twit["watchFireZar"]);

   //City properties
   function City(area, coordinates, countryCode) {
      this.coordinates = coordinates
      this.noise = 0;
      this.area = area;
      this.tweets = [];
      this.countryCode=countryCode;
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
	   		        console.log("City " + name +" "+results.geonames[0].countryCode+" " + " ["+p.coordinates.coordinates+"]...");
	   		        cities[name] = new City(round(p.coordinates.coordinates), p.coordinates, results.geonames[0].countryCode);
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
       var watchSymbols="";
       var tweet;
       var wordsForFire=[];
       for (var city in cities) {
    	   	if (cities[city].countryCode in conf.keywords){//verify we know translations of fire for this country
    	   		wordsForFire = conf.keywords[cities[city].countryCode];
    	   	}else{//else use "fire"
    	   		wordsForFire = ["fire"];
    	   	}
       		for (var i = 0; i < wordsForFire.length; i++) {
       			symbol=wordsForFire[i]+" "+city
       			watchSymbols+=symbol+",";//',' as or ' ' as and
       			numTweets++;
       			if(numTweets<150){
       		       T.get('search/tweets', { q: symbol, count: 100 }, function(err, reply) {
       		    	   if (err) { console.log(err); return; }
       		    	   for (var j = 0; j < reply.statuses.length; j++) {
       		    		   if(reply.statuses[j].coordinates===null){//if the tweet doesn't come with coordinates, set city coordinates
       		    			   tweet = new Tweet(reply.statuses[j].user.screen_name,reply.statuses[j].text,cities[city].coordinates);
       		    		   }else{
       		    			   tweet = new Tweet(reply.statuses[j].user.screen_name,reply.statuses[j].text,reply.statuses[j].coordinates);
       		    		   }
       		    		   cities[city].tweets.push(tweet);
       		    		   io.sockets.emit('tweet', tweet);
       		    		   console.log(util.inspect(tweet));
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
		    			   tweet = new Tweet(t.user.screen_name,t.text,cities[city].coordinates);
		    		   }else{
		    			   tweet = new Tweet(t.user.screen_name,t.text,t.coordinates);
		    		   }
   					cities[city].tweets.push(tweet);
   					io.sockets.emit('tweet', tweet);
   					console.log(util.inspect(tweet));
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
            console.log("  ALERT ["+cities[i].noise+"] on "+util.inspect(cities[i].coordinates));
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
