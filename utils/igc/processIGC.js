var igcToJson = require('./igcToJson.js').default
var fs = require('fs'),
  path = require('path'),
  filePath = path.join(__dirname, '../../data/igcExamples/alps.igc')

function readIGC() {
  fs.readFile(filePath, {encoding: 'utf-8'}, function (err, data) {
    if (!err) {
      const igcData = igcToJson(data)
      // console.log(igcData)
      console.log("done")
      const jsonStr = JSON.stringify(igcData)
      fs.writeFileSync('igc-data-sample.json', jsonStr)
    } else {
      console.log(err)
    }
  })
}

readIGC()
