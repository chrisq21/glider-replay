import Head from 'next/head'
import Script from 'next/script'
import styles from './cmap.module.css'

function CMap() {
  // const initMap = () => {
  //   window.Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ACCESS_TOKEN
  //   console.log('did it yay', window.Cesium)
  // }
  const initMap = () => {
    window.Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ACCESS_TOKEN

    if (!window.Cesium) return

    // Initialize the Cesium Viewer in the HTML element with the "cesiumContainer" ID.
    const viewer = new Cesium.Viewer('cesiumContainer', {
      terrainProvider: Cesium.createWorldTerrain(),
    })
    // Add Cesium OSM Buildings, a global 3D buildings layer.
    const buildingTileset = viewer.scene.primitives.add(Cesium.createOsmBuildings())
    // Fly the camera to San Francisco at the given longitude, latitude, and height.
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(-122.4175, 37.655, 400),
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-15.0),
      },
    })
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
