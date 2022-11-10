import {useEffect, useRef} from 'react'
import mapboxgl from '!mapbox-gl' // eslint-disable-line import/no-webpack-loader-syntax
import 'mapbox-gl/dist/mapbox-gl.css'
import styles from './map.module.css'

// TODO move to env file
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

export default function Map() {
  const mapContainer = useRef(null)
  const map = useRef(null)

  // map settings
  const lng = -70.9
  const lat = 42.35
  const zoom = 9

  useEffect(() => {
    if (map.current) return // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom,
    })
  }, [])

  return (
    <div className={styles.container}>
      <noscript>You need to enable JavaScript to run this app.</noscript>
      <div className={styles.sidebar}>
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer} className={styles.mapContainer} />
    </div>
  )
}
