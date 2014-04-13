var socket = io.connect("http://localhost:5000");
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