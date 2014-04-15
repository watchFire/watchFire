var cfg = require('./config');
var dbmanager = require('./dbmanager');

function run() {
    console.log("filter process");
    dbmanager.find(cfg.bd.HOT_SPOTS, {}, function(err, docs){
        var tmp, new_confidence, noise, criticidad, point;
        var rt, rh, rv, rvg;
        if (!err) {
           // FIRE MODEL
        	//uses hotspots, wind velocity, temperature, humidity, moisture and social noise
           for (var i in docs) {
              h = docs[i];
              // Temperatura
              if (h.temperature >= 30) rt = 100;
              else if (h.temperature < 10) rt = 0;
              else rt = (h.temperature-10)*100/20;
              // Humedad
              if (h.humidity >= 50) rh = 0;
              else if (h.humidity < 30) rh = 100;
              else rh = 100 + (30-h)*50;
              // Velocidad viento
              if (h.windSpeed <= 13) rv = 0; // por paper de incendios
              else if (h.windSpeed >= 30) rv = 100;
              else rv = (h.windSpeed-13)*100/17;
              // Vegetación
              if (h.vegetation <= 0.4) rvg = 0;
              else if (h.vegetation > 0.9) rvg = 0;
              else if (h.vegetation == 0.9) rvg = 100;
              else rvg = (h.vegetation-0.4)*100/0.5;

              new_confidence = h.confidence + (rt*0.1+rh*0.075+rv*0.55+rvg*0.025);

              // Vemos criticidad a partir de puntos con ruído
              // social
              if (h.noise > 30) {
                noise = true;
                criticididad = h.noise + 200*(h.frp/300*0.1 + h.vegetatio + h.windSpeed/80*0.6);
              } else {
                noise = false;
                criticidad = 300*(h.frp/300*0.3 + h.vegetation + h.windSpeed/80*0.6);
              } 

              // Puntos que ofrecemos al backend
              point = {
                 "fecha": h.date,
                 "coordenadas" : h.coordinates,
                 "confidence" : new_confidence,
                 "impact" : criticidad,
                 "noise" : noise
              }

              dbmanager.update(cfg.bd.FIRES, {coordenadas:point.coordenadas}, point, {upsert:true}, function(err){});
              
           } 
        }
    });
}

exports.run = run;
