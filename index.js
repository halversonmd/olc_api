var express = require('express');
var app = express();
var fs = require('fs');
var encode = require('./src/encode');
var bodyParser = require('body-parser');

app.use(bodyParser.json());

app.get('/coords', function (req, res) {
   fs.readFile( __dirname + "/" + "coods.json", 'utf8', function (err, data) {
       res.end( data );
   });
})

app.post('/olcCodes', function (req, res) {
    res.end( encode.encodeCoords(req.body) );
})

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})
