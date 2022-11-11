import mapboxgl from '!mapbox-gl' // eslint-disable-line import/no-webpack-loader-syntax
import {Ref} from 'react'
import {Threebox} from 'threebox-plugin'

let initialMapConfig = {
  // TODO: retrieve center from first igc value
  zoom: 13,
  pitch: 85,
  style: 'mapbox://styles/mapbox/satellite-v9',
  timezone: 'America/New_York', // is this needed?
  interactive: true,
}

export function initMap(containerRef: Ref<HTMLDivElement>, center: Point = [86.925, 27.9881]) {
  const map = new mapboxgl.Map({
    ...initialMapConfig,
    container: containerRef,
    center,
  })

  map.on('style.load', () => {
    configureMapStyles(map)
  })

  // init threebox and add to window
  window.tb = new Threebox(map, map.getCanvas().getContext('webgl'), {
    defaultLights: true,
    terrain: true,
    enableTooltips: false,
  })

  return map
}

// 3d terrain and sky
function configureMapStyles(map) {
  if (!map) return
  // 3d terrain
  map.addSource('mapbox-dem', {
    type: 'raster-dem',
    url: 'mapbox://mapbox.terrain-rgb',
    tileSize: 512,
    maxzoom: 14,
  })
  map.setTerrain({source: 'mapbox-dem', exaggeration: 1})

  // add sky styling with `setFog` that will show when the map is highly pitched
  map.setFog({
    'horizon-blend': 0.3,
    color: '#f8f0e3',
    'high-color': '#add8e6',
    'space-color': '#d8f2ff',
    'star-intensity': 0.0,
  })
}
