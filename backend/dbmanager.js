var mongodb = require('mongodb');
var cfg = require('./config');
var db;
var client;

function connect(callback) {
    console.log("dbmanager.connect()");
    db = mongodb.Db(cfg.bd.name, new mongodb.Server(cfg.bd.url, cfg.bd.port, {auto_reconnect:true}), {w:-1});
    db.open(function(err, cli) {
        if (err) {
            callback(false);
        } else {
            client = cli;
            callback(true);
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
    console.log("dbmanager.insert()" + json);
    db.collection(cfg.bd.HOT_SPOTS, function(err, col) {
        if (err) {
            callback(false);
        } else {
            col.insert(json);
            callback(true);
        }
    });
}
exports.insert = insert;

function erase(json, callback) {
    console.log("dbmanager.insert()");
    db.collection(cfg.bd.HOT_SPOTS, function(err, col) {
        if (err) {
            callback(false);
        } else {
            col.remove(col.findOne());
            callback(true);
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

