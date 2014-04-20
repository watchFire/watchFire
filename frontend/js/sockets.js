var socket = io.connect("http://test.watchfireproject.com/", {resource: "tweets"});
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
    /*socket.on(fireid, function(data) {
        console.log("YAP!");
        printTweet(data);
    });*/
}

// Funcion a llamar cuando dejas de adfgdf
function stopTweets(fireid) {
    socket.removeAllListeners(fireid);
}

// Funcion que pinta los tweets en el timeline
function printTweet(data){
   console.log(data);
   $('#time_line').prepend('<div class="tweet"><h3>'+ data.user +'</h3><p>'+ data.text +'</p></div>');
}
