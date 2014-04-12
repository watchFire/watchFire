// Configuration

module.exports = {
   path: {
      crawler: "shit.txt"
   },
   cron : {
      insert: "* * */160 * * *"
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