var socket = io.connect("http://fire.vwzq.net:9999");
socket.on("connect", function () {
    socket.on("getTweets", function(data) {
        printTweet(data);
    });
});

// Funcion a llamar por cada click
function emitGiveMeTweets(fireid) {
    socket.emit("giveMeTweets", {
        id: fireid
    });
}

// Funcion a llamar cuando dejas de adfgdf
function emitClose() {
    socket.emit("close");
}