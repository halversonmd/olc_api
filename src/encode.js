'use strict'
let fs = require('fs');
let parse = require('csv-parse');
let olc = require('./olc')

var coordsToOlc = (coords, radius, codeLength) => {

    if (radius === 5) {
        var widthCount = 1
        var widthIter = 4
        var heightCount = 1.25
        var heightIter = 3
    } else if (radius === 10) {
        var widthCount = 2.75
        var widthIter = 6
        var heightCount = 2.5
        var heightIter = 6
    }
    let r = 6371377.06 //radius of earth
    let h = 5566
    let w = 4210

    let deg2rad = (deg) => {
        return deg * (Math.PI/180)
    }

    let getStart = (west, north, lat, lon) => {
        let startLat = (north*2*180)/((r*2)*Math.PI)+lat
        let startLon = (((west/r)/(Math.cos(deg2rad(lat))*Math.cos(deg2rad(lat))))+deg2rad(lon))*(180/Math.PI)
        startLon = lon - (startLon - lon)
        return [startLat, startLon]
    }

    let moveSouth = (lat) => {
        let change = (h*2*180)/((r*2)*Math.PI)+lat
        return lat - (change-lat)
    }

    let moveEast = (lat, lon) => {
        return (((w/r)/(Math.cos(deg2rad(lat))*Math.cos(deg2rad(lat))))+deg2rad(lon))*(180/Math.PI)
    }

    var olcArr = []
    for (var i=0; i<coords.length; i++){

        var latlngs = getStart((w*widthCount), (h*heightCount), parseFloat(coords[i][0]), parseFloat(coords[i][1]))
        olcArr.push(olc.encode(latlngs[0], latlngs[1], codeLength))
        for (var j=0; j<widthIter; j++){
            for (var k=0; k<heightIter; k++){
                var lastCode = olc.decode(olcArr.slice(-1)[0])
                var midLat = lastCode.latitudeHi - ((lastCode.latitudeHi-lastCode.latitudeLo)/2)
                var midLon = lastCode.longitudeHi + ((lastCode.longitudeHi-lastCode.longitudeLo)/2)
                olcArr.push(olc.encode(midLat, midLon, codeLength))
            }
            if (j == widthIter-2) {
                { break; }
            } else {
                var lastCode = olc.decode(olcArr.slice(-(heightIter+1))[0])
                var midLat = lastCode.latitudeLo - ((lastCode.latitudeHi-lastCode.latitudeLo)/2)
                var midLon = lastCode.longitudeHi - ((lastCode.longitudeHi-lastCode.longitudeLo)/2)
                olcArr.push(olc.encode(midLat, midLon, codeLength))
            }
        }
    }
    var respOlc = olcArr.filter(function (el, i, arr) {
        return arr.indexOf(el) === i;
    });
    return {olcCodes:respOlc, pois: coords}

}

let loadCsv = async (fileName) => {
    var j;
    var resp = await new Promise((resolve, reject) => {
        fs.readFile(fileName, (err, fileData) => {
            parse(fileData, (er, rows) => {
                resolve(j = coordsToOlc(rows.slice(1), 5, 6))
            })
        })
    })
    return j
}

let parseBuf = (buf) => {
    console.log('buf', buf)
    parse(buf, (er, rows) => {
        return coordsToOlc(rows.slice(1))
        })
}
module.exports = {
    encodeCoords: coordsToOlc,
    parseBuffer: parseBuf,
    loadCsvFile: loadCsv
}