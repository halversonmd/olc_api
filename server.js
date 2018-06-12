var process = require('process');
var cp = require('child_process');
var fs = require('fs');
const path = require('path')

var server = cp.fork(indexFile);
console.log('Server started');
const indexFile = path.join(__dirname, '/index.js')
console.log(indexFile)

fs.watchFile(indexFile, function (event, filename) {
    server.kill();
    console.log('Server stopped');
    server = cp.fork(indexFile);
    console.log('Server started');
});

fs.watchFile('./src/encode.js', function (event, filename) {
    server.kill();
    console.log('Server stopped');
    server = cp.fork(indexFile);
    console.log('Server started');
});

process.on('SIGINT', function () {
    server.kill();
    fs.unwatchFile(indexFile);
    process.exit();
});
