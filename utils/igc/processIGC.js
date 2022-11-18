var igcToJson = require('./igcToJson.js').default
var fs = require('fs'),
  path = require('path'),
  filePath = path.join(__dirname, '../../data/igcExamples/skyline.igc')

function readIGC() {
  fs.readFile(filePath, {encoding: 'utf-8'}, function (err, data) {
    if (!err) {
      console.log('received data')

      const igcData = igcToJson(data)
      const count = igcData.gpsAltitude.length - 10

      const startTime = new Date(igcData.recordTime[0]).getTime()
      const endTime = new Date(igcData.recordTime[igcData.recordTime.length - 1]).getTime()
      const totalTime = Math.abs(endTime - startTime)

      console.log('total time', totalTime)

      const coordinates = []

      for (let i = 0; i < count; i++) {
        coordinates.push([igcData.latLong[i][1], igcData.latLong[i][0], igcData.gpsAltitude[i]])
      }

      console.log('count', count)

      let jsonStr = JSON.stringify({coordinates, totalTime})
      console.log('write to data')
      fs.writeFileSync('igc-data-sample.json', jsonStr)
    } else {
      console.log(err)
    }
  })
}

readIGC()
