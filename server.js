process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var mongoose = require('./config/mongoose'),
    express = require('./config/express');
    fs = require('fs');
    csv = require('csvtojson');

var db = mongoose();
var app = express();

app.listen(3030);

module.exports = app;
console.log('Server running at http://localhost:3000/');

const csvFilePath="INUdata.csv";
csv()
  .fromFile(csvFilePath)
  .on("end_parsed",function(jsonArrayObj) { //when parse finished, result will be emitted here.
    var res = -1;
    for (var i=0; i < jsonArrayObj.length; i++) {
      var tempRes = parseInt(jsonArrayObj[i]["Timestamp"].split(":")[2]);
      if (res != tempRes) {
        fs.writeFile("input.json", JSON.stringify(jsonArrayObj[i], null, 4), {flag: "a"}, function(err) {
          if (err) {
              console.error(err);
              return;
          };
        });
        res = tempRes;
      }
    }
    console.log("File has been created");
  });
    /*
    fs.writeFile("input.json", JSON.stringify(jsonArrayObj, null, 4), "a", function(err) {
      if (err) {
          console.error(err);
          return;
      };
    console.log("File has been created");
    });
    */

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
