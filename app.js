var async = require('async');
var mongodb = require('mongodb');
var redis = require('redis');

async.parallel({
  mongo: function (cb) {
    var url = 'mongodb://chicken:tetrazzini@halp:27019/porcelain';
    mongodb.MongoClient.connect(url, function(err, db) {
      if( err ) { return cb(err); }

      db.close(cb);
    })
  },

  redis: function(cb) {
    var url = 'redis://amber:energy@halp:6380';
    var client = redis.createClient(url);
    client.on('error', function(err) {
      throw err;
    })

    client.set('cool', 'nice');
    client.get('cool', function(err, reply) {
      if( err ) { return cb(err); }
      if( reply != 'nice' ) { return cb(new Error("Redis value was not set")); }

      client.quit();
      cb();
    })
  }
}, function(err, results) {
  if( err ) { throw err; }

  console.log("Mmkay.");
})
