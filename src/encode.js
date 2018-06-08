'use strict'
let fs = require('fs');
let parse = require('csv-parse');
let olc = require('./olc')

var coordsToOlc = (coords, radius, codeLength) => {

    // let codeLength = 6
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

        var latlngs = getStart((w*2.75), (h*2.5), parseFloat(coords[i][0]), parseFloat(coords[i][1]))
        olcArr.push(olc.encode(latlngs[0], latlngs[1], codeLength))
        for (var j=0; j<6; j++){
            for (var k=0; k<6; k++){
                var lastCode = olc.decode(olcArr.slice(-1)[0])
                var midLat = lastCode.latitudeHi - ((lastCode.latitudeHi-lastCode.latitudeLo)/2)
                var midLon = lastCode.longitudeHi + ((lastCode.longitudeHi-lastCode.longitudeLo)/2)
                olcArr.push(olc.encode(midLat, midLon, codeLength))
            }
            if (j == 5) {
                { break; }
            } else {
                var lastCode = olc.decode(olcArr.slice(-7)[0])
                var midLat = lastCode.latitudeLo - ((lastCode.latitudeHi-lastCode.latitudeLo)/2)
                var midLon = lastCode.longitudeHi - ((lastCode.longitudeHi-lastCode.longitudeLo)/2)
                olcArr.push(olc.encode(midLat, midLon, codeLength))
            }
        }
    }

    return {olcCodes:olcArr, pois: coords}

}

let loadCsv = async (fileName) => {
    var j;
    var resp = await new Promise((resolve, reject) => {
        fs.readFile(fileName, (err, fileData) => {
            parse(fileData, (er, rows) => {
                resolve(j = coordsToOlc(rows.slice(1)))
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