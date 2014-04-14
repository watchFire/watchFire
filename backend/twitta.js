// Imports
var Twit = require("twit");
var timer = require("timer");
var mongodb = require("mongodb");

module.exports = function(con, bd, twit) {

   // Conecta a la BD y autentica API Twitter
   // var db = mongodb.Db(bd.name, new mongodb.Server(bd.url, bd.port, {auto_reconnect:true}), {w:-1}), con;

   var T = new Twit({
      consumer_key: twit["watchFire_"].key,
      consumer_secret: twit["watchFire_"].secret,
      access_token: twit["watchFire_"].token,
      access_token_secret: twit["watchFire_"].token_secret 
   });

   // Crea estructura para escuchar puntos 
   function Stat(name, area, coordinates) {
      this.name = name;
      this.coordinates = coordinates
      this.noise = 0;
      this.area = area;
      // Mejorar filtros
      this.stream_word = T.stream("statuses/filter", {track:"incendio "+name+","+name+"incendio"});
      this.stream_gps = T.stream("statuses/filter", {locations:this.area});

      this.stream_word.on("tweet", function(t) {
         console.log(t.text);
         this.noise++;
      });

      this.stream_gps.on("tweet", function(t) {
         if (t.text.match(/fuego|incendio|fire/)) {
            console.log(t.text);
            this.noise++;
         }
      });
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
            notify(stats[i].coordinates, stats[i].noise/10);
         }
      }
      //stats[i]--;
   }

   // Dada una latitud y longitud, devuelve los extremos de la
   // superfície
   var round = function(coords) {
      var c = 0.5;
      return [Math.floor(coords[0]*10)/10-c, Math.floor(coords[1]*10)/10-c, Math.floor(coords[0]*10)/10+c, Math.floor(coords[0]*10)/10+c]; 
   }

   // Objeto que exportaremos
   return {
      stats : [],
      init : function(hotspots) {
         var that = this;
         this.destroy();
         // Recorre puntos y crea estructura inicial traduciendo gps a nombre de población
         // y calculando los alrededors que escucharemos
         for (var i in hotspots) {
            var p = hotspots[i];
            T.get("geo/reverse_geocode", {lat:p.coordinates.coordinates[1], long:p.coordinates.coordinates[0], granularity:"city"}, function(err, reply) {
               if (err) { console.log(err); return; }
               var name = reply.result.places[0].name;
               console.log(" load " + name + " ["+p.coordinates.coordinates+"]...");
               that.stats.push(new Stat(name, round(p.coordinates.coordinates)));
            });
         }
         this.checker = setInterval(checkNoise, 20000, this.stats);
      },
      destroy : function() {
         //Limpia estructuras y listeners para cargar las nuevas
         clearInterval(this.checker);
         for (var i in this.stats) {
            stats[i].stream_word.close(); 
            stats[i].stream_gps.close();
         }
      },
      checker : null
   }

}
