// Requires
var mongodb = require('mongodb');

module.exports.init = function(conf) {
    this.conf = conf;
}

module.exports.connect = function(callback) {
    if (!module.exports.conf) {
        console.log("dbmanager error - not init");
        return;
    }
    console.log("dbmanager.connect()");
    module.exports.db = mongodb.Db(module.exports.conf.name, new mongodb.Server(module.exports.conf.url, module.exports.conf.port, {auto_reconnect:true}), {w:-1});
    module.exports.db.open(callback);
};

module.exports.disconnect = function() {
    if (!module.exports.db) {
        console.log("dbmanager error - not init");
        return;
    }
    console.log("dbmanager.disconnect()");
    module.exports.db.close();
};

module.exports.insert = function(collection, json, callback) {
    if (!module.exports.db) {
        console.log("dbmanager error - not init");
        return;
    }
    module.exports.db.collection(collection, function(err, col) {
        if (err) {
           callback(err);
        } else {
           col.insert(json, callback);
        }
    });
};

module.exports.find = function(collection, filter, callback) {
    if (!module.exports.db) {
        console.log("dbmanager error - not init");
        return;
    }
    module.exports.db.collection(collection, function(err, con) {
        if (err) {
           callback(err);
        } else {
           con.find(filter).toArray(callback);
        }
    });
};

module.exports.update = function(collection, query, update, options, callback) {
    if (!module.exports.db) {
        console.log("dbmanager error - not init");
        return;
    }
    module.exports.db.collection(collection, function(err, col) {
        if (err) {
           callback(err);
        } else {
           col.update(query, update, options, callback);
        }
    });
};

module.exports.erase = function(collection, callback) {
    if (!module.exports.db) {
        console.log("dbmanager error - not init");
        return;
    }
    console.log("dbmanager.erase()");
    module.exports.db.collection(collection, function (err, col) {
       if (err) {
          callback(err);
       } else {
          col.remove({}, callback);
       }
    });
}
