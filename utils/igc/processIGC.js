var igcToJson = require('./igcToJson.js').default
var fs = require('fs'),
  path = require('path'),
  filePath = path.join(__dirname, '../../data/igcExamples/skyline.igc')

function readIGC() {
  fs.readFile(filePath, {encoding: 'utf-8'}, function (err, data) {
    if (!err) {
      const igcData = igcToJson(data)
      const { recordTime, latLong, gpsAltitude } = igcData

      const count = gpsAltitude.length - 10
      // console.log(igcData)

      const startTime = new Date(recordTime[0]).getTime()
      const endTime = new Date(recordTime[recordTime.length - 1]).getTime()
      const totalTime = Math.abs(endTime - startTime)

      console.log('total time', totalTime)

      const coordinates = []

      for (let i = 0; i < count; i++) {
        coordinates.push([latLong[i][1], latLong[i][0], gpsAltitude[i]])
      }

      let jsonStr = JSON.stringify({coordinates, totalTime, recordTime})
      console.log('write to data')
      fs.writeFileSync('igc-data-sample.json', jsonStr)
    } else {
      console.log(err)
    }
  })
}

readIGC()
