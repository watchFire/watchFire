// Configuration

module.exports = {
   crawl : {
      data : [
         { david  : "urldavid" }// URL de la mierda de Java de David
      ],
      cron : "*/5 * * * * *"
   },
   bd : {
      name : "fire",
      url : "localhost",
      port : 27017,
      user : "",
      pwd : "",
      // COLLECIONTION_NAMES
      HOT_SPOTS : "hotspots"
   },
   interface : {
      port : 9999
   }
};