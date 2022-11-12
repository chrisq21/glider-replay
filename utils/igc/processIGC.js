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

      const animationsArray = []

      for (let i = 0; i < count; i++) {
        animationsArray.push([igcData.latLong[i][1], igcData.latLong[i][0], igcData.gpsAltitude[i]])
      }

      console.log('count', count)

      // igcToJson(data)
      // console.log()
      let jsonStr = JSON.stringify({sample: animationsArray})
      console.log('write to data')
      fs.writeFileSync('igc-data-sample.json', jsonStr)
    } else {
      console.log(err)
    }
  })
}

readIGC()
