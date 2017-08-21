process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var mongoose = require('./config/mongoose'),
    express = require('./config/express');

var db = mongoose();
var app = express();

app.listen(3000);

module.exports = app;
console.log('Server running at http://localhost:3000/');


var promiseCSV = require('./config/promiseCSV');
var path = "INUdata.csv";
var options = { 'headers': false };

/*
var cords = promiseCSV(path, options).then(function (records) {
    // do other stuff
    for (var i=0; i<records.length; i=i+6) {
        console.log(records[i]);
    }

});
*/