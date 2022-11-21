if (typeof window !== 'undefined') window.CESIUM_BASE_URL = '/'

import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import {useEffect} from 'react'
import styles from './cmap.module.css'

Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

function CMap() {
  useEffect(() => {
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
  }, [])

  return (
    <div className={styles.container}>
      <div id="cesiumContainer" className={styles.mapContainer}></div>
    </div>
  )
}

export default CMap
