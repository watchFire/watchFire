var socket = io.connect("http://api.watchfireproject.com/", {resource: "tweets"});
socket.on("connect", function () {
    socket.on("foo", function(data) {
        console.log(data);
    });
});

// Funcion a llamar por cada click
function emitGiveMeTweets(fireid) {
    socket.emit("fire", {
        id: fireid
    });
    socket.on(fireid, function(data) {
       for (var t in data) {
          printTweet(data[t]);
       }
    });
}

// Funcion a llamar cuando dejas de adfgdf
function stopTweets(fireid) {
    socket.removeAllListeners(fireid);
}

// Funcion que pinta los tweets en el timeline
function printTweet(data){
   $('#time_line').prepend('<div class="tweet"><h3>'+ data.user +'</h3><p>'+ data.text +'</p></div>');
}
