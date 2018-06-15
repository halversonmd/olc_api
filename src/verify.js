'use strict'
var http = require("https");
var querystring = require('querystring');
var config = require('../config');

var verify = async (token) => {
    let data = {
        secret: config.secret,
        response: token
    }
    var resp;
    var resPromise = await new Promise((resolve, reject) => {
        http.get("https://www.google.com/recaptcha/api/siteverify?secret=" + data.secret + "&response=" + data.response, async (res) => {
            var responseString = "";
            var tick = 0
            res.on("data", function (data) {
                responseString += data;
                tick++
            });
            res.on("end", function () {
                resolve( resp = JSON.parse(responseString))
            });

        }).on('error', (e) => {
                console.error(`problem with request: ${e.message}`);
            });;
    });

    return resp
}

module.exports = {
    Verify: verify
}
