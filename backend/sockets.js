var io = require('socket.io');
var tweetInterval;

function responseGiveMeTweets(socket) {
    socket.on("giveMeTweets", function (data) {
        // Enganchar con lo de Pepe aqui. Cambiar setIntervals por
        // eventos de tuiter
        tweetInterval = setInterval(function () {
            socket.emit("getTweets", {
                username: result.username,
                text: result.text
            });
        }, 100);
    });
}

function responseDisconnect(socket) {
    socket.on("disconnect", function () {
         clearInterval(tweetInterval);
    });
}

function responseClose(socket) {
    socket.on("close", function () {
         clearInterval(tweetInterval);
    });
}

function createRouter(server) {
    io = io.listen(server);
    io.configure( function(){
        io.set('log level', 1);
        io.set('transports',['websocket','xhr-polling','flashsocket','htmlfile', 'jsonp-polling']);
        io.set('polling duration',10);
    });
    io.on('connection', function (socket) {
        responseGiveMeTweets(socket);
        responseDisconnect(socket);
        responseClose(socket);
    });

}
exports.createRouter = createRouter;
