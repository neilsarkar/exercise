var mongodb = require('mongodb');

var url = 'mongodb://chicken:tetrazzini@halp:27019/porcelain';

mongodb.MongoClient.connect(url, function(err, db) {
  if( err ) { throw err; }

  db.close(function(err, ok) {
    if( err ) { throw err; }
    console.log("Connected");
  });
})
