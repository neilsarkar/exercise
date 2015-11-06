var async      = require('async');
var mongodb    = require('mongodb');
var redis      = require('redis');
var pg         = require('pg');
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html', function(err) {
    if( err ) {
      console.error(err);
      res.status(err.status).end();
    }
  })
});

app.post('/message', createMessage);

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

function createMessage(req, res) {
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
      var failed = false;
      client.on('error', function(err) {
        if( failed ) { return; }
        failed = true;
        return cb(err);
      })

      client.set('cool', 'nice');
      client.get('cool', function(err, reply) {
        if( err && !failed ) { console.log("nope"); return cb(err); }
        if( reply != 'nice' ) { return cb(new Error("Redis value was not set")); }

        client.quit();
        if( !failed ) {
          cb();
        }
      })
    },

    postgres: function(cb) {
      var url = 'postgres://outside:lookingin@halp/bluebell';

      pg.connect(url, function(err, client, done) {
        if( err ) { return cb(err); }

        client.query("insert into hats (color, type, size) values ('blue', 'bowler', 3)", function(err, result) {
          if( err ) { return cb(err); }
          client.query('select * from hats order by id desc limit 1', function(err, result) {
            if( err ) { return cb(err); }
            if( result.rows[0].color != 'blue' || result.rows[0].type != 'bowler' || result.rows[0].size != 3 ) { return cb(new Error("Postgres row not inserted"))}
            client.end();
            cb();
          })
        });
      })
    }
  }, function(err, results) {
    if( err ) { return res.status(500).json({error: err}) }

    res.send("Mmkay.");
  })
}
