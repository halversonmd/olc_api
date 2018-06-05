var express = require('express');
var app = express();
var fs = require('fs');
var encode = require('./src/encode');
var bodyParser = require('body-parser');
var multer  = require('multer')

var upload = multer({ dest: './uploads/' })

app.use(bodyParser.json());

app.get('/coords', function (req, res) {
   fs.readFile( __dirname + "/" + "coods.json", 'utf8', function (err, data) {
       res.end( data );
   });
})

app.post('/olcCodes', upload.single('olcFile'), async (req, res) => {
    const respData = await encode.loadCsvFile(req.file.path)
    res.json( {olcCodes: respData} )
})

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})
