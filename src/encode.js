'use strict'
let fs = require('fs');
let parse = require('csv-parse');
let olc = require('./olc')

var coordsToOlc = (coordsObj) => {
    let coords = coordsObj
    let codeLength = 6
    let r = 6371377.06 //radius of earth
    let h = 5566
    let w = 3500

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

    let masterCoords = [];
    for (var i=0; i<coords.length; i++){
        var latlngs = [];
        var lat = parseFloat(coords[i][0])
        var lon = parseFloat(coords[i][1])

        var start_coord = getStart((w*2.75), (h*2.5), lat, lon)

        latlngs.push(getStart((w*2.75), (h*2.5), lat, lon))

        for (var j=0; j<6; j++){
            for (var k=0; k<6; k++){
                latlngs.push([latlngs.slice(-1)[0][0], moveEast(latlngs.slice(-1)[0][0], latlngs.slice(-1)[0][1])])
            }
            if (i == 5) {
                { break; }
            } else {
                latlngs.push([moveSouth(latlngs.slice(-7)[0][0]), latlngs.slice(-7)[0][1]])
            }
        }
        masterCoords = masterCoords.concat(latlngs)
    }

    var olcSet = new Set();

    for (var i=0; i<masterCoords.length; i++) {
        var latitude = parseFloat(masterCoords[i][0])
        var longitude = parseFloat(masterCoords[i][1])
        olcSet.add(olc.encode(latitude, longitude, codeLength))
    }

    return JSON.stringify([...olcSet])

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
