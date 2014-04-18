var cfg = require('./config');
var dbmanager = require('./dbmanager');

function run() {
    console.log("filter process");
    dbmanager.find(cfg.bd.HOT_SPOTS, {}, function(err, docs){
        var tmp, new_confidence, noise, criticidad, point;
        var rt, rh, rv, rvg, rfrp;
        if (!err) {
           // MODELO METEREOCLIMAFIRELOGICO BASADO EN CALCULOS
           // FRACTALES REALIZADOS CON UN BINDING DE FORTRAN
           // A MATLAB
           for (var i in docs) {
              h = docs[i];
              // Temperatura
              if (h.temperature >= 30) rt = 1;
              else if (h.temperature < 10) rt = 0;
              else rt = (h.temperature-10.0)/20.0;
              // Humedad
              if (h.humidity >= 50) rh = 0;
              else if (h.humidity < 30) rh = 1;
              else rh = 1 - ((h.humidity-30.0)/20.0);
              // Velocidad viento
              if (h.windSpeed <= 13) rv = 0; // por paper de incendios
              else if (h.windSpeed >= 30) rv = 1;
              else rv = (h.windSpeed-13.0)/17.0;
              // Vegetación
              if (h.vegetation <= 0.0) rvg = 0;
              else if (h.vegetation > 0.9) rvg = 0;
              else if (h.vegetation == 0.9) rvg = 1;
              else rvg = (h.vegetation)/0.9;
              
              rfrp = h.frp/480.0;
              
              new_confidence = (h.confidence*rfrp/100.0)*0.3 + rt*0.15 + rh*0.2 + rv*0.1 + rvg*0.25;

              // Vemos criticidad a partir de puntos con ruído
              // social
              if (h.noise > 30) {
                noise = true;
                criticidad = h.noise*0.3 + h.frp*0.35 + h.vegetation*0.2 + h.windSpeed*0.15;
              } else {
                noise = false;
                criticidad = h.frp*0.45 + h.vegetation*0.3 + h.windSpeed*0.25;
              } 

              // Puntos que ofrecemos al backend
              point = {
                 "date": h.date,
                 "coordinates" : h.coordinates,
                 "confidence" : new_confidence,
                 "impact" : criticidad,
                 "noise" : noise,
                 "windDirection" : h.windDirection
              }

              dbmanager.update(cfg.bd.FIRES, {coordinates: h.coordinates}, point, {upsert:true}, function(err){});
              
           } 
        }
    });
}

exports.run = run;
