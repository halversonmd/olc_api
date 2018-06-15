var express = require('express');
var app = express();
var fs = require('fs');
var encode = require('./src/encode');
var bodyParser = require('body-parser');
var multer  = require('multer')
var verify = require('./src/verify');

const path = require('path')
const uploadFolder = path.join(__dirname, '/uploads/')
const contactFolder = path.join(__dirname, '/contacts/')
var upload = multer({ dest: uploadFolder })

app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


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
    res.json( respData )
})

app.post('/submit', async (req, res) => {
  var fileName = path.join(contactFolder, JSON.stringify(new Date().getTime()))
  fs.writeFile(fileName + '.json', JSON.stringify(req.body), (err) => {
    if (err) throw err;
  });
  console.log('saved req.body:', req.body)
  res.json({status:'success'})
})

app.post('/verify', async (req, res) => {
    var backEndResp = await verify.Verify(req.body.token)
    res.json (backEndResp)
})

var apiServer = app.listen(8888, function () {

  var host = apiServer.address().address
  var port = apiServer.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})
