import {useEffect, useRef, useState} from 'react'
import mapboxgl from '!mapbox-gl' // eslint-disable-line import/no-webpack-loader-syntax
import 'mapbox-gl/dist/mapbox-gl.css'
import styles from './map.module.css'
import {initMap} from './utils'
import igcArray from '../../data/namibia'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

export default function Map() {
  const mapContainer = useRef(null)
  const map = useRef(null)

  const [lng, setLng] = useState()
  const [lat, setLat] = useState()
  const [zoom, setZoom] = useState()

  // Initial map setup
  useEffect(() => {
    if (map.current) return // initialize map only once
    if (!mapContainer?.current) return

    map.current = initMap(mapContainer.current)

    // listen for map changes and update UI
    if (map.current) {
      const updateUI = () => {
        setLng(map.current.getCenter().lng.toFixed(4))
        setLat(map.current.getCenter().lat.toFixed(4))
        setZoom(map.current.getZoom().toFixed(2))
      }

      map.current.on('move', updateUI)

      map.current.on('load', () => {
        updateUI()
        // add igc track
        // add 3d model
        // start animation
      })
    }
  }, [])

  return (
    <div className={styles.container}>
      <noscript>You need to enable JavaScript to run this app.</noscript>
      <div className={styles.sidebar}>
        {/* TODO need to grab values from state */}
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer} className={styles.mapContainer} />
    </div>
  )
}
