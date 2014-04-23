// Configuration

module.exports = {
   path: {
      data_file : "data/raw.txt",
      java_crawler : "../serviceUtils/serviceUtils_old.jar"
   },
   domain : "watchfireproject.com",
   cron : {
      insert: "0 0 * * * *",
      filter: "0 */1 * * * *"
   },
   bd : {
      name : "fire",
      url : "localhost",
      port : 27017,
      user : "",
      pwd : "",
      // COLLECIONTION_NAMES
      HOT_SPOTS : "hotspots",
      FIRES : "fuegoosh"
   },
   interface : {
      defaultRadio : 100000,
      port : 9999
   },
   sockets : {
      port : 5000
   },
   threshold : {
      // Confidence for acceptance
      hotspot : 60,
      fire : 70,
      // Filter risks
      temp : {
         min : 10,
         max : 30
      },
      humid : {
         min : 30,
         max : 50
      },
      wind : { 
         min : 13,   // As in fires paper
         max : 30
      },
      veg : {
         min : 0.0,
         max : 0.9
      },
      social_noise : 30
   },
   weight : {
      frp_risk : 0.2,
      confidence_risk : 0.8,
      hotspot_risk : 0.8,
      temp_risk : 0.25,
      humid_risk : 0.3,
      wind_risk : 0.15,
      veg_risk : 0.3,
      climate_risk : 0.2
   },
   twitter : {
      "watchFire_" : {
         consumer_key: "N2hj4dNVf19AzxWQhR5Ta7G2V",
         consumer_secret: "6rsWfOm4AVl2krS62PU9aT4pWaMzhmykSS6VcEkjiY8Lz92EN2",
         access_token: "2439996918-eEY3AzsFVTtLEFGo3qvUacWPrjEkDekkYSydtoZ",
         access_token_secret: "cMyye71rzl7fPQhv7z2WRmz9yFdtjGGHljRRlubuaLmD4"
      },
      "watchFireZar" : {
         consumer_key: "hWJkUuSSFnR4Z9QBj4oJpKYoH",
         consumer_secret: "O5Zm3pIKzLAaoE0g0hZtBc8T1H30BuHuyTSru01tSqpGsGo89Q",
         access_token: "2441302938-ThIMFFdbNAyWq8vLR7xaOCNU8YiopuYlT5N6VgG",
         access_token_secret: "igDWly8oGRCUYVRZAC98AIPKSa1ATtAbzYnZAOTQqxlP5"
      }
   },
   geode : {
      user : "watchFire",
      options : {language: 'en', country : 'US'}
   },
   keywords : {
	   AT:  ["feuer","brand","walbrand"],
	   BY:  ["агонь"],//Bellarus decodeURIComponent("%D0%B0%D0%B3%D0%BE%D0%BD%D1%8C")
	   CH:	["brand"],
	   DE:  ["feuer","brand","walbrand"],
	   ES:  ["incendio","fuego"],
	   FR: 	["feu"],
	   GB:  ["fire","burning","wildfire"],
	   IE:  ["fire","burning","wildfire"],
	   PL:  ["ogień"],
	   PT:  ["fogo"],
	   RU: 	["Пожар","огонь"], //decodeURIComponent("%D0%9F%D0%BE%D0%B6%D0%B0%D1%80")
	   UA: 	["вогонь"],//Ukraine decodeURIComponent("%D0%92%D0%BE%D0%B3%D0%BE%D0%BD%D1%8C")
   	   US:  ["fire","burning","wildfire"]

   }
};
