var socket = io.connect("http://test.watchfireproject.com:5000");
socket.on("connect", function () {
    socket.on("tweet", function(data) {
        printTweet(data);
    });
});

// Funcion a llamar por cada click
function emitGiveMeTweets(fireid) {
    socket.emit("fire", {
        id: fireid
    });
}

// Funcion a llamar cuando dejas de adfgdf
function emitClose() {
    socket.emit("close");
}
