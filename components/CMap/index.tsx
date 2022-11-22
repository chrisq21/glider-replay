import Head from 'next/head'
import Script from 'next/script'
import styles from './cmap.module.css'

function CMap({igcData}) {
  const initMap = async () => {
    const {coordinates, totalTime} = igcData
    const totalSeconds = totalTime / 1000
    // TODO null check and catch errors
    Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ACCESS_TOKEN

    const viewer = new Cesium.Viewer('cesiumContainer', {
      terrainProvider: Cesium.createWorldTerrain(),
    })
    // Specify our point of interest.
    const pointOfInterest = Cesium.Cartographic.fromDegrees(coordinates[0][0], coordinates[0][1])
    const initialGroundHeight = await getGroundHeight(viewer, pointOfInterest)
    const flightInitialHeight = coordinates[0][2]
    const groundDiff = flightInitialHeight - initialGroundHeight

    const flightData = coordinates.map((coordinate) => {
      let height = coordinate[2] - groundDiff
      const halfGliderHeight = 1 // TODO add half the height of the model
      // don't let the glider go below the ground
      if (height <= initialGroundHeight + halfGliderHeight) {
        height = initialGroundHeight + halfGliderHeight
      }
      return {longitude: coordinate[0], latitude: coordinate[1], height}
    })

    animate(viewer, flightData, totalSeconds)
  }

  const animate = (viewer, flightData, totalSeconds) => {
    const timeStep = totalSeconds / flightData.length

    // TODO get time from IGC data
    const start = Cesium.JulianDate.fromIso8601('2020-03-09T23:10:00Z')
    const stop = Cesium.JulianDate.addSeconds(start, totalSeconds, new Cesium.JulianDate())
    viewer.clock.startTime = start.clone()
    viewer.clock.stopTime = stop.clone()
    viewer.clock.currentTime = start.clone()
    viewer.timeline.zoomTo(start, stop)
    // Speed up the playback speed 3x.
    viewer.clock.multiplier = 3
    // Start playing the scene.
    viewer.clock.shouldAnimate = true
    const positionProperty = new Cesium.SampledPositionProperty()

    for (let i = 0; i < flightData.length; i++) {
      const dataPoint = flightData[i]
      const time = Cesium.JulianDate.addSeconds(start, i * timeStep, new Cesium.JulianDate())
      const position = Cesium.Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height)
      positionProperty.addSample(time, position)
    }

    const airplaneEntity = viewer.entities.add({
      availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({start: start, stop: stop})]),
      position: positionProperty,
      point: {pixelSize: 30, color: Cesium.Color.GREEN},
      path: new Cesium.PathGraphics({width: 3}),
    })
    // Make the camera track this moving entity.
    viewer.trackedEntity = airplaneEntity
  }

  const getGroundHeight = async (viewer, position) => {
    const samples = await Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, [position])
    return samples[0].height
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
