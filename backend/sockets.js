var io = require('socket.io');

function responseDameTuits(socket) {
    socket.on("dameTuits", function (data) {
        // Hacer algo con data.id
        socket.emit("tomaTusPutosTuits", {
            // Enviar los tuits
        });
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
        responseDameTuits(socket);
    });

}
exports.createRouter = createRouter;
