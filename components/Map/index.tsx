import {useEffect, useRef, useState} from 'react'
import mapboxgl from '!mapbox-gl' // eslint-disable-line import/no-webpack-loader-syntax
import 'mapbox-gl/dist/mapbox-gl.css'
import styles from './map.module.css'
import {initMap} from './utils'
import igcArray from '../../data/namibia'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

// Global vars
let flightLine
let gliderModel

export default function Map() {
  const mapContainer = useRef(null)
  const map = useRef(null)

  const [shouldFly, setShouldFly] = useState(false)

  // Initial map setup
  useEffect(() => {
    if (map.current) return // initialize map only once
    if (!mapContainer?.current) return

    const igcStart = igcArray[0]
    const center = [igcStart[0], igcStart[1]] as Point
    map.current = initMap(mapContainer.current, center)
  }, [])

  useEffect(() => {
    /* Animation settings */
    const duration = 15000000
    const path = igcArray // TODO smooth out array

    const addGliderLayer = () => {
      if (!map.current) return

      /* Listen for glider updates */
      const onGliderChanged = (e) => {
        // console.log(e.detail.object)
      }

      /* Add glider and flightline */
      map.current.addLayer({
        id: 'glider-layer',
        type: 'custom',
        renderingMode: '3d',
        onAdd: function () {
          /* glider object settings */
          let options = {
            obj: './plane.glb',
            type: 'gltf',
            scale: 0.5,
            rotation: {x: 90, y: 0, z: 0},
            anchor: 'center',
            bbox: false,
          }

          /* load glider */
          window.tb.loadObj(options, function (model) {
            gliderModel = model.setCoords([path[0][0], path[0][1]])
            gliderModel.setRotation({x: 0, y: 0, z: 135})
            gliderModel.addEventListener('ObjectChanged', onGliderChanged, false)
            window.tb.add(gliderModel)

            /* fly glider */
            gliderModel.followPath({path, duration, trackHeading: false})
          })

          /* add flight line */
          flightLine = window.tb.line({
            geometry: igcArray,
            width: 1,
            color: 'steelblue',
          })
          window.tb.add(flightLine, 'flight-line')
        },

        render: function () {
          window.tb.update()
        },
      })
    }

    if (shouldFly) {
      if (!map.current) return

      if (map.current.loaded()) {
        addGliderLayer()
      } else {
        map.current.on('load', () => {
          addGliderLayer()
        })
      }
    }
  }, [shouldFly])

  return (
    <div className={styles.container}>
      <noscript>You need to enable JavaScript to run this app.</noscript>
      <div className={styles.sidebar}>
        <p>Controls</p>
        <button
          onClick={() => {
            setShouldFly(true)
          }}
        >
          Start flying
        </button>
      </div>
      <div ref={mapContainer} className={styles.mapContainer} />
    </div>
  )
}
