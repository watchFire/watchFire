var cfg = require('./config');
var dbmanager = require('./dbmanager');

function run() {
    console.log("filter process");
    dbmanager.find(cfg.bd.HOT_SPOTS, {}, function(err, docs){
        var tmp, new_confidence, noise, criticidad, point;
        var rt, rh, rv, rvg, rfrp;
        if (!err) {
           for (var i in docs) {
              // Computing different risks
              rt = temp_risk(docs[i]);
              rh = humid_risk(docs[i]);
              rv = wind_risk(docs[i]);
              rvg = veg_risk(docs[i]);
              
              rfrp = docs[i].frp/480.0;
              
              //console.log("rfrp = " + rfrp);
              //console.log("confidence = " + docs[i].confidence/100);
              
              //new_confidence = (old_confidence*0.2 + frp*0.8)*0.8 + (temp*0.25 + humedad*0.3 + wind*0.15 + veg*0.3)*0.2
              new_confidence = ((docs[i].confidence/100.0)*cfg.weight.confidence_risk + rfrp*cfg.weight.frp_risk)*cfg.weight.hotspot_risk +
                               (rt*cfg.weight.temp_risk + rh*cfg.weight.humid_risk +
                               rv*cfg.weight.wind_risk + rvg*cfg.weight.veg_risk)*cfg.weight.climate_risk;

              // Vemos criticidad a partir de puntos con ruído social
              if (docs[i].noise > cfg.threshold.social_noise) {
                noise = true;
                criticidad = docs[i].noise*0.3 + docs[i].frp*0.35 + docs[i].vegetation*0.2 + docs[i].windSpeed*0.15;
              } else {
                noise = false;
                criticidad = docs[i].frp*0.45 + docs[i].vegetation*0.3 + docs[i].windSpeed*0.25;
              } 

              // Puntos que ofrecemos al backend
              point = {
                 "_id": docs[i]._id,
                 "date": docs[i].date,
                 "coordinates" : docs[i].coordinates,
                 "confidence" : new_confidence,
                 "impact" : criticidad,
                 "noise" : noise,
                 "windDirection" : docs[i].windDirection
              }

              dbmanager.update(cfg.bd.FIRES, {coordinates: docs[i].coordinates}, point, {upsert:true}, function(err){});
              
           } 
        }
    });
}

exports.run = run;

function temp_risk(spot){
  if (spot.temperature >= cfg.threshold.temp.max) return 1;
  else if (spot.temperature < cfg.threshold.temp.min) return 0;
  else return (spot.temperature-cfg.threshold.temp.min)/20.0;
}

function humid_risk(spot){
  if (spot.humidity >= cfg.threshold.humid.max) return 0;
  else if (spot.humidity < cfg.threshold.humid.min) return 1;
  else return 1 - ((spot.humidity-cfg.threshold.humid.min)/20.0);
}

function wind_risk(spot){
  if (spot.windSpeed <= cfg.threshold.wind.min) return 0; // por paper de incendios
  else if (spot.windSpeed >= cfg.threshold.wind.max) return 1;
  else return (spot.windSpeed-cfg.threshold.wind.min)/17.0;
}

function veg_risk(spot){
  if (spot.vegetation <= cfg.threshold.veg.min) return 0;
  else if (spot.vegetation > cfg.threshold.veg.max) return 0;
  else if (spot.vegetation == cfg.threshold.veg.max) return 1;
  else return (spot.vegetation)/cfg.threshold.veg.max;
}
