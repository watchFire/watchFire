var mongodb = require('mongodb');
var cfg = require('./config');
var db;
var client;

function connect(callback) {
    console.log("dbmanager.connect()");
    db = mongodb.Db(cfg.bd.name, new mongodb.Server(cfg.bd.url, cfg.bd.port, {auto_reconnect:true}), {w:-1});
    db.open(function(err, cli) {
        if (err) {
            callback(err);
        } else {
            client = cli;
            callback(err);
        }
    });
}
exports.connect = connect;

function disconnect() {
    console.log("dbmanager.disconnect()");
    db.close();
}
exports.disconnect = disconnect;

function insert(json, callback) {
    db.collection(cfg.bd.HOT_SPOTS, function(err, col) {
        if (err) {
            callback(err);
        } else {
            col.insert(json);
            callback(err);
        }
    });
}
exports.insert = insert;

function erase(json, callback) {
    console.log("dbmanager.insert()");
    db.collection(cfg.bd.HOT_SPOTS, function(err, col) {
        if (err) {
            callback(err);
        } else {
            col.remove(col.findOne());
            callback(err);
        }
    });
}
exports.erase = erase;

/*
function search(lat1, lon1, lat2, lon2) {
    console.log("dbmanager.search()");
    db.collection(cfg.bd.HOT_SPOTS, function(err, col) {
        if (err) {
            callback(false);
        } else {
            
             col.find({ coord:
                        { $geoWithin :
                            { $box: coordinates: [[lat1, lon1],[lat2, lon2]] } } });


            callback(true);
        }
    });
   
}
exports.search = search;*/

