// Configuration

module.exports = {
   path: {
      crawler: "data/raw.txt"
   },
   cron : {
      insert: "0 0 * * * *"
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
   },
   twitter : {
      key: "N2hj4dNVf19AzxWQhR5Ta7G2V",
      secret: "6rsWfOm4AVl2krS62PU9aT4pWaMzhmykSS6VcEkjiY8Lz92EN2",
      token: "2439996918-eEY3AzsFVTtLEFGo3qvUacWPrjEkDekkYSydtoZ",
      token_secret: "cMyye71rzl7fPQhv7z2WRmz9yFdtjGGHljRRlubuaLmD4"
   }
};
