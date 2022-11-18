// Converts from degrees to radians.
export function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180
}

// Converts from radians to degrees.
export function toDegrees(radians: number) {
  return (radians * 180) / Math.PI
}

export function getNewBearing(startLat: number, startLng: number, destLat: number, destLng: number) {
  startLat = toRadians(startLat)
  startLng = toRadians(startLng)
  destLat = toRadians(destLat)
  destLng = toRadians(destLng)

  let y = Math.sin(destLng - startLng) * Math.cos(destLat)
  let x = Math.cos(startLat) * Math.sin(destLat) - Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng)
  let brng = Math.atan2(y, x)
  brng = toDegrees(brng)
  return (brng + 360) % 360
}

export const getBearing = (start: Point, end: Point) => {
  const long2 = end[0]
  const lat2 = end[1]
  const long1 = start[0]
  const lat1 = start[1]
  return getNewBearing(lat1, long1, lat2, long2)
}

export const getFlyDuration = (totalTime) => {
  const scalar = 1
  return totalTime / scalar
}
