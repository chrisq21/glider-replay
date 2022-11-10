import {useEffect, useRef} from 'react'
import mapboxgl from '!mapbox-gl' // eslint-disable-line import/no-webpack-loader-syntax
import 'mapbox-gl/dist/mapbox-gl.css'
import styles from './map.module.css'
import {getMapConfig} from './utils'

// TODO move to env file
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

export default function Map() {
  const mapContainer = useRef(null)
  const map = useRef(null)

  // Initial map setup
  useEffect(() => {
    if (map.current) return // initialize map only once
    if (!mapContainer?.current) return

    map.current = getMapConfig(mapContainer.current)
  }, [])

  return (
    <div className={styles.container}>
      <noscript>You need to enable JavaScript to run this app.</noscript>
      <div className={styles.sidebar}>
        {/* TODO need to grab values from state */}
        Longitude: {map?.current?.getCenter().lng} | Latitude: {map?.current?.getCenter().lat} | Zoom: {map?.current?.getZoom()}
      </div>
      <div ref={mapContainer} className={styles.mapContainer} />
    </div>
  )
}
