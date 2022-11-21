import Head from 'next/head'
import Script from 'next/script'
import styles from './cmap.module.css'

function CMap({igcData}) {
  const initMap = () => {
    const {coordinates, totalTime} = igcData
    // TODO null check and catch errors
    Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ACCESS_TOKEN

    const viewer = new Cesium.Viewer('cesiumContainer', {
      terrainProvider: Cesium.createWorldTerrain(),
    })

    const condenseCoordinates = coordinates.map((coordinate, index) => (index % 3 === 0 ? coordinate : null)).filter((item) => !!item)
    const flightData = coordinates.map((coordinate) => {
      return {longitude: coordinate[0], latitude: coordinate[1], height: coordinate[2]}
    })

    /* Initialize the viewer clock:
  Assume the radar samples are 30 seconds apart, and calculate the entire flight duration based on that assumption.
  Get the start and stop date times of the flight, where the start is the known flight departure time (converted from PST 
    to UTC) and the stop is the start plus the calculated duration. (Note that Cesium uses Julian dates. See 
    https://simple.wikipedia.org/wiki/Julian_day.)
  Initialize the viewer's clock by setting its start and stop to the flight start and stop times we just calculated. 
  Also, set the viewer's current time to the start time and take the user to that time. 
*/
    const timeStepInSeconds = 30
    const totalSeconds = timeStepInSeconds * (flightData.length - 1)
    const start = Cesium.JulianDate.fromIso8601('2020-03-09T23:10:00Z')
    const stop = Cesium.JulianDate.addSeconds(start, totalSeconds, new Cesium.JulianDate())
    viewer.clock.startTime = start.clone()
    viewer.clock.stopTime = stop.clone()
    viewer.clock.currentTime = start.clone()
    viewer.timeline.zoomTo(start, stop)
    // Speed up the playback speed 50x.
    viewer.clock.multiplier = 50
    // Start playing the scene.
    viewer.clock.shouldAnimate = true

    // The SampledPositionedProperty stores the position and timestamp for each sample along the radar sample series.
    const positionProperty = new Cesium.SampledPositionProperty()

    for (let i = 0; i < flightData.length; i++) {
      const dataPoint = flightData[i]

      // Declare the time for this individual sample and store it in a new JulianDate instance.
      const time = Cesium.JulianDate.addSeconds(start, i * timeStepInSeconds, new Cesium.JulianDate())
      const position = Cesium.Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height)
      // Store the position along with its timestamp.
      // Here we add the positions all upfront, but these can be added at run-time as samples are received from a server.
      positionProperty.addSample(time, position)
    }

    // STEP 4 CODE (green circle entity)
    // Create an entity to both visualize the entire radar sample series with a line and add a point that moves along the samples.
    const airplaneEntity = viewer.entities.add({
      availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({start: start, stop: stop})]),
      position: positionProperty,
      point: {pixelSize: 30, color: Cesium.Color.GREEN},
      path: new Cesium.PathGraphics({width: 3}),
    })
    // Make the camera track this moving entity.
    viewer.trackedEntity = airplaneEntity
  }

  return (
    <div className={styles.container}>
      <Head>
        <link href="https://cesium.com/downloads/cesiumjs/releases/1.99/Build/Cesium/Widgets/widgets.css" rel="stylesheet" />
      </Head>
      <Script onReady={initMap} src="https://cesium.com/downloads/cesiumjs/releases/1.99/Build/Cesium/Cesium.js" />

      <div id="cesiumContainer" className={styles.mapContainer}></div>
    </div>
  )
}

export default CMap
