import {useEffect, useRef, useState} from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'
import styles from './map.module.css'
import {initMap, toggleInteractive} from './utils/mapConfig'
import {updateCameraPosition, updateOrbit} from './utils/cameraConfig'
import {getFlyDuration} from './utils/helpers'

// Global vars
let flightLine
let gliderModel
let isInteractive = false

// camera controls
let keyPressed: string | null = null
let cameraOffsets = {
  orbit: 0,
  distance: 0,
  pitch: 79.5,
  altitude: 133,
}

export default function Map({igcData}) {
  const mapContainer = useRef(null)
  const map = useRef(null)

  const [shouldFly, setShouldFly] = useState(false)

  /* Listen for glider updates */
  const onGliderChanged = (e) => {
    if (isInteractive) return
    if (!map.current) return

    const camera = map.current.getFreeCameraOptions()
    const model = e.detail.object
    const cameraSettings = {
      altitude: 300,
      pitch: 79.5,
      distance: 0.02,
    }
    updateOrbit(keyPressed, cameraOffsets)
    updateCameraPosition(map.current, camera, model, cameraSettings, cameraOffsets, isInteractive)
  }

  // Initial map setup
  useEffect(() => {
    if (map.current) return // initialize map only once
    if (!mapContainer?.current) return

    const igcStart = igcData.coordinates[0]
    const center = [igcStart[0], igcStart[1]] as Point
    map.current = initMap(mapContainer.current, center)
  }, [])

  useEffect(() => {
    /* Animation settings */

    const path = igcData.coordinates // TODO smooth out array
    const duration = getFlyDuration(igcData.totalTime)

    const addGliderLayer = () => {
      if (!map.current) return

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

            /* Add camera controls listener */
            document.addEventListener('keydown', function (event) {
              keyPressed = event.key
            })
            document.addEventListener('keyup', function () {
              keyPressed = null
            })

            gliderModel.addEventListener('ObjectChanged', onGliderChanged, false)
            window.tb.add(gliderModel)

            /* fly glider */
            gliderModel.followPath({path, duration, trackHeading: true})
          })

          /* add flight line */
          flightLine = window.tb.line({
            geometry: igcData.coordinates,
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
            isInteractive = false
          }}
        >
          Start flying
        </button>
        <button
          onClick={() => {
            if (!map.current) return
            isInteractive = !isInteractive
            toggleInteractive(map.current, isInteractive)
          }}
        >
          Toggle (follow | free roam)
        </button>
      </div>
      <div ref={mapContainer} className={styles.mapContainer} />
    </div>
  )
}
