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
    res.json( respData )
})

app.get('/olcCodes', async (req, res) => {

    const coords = [[req.query.lat, req.query.lon]]
    const respData = await encode.encodeCoords(coords, req.query.rad, req.query.sz)
    console.log(respData)
    res.json( respData )
})

var apiServer = app.listen(8888, function () {

  var host = apiServer.address().address
  var port = apiServer.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})
