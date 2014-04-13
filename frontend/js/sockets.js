var socket = io.connect("http://fire.vwzq.net:9999");
socket.on("connect", function () {
    socket.on("getTweets", function(data) {
        // Funcion a ejecutar. data hablar con Pepe para ver que devuelve
        // printTweet(data);
    });
});

// Funcion a llamar por cada click
function emitGiveMeTweets(fireid) {
    socket.emit("giveMeTweets", {
        id: fireid
    });
}