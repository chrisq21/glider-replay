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

    const igcStart = igcArray[0]
    const center = [igcStart[0], igcStart[1]] as Point
    map.current = initMap(mapContainer.current, center)

    // listen for map changes and update UI
    if (map.current) {
      const updateUI = () => {
        setLng(map.current.getCenter().lng.toFixed(4))
        setLat(map.current.getCenter().lat.toFixed(4))
        setZoom(map.current.getZoom().toFixed(2))
      }

      // add flight line
      const addFlightLine = () => {
        if (!window.tb || !map.current) return

        map.current.addLayer({
          id: 'flight-line-layer',
          type: 'custom',
          renderingMode: '3d',
          onAdd: function () {
            const path = igcArray
            const line = window.tb.line({
              geometry: path,
              width: 1,
              color: 'steelblue',
            })

            tb.add(line, 'flight-line') // move layer name to const file
          },

          render: function () {
            window.tb.update()
          },
        })
      }

      map.current.on('load', () => {
        console.log('load')
        addFlightLine()
        // add 3d model
        // start animation
      })
    }
  }, [])

  return (
    <div className={styles.container}>
      <noscript>You need to enable JavaScript to run this app.</noscript>
      <div className={styles.sidebar}>Values here</div>
      <div ref={mapContainer} className={styles.mapContainer} />
    </div>
  )
}
