var process = require('process');
var cp = require('child_process');
var fs = require('fs');

var server = cp.fork('index.js');
console.log('Server started');

fs.watchFile('index.js', function (event, filename) {
    server.kill();
    console.log('Server stopped');
    server = cp.fork('index.js');
    console.log('Server started');
});

fs.watchFile('./src/encode.js', function (event, filename) {
    server.kill();
    console.log('Server stopped');
    server = cp.fork('index.js');
    console.log('Server started');
});

process.on('SIGINT', function () {
    server.kill();
    fs.unwatchFile('index.js');
    process.exit();
});
