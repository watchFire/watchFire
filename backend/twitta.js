// Imports
var Twit = require("twit");
var timer = require("timer");
var mongodb = require("mongodb");

module.exports = function(con, bd, twit) {

   // Conecta a la BD y autentica API Twitter
   var T = new Twit({
      consumer_key: twit["watchFire_"].key,
      consumer_secret: twit["watchFire_"].secret,
      access_token: twit["watchFire_"].token,
      access_token_secret: twit["watchFire_"].token_secret 
   });

   // Crea estructura para escuchar puntos 
   function Stat(area, coordinates) {
      this.coordinates = coordinates
      this.noise = 0;
      this.area = area;
   }

   // Actualiza campo ruído en la BD para cada incendio
   var notify = function(coord, noise) {
      new mongodb.Collection(con, bd.HOT_SPOTS).update({coordenadas:coord}, {$inc:{noise: noise}});
   } 

   // Comprueba si un punto ha superado un umbral de ruído y
   // notifica
   var checkNoise = function(stats) {
      console.log("  checking noise...");
      for (var i in stats) {
         console.log(stats[i].name);
         if (stats[i].noise > 5) {
            console.log("  ALERT ["+stats[i].noise+"] on "+stats[i].coordinates);
            notify(stats[i].coordinates, stats[i].noise);
         }
      }
   }

   // Dada una latitud y longitud, devuelve los extremos de la
   // superfície
   var round = function(coords) {
      var c = 0.5;
      return [Math.floor(coords[0]*10)/10-c, Math.floor(coords[1]*10)/10-c, Math.floor(coords[0]*10)/10+c, Math.floor(coords[0]*10)/10+c]; 
   }

   // Objeto que exportaremos
   return {
      stats : {},
      init : function(hotspots) {
         console.log("init twitta");
         var that = this, cities = [], watchSymbols;
         this.destroy();
         // Recorre puntos y crea estructura inicial traduciendo gps a nombre de población
         // y calculando los alrededors que escucharemos
         for (var i in hotspots) {
            var p = hotspots[i];
            T.get("geo/reverse_geocode", {lat:p.coordinates.coordinates[1], long:p.coordinates.coordinates[0], granularity:"city"}, function(err, reply) {
               if (err) { console.log(err); return; }
               var name = reply.result.places[0].name;
               cities.push(name);
               console.log(" load " + name + " ["+p.coordinates.coordinates+"]...");
               that.stats[name] = new Stat(round(p.coordinates.coordinates), p.coordinates);
            });
         }
         // Magic happens
         watchSymbols = cities.map(function(o){return conf.keywords.map(function(e){return o+" "+e})+""}); 
         console.log(watchSymbols);
         this.checker = setInterval(checkNoise, 20000, this.stats);
         this.stream = T.stream("statuses/filter", {track: watchSymbols});
         this.stream.on("tweet", function(t) {
            for (var c in cities) {
               if (t.text.match(new RegExp(cities[c],"gi"))) {
                  that.stats[cities[c]].noise++;
                  break;
               }
            }
         });
      },
      destroy : function() {
         //Limpia estructuras y listeners para cargar las nuevas
         clearInterval(this.checker);
         if (this.stream) this.stream.close();
      },
      checker : null,
      stream : null
   }

}
