import {useEffect, useRef, useState} from 'react'
import mapboxgl from '!mapbox-gl' // eslint-disable-line import/no-webpack-loader-syntax
import 'mapbox-gl/dist/mapbox-gl.css'
import styles from './map.module.css'
import {addFlightLineLayer, addGliderModel, initMap} from './utils'
import igcArray from '../../data/namibia'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

export default function Map() {
  const mapContainer = useRef(null)
  const map = useRef(null)

  // Initial map setup
  useEffect(() => {
    if (map.current) return // initialize map only once
    if (!mapContainer?.current) return

    const igcStart = igcArray[0]
    const center = [igcStart[0], igcStart[1]] as Point
    map.current = initMap(mapContainer.current, center)

    if (map.current) {
      map.current.on('load', () => {
        console.log('load')
        addFlightLineLayer(map, igcArray as ThreeDPoint[])
        addGliderModel(map, igcArray as ThreeDPoint[])
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
