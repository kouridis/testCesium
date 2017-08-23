process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var mongoose = require('./config/mongoose'),
    express = require('./config/express');

var db = mongoose();
var app = express();

app.listen(3040);

module.exports = app;
console.log('Server running at http://localhost:3000/');

var fs = require('fs');
/*
var promiseCSV = require('./config/promiseCSV');
var path = "INUdata.csv";
var options = { 'headers': false };

promiseCSV(path, options).then(function (records) {
  //console.log(records);
  fs.writeFile('input.json', records,  function(err) {
    if (err) {
      return console.error(err);
    }

    console.log("Data written successfully!");
  });
});
*/

const csvFilePath="INUdata.csv";
const csv=require('csvtojson');
csv()
  .fromFile(csvFilePath)
  .on("end_parsed",function(jsonArrayObj) { //when parse finished, result will be emitted here.
    fs.writeFile("input.json", JSON.stringify(jsonArrayObj, null, 4), function(err) {
      if (err) {
          console.error(err);
          return;
      };
    console.log("File has been created");
    });
 })
