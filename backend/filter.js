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
              if (h.temperature >= cfg.threshold.temp.max) rt = 1;
              else if (h.temperature < cfg.threshold.temp.min) rt = 0;
              else rt = (h.temperature-cfg.threshold.temp.min)/20.0;
              // Humedad
              if (h.humidity >= cfg.threshold.humid.max) rh = 0;
              else if (h.humidity < cfg.threshold.humid.min) rh = 1;
              else rh = 1 - ((h.humidity-cfg.threshold.humid.min)/20.0);
              // Velocidad viento
              if (h.windSpeed <= cfg.threshold.wind.min) rv = 0; // por paper de incendios
              else if (h.windSpeed >= cfg.threshold.wind.max) rv = 1;
              else rv = (h.windSpeed-cfg.threshold.wind.min)/17.0;
              // Vegetación
              if (h.vegetation <= cfg.threshold.veg.min) rvg = 0;
              else if (h.vegetation > cfg.threshold.veg.max) rvg = 0;
              else if (h.vegetation == cfg.threshold.veg.max) rvg = 1;
              else rvg = (h.vegetation)/cfg.threshold.veg.max;
              
              rfrp = h.frp/480.0;
              
              new_confidence = (h.confidence*rfrp/100.0)*cfg.weight.frp_risk +
                                                      rt*cfg.weight.temp_risk +
                                                      rh*cfg.weight.humid_risk +
                                                      rv*cfg.weight.wind_risk +
                                                      rvg*cfg.weight.veg_risk;

              // Vemos criticidad a partir de puntos con ruído
              // social
              if (h.noise > cfg.threshold.social_noise) {
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
