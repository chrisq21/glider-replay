import mapboxgl from '!mapbox-gl' // eslint-disable-line import/no-webpack-loader-syntax
import {getBearing} from './helpers'

const nearLimit = -0.002
const farLimit = 0.15
const distanceIncrement = 0.0002
const orbitIncrement = 0.02

export function updateOrbit(keyPressed, cameraOffsets) {
  switch (keyPressed) {
    case 'ArrowRight':
      cameraOffsets.orbit += orbitIncrement
      break
    case 'ArrowLeft':
      cameraOffsets.orbit -= orbitIncrement
      break
    case 'ArrowUp':
      {
        if (cameraOffsets.distance >= nearLimit) {
          cameraOffsets.distance -= distanceIncrement
        }
      }
      break
    case 'ArrowDown':
      {
        if (cameraOffsets.distance < farLimit) {
          cameraOffsets.distance += distanceIncrement
        }
      }
      break
  }
}

export function updateCameraPosition(map, camera, model, cameraSettings, cameraOffsets) {
  const {altitude, distance, pitch} = cameraSettings
  const modelCoordinates = model.coordinates
  const totalDistance = distance + cameraOffsets.distance
  const xOff = Math.cos(cameraOffsets.orbit) * totalDistance
  const yOff = Math.sin(cameraOffsets.orbit) * totalDistance

  const cameraCoordinates = [modelCoordinates[0] + xOff, modelCoordinates[1] + yOff] as Point

  // Calculate bearing to look at model
  const newBearing = getBearing(cameraCoordinates, model.coordinates)

  // Calculate position
  camera.position = mapboxgl.MercatorCoordinate.fromLngLat(cameraCoordinates, modelCoordinates[2] + altitude)

  camera.setPitchBearing(pitch, newBearing)
  map.setFreeCameraOptions(camera)
}
