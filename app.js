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

  console.log('Exercise app listening at http://%s:%s', host, port);
});

function createMessage(req, res) {
  var message = req.body.message;
  if( !message ) { return res.send(422); }

  var createdAt = new Date;

  async.parallel({
    mongo: function (cb) {
      var url = 'mongodb://chicken:tetrazzini@mango:27019/porcelain';
      mongodb.MongoClient.connect(url, function(err, db) {
        if( err ) { return cb(err); }

        db.collection('comments').insert({
          message: message,
          created_at: createdAt
        }, function(err, ok) {
          if( err ) { return cb(err); }
          db.close(cb);
        })
      })
    },

    redis: function(cb) {
      var url = 'redis://amber:energy@raspberry:6380';
      var client = redis.createClient(url);
      var failed = false;
      client.on('error', function(err) {
        if( failed ) { return; }
        failed = true;
        client.quit();
        return cb(err);
      })

      client.lpush('comments', JSON.stringify({message: message, created_at: +createdAt}));
      client.quit();

      if( !failed ) { cb(); }
    },

    postgres: function(cb) {
      var url = 'postgres://outside:lookingin@pineapple/bluebell';

      pg.connect(url, function(err, client, done) {
        if( err ) { return cb(err); }

        client.query("insert into comments (text, created_at) values ('"+message+"', "+createdAt+")", function(err, result) {
          if( err ) { return cb(err); }
        });
      })
    }
  }, function(err, results) {
    if( err ) { return res.status(500).json({error: err}) }

    res.send("Mmkay.");
  })
}
