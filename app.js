var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var mongoURI = require('./config/mongolab');
var app = express();

require('./server/config/middleware.js')(app, express);

mongoose.connect(mongoURI);


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log('db success');
});


// only run server if app.js was run directly (rather than being
// imported as a module)
if (!module.parent) {
  var port = process.env.PORT || 3000;

  var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
  });
}

module.exports = app;






