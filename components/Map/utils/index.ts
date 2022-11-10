import mapboxgl from '!mapbox-gl' // eslint-disable-line import/no-webpack-loader-syntax
import {Ref} from 'react'

let initialMapConfig = {
  // TODO: retrieve center from first igc value
  center: [-70.9, 42.35],
  zoom: 9,
  style: 'mapbox://styles/mapbox/satellite-v9',
  timezone: 'America/New_York', // is this needed?
  interactive: true,
}

export function getMapConfig(containerRef: Ref<HTMLDivElement>) {
  let map = new mapboxgl.Map({
    container: containerRef,
    ...initialMapConfig,
  })

  return map
}
