// Configuration

module.exports = {
   path: {
      data_file : "data/raw.txt",
      java_crawler : "../serviceUtils/serviceUtils_old.jar"
   },
   cron : {
      insert: "0 0 * * * *",
      filter: "*/15 * * * * *"
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
      frp_risk : 0.3,
      temp_risk : 0.15,
      humid_risk : 0.2,
      wind_risk : 0.1,
      veg_risk : 0.25
   },
   twitter : {
      "watchFire_" : {
         key: "N2hj4dNVf19AzxWQhR5Ta7G2V",
         secret: "6rsWfOm4AVl2krS62PU9aT4pWaMzhmykSS6VcEkjiY8Lz92EN2",
         token: "2439996918-eEY3AzsFVTtLEFGo3qvUacWPrjEkDekkYSydtoZ",
         token_secret: "cMyye71rzl7fPQhv7z2WRmz9yFdtjGGHljRRlubuaLmD4"
      },
      "watchFireZar" : {
         key: "hWJkUuSSFnR4Z9QBj4oJpKYoH",
         secret: "O5Zm3pIKzLAaoE0g0hZtBc8T1H30BuHuyTSru01tSqpGsGo89Q",
         token: "2441302938-ThIMFFdbNAyWq8vLR7xaOCNU8YiopuYlT5N6VgG",
         token_secret: "igDWly8oGRCUYVRZAC98AIPKSa1ATtAbzYnZAOTQqxlP5"
      },
      "watchFire2" : {
         key: "",
         secret: "",
         token: "",
         token_secret: ""
      }
   },
   keywords : {//TODO: use character set for cyrillic
	   BY:  [decodeURIComponent("%D0%B0%D0%B3%D0%BE%D0%BD%D1%8C")],//Bellarus
	   ES:  ["incendio","fuego"],
	   FR: 	["feu"],
	   GB:  ["fire"],
	   RU: 	[decodeURIComponent("%D0%9F%D0%BE%D0%B6%D0%B0%D1%80")], 
	   UA: 	[decodeURIComponent("%D0%92%D0%BE%D0%B3%D0%BE%D0%BD%D1%8C")],//Ukraine
	   US:  ["fire"],
	   PT:  ["fogo"],
	   PL:  [""],
	   IE:  [""],
	   AT:  [""],
	   CH:	["brand"]
   }
};
