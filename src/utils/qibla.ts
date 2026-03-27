const KAABA_LAT = 21.4225
const KAABA_LNG = 39.8262

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180
}

function toDegrees(rad: number): number {
  return (rad * 180) / Math.PI
}

export function calculateQiblaBearing(lat: number, lng: number): number {
  const phiK = toRadians(KAABA_LAT)
  const lambdaK = toRadians(KAABA_LNG)
  const phi = toRadians(lat)
  const lambda = toRadians(lng)

  const y = Math.sin(lambdaK - lambda)
  const x =
    Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda)

  const bearing = toDegrees(Math.atan2(y, x))
  return (bearing + 360) % 360
}

export function getQiblaMapsUrl(): string {
  return 'https://www.google.com/maps/dir/?api=1&destination=21.4225,39.8262'
}
