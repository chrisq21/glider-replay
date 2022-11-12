import mapboxgl from 'mapbox-gl'
import {Ref} from 'react'
import {Threebox} from '@chrisq21/threebox-plugin-fork'

let initialMapConfig = {
  // TODO: retrieve center from first igc value
  zoom: 13,
  pitch: 85,
  style: 'mapbox://styles/mapbox/satellite-v9',
  timezone: 'America/New_York', // is this needed?
  interactive: false,
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

  map.addLayer({
    id: 'sky',
    type: 'sky',
    paint: {
      'sky-type': 'atmosphere',
      'sky-atmosphere-sun': [0.0, 0.0],
      'sky-atmosphere-sun-intensity': 15,
    },
  })
}

export function toggleInteractive(map, isInteractive) {
  window.isInteractive = isInteractive
  const type = isInteractive ? 'enable' : 'disable'
  map.boxZoom[type]()
  map.scrollZoom[type]()
  map.dragPan[type]()
  map.dragRotate[type]()
  map.keyboard[type]()
  map.doubleClickZoom[type]()
  map.touchZoomRotate[type]()
}
