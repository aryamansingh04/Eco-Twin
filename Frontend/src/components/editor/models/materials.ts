// Shared color palette for machine subcomponents. Kept as plain hex strings
// (not THREE.Material instances) so each model just references them in JSX
// — React Three Fiber handles material creation/reuse per mesh, which is
// plenty efficient for the dozens (not thousands) of machines this app
// renders at once.
export const MAT = {
  steel: '#7C868C',
  steelDark: '#5A6268',
  housing: '#8B979C',
  housingLight: '#A7B0B4',
  frameDark: '#3A4145',
  accentGreen: '#3E7C59',
  accentAmber: '#C97A3D',
  accentBlue: '#5B7A8C',
  rubber: '#2A2E30',
  glass: '#BFD4DC',
  screen: '#2C3E44',
  screenGlow: '#4FD1A5',
  yellow: '#D9A441',
  chrome: '#C9CFD2',
}

export const STATUS_ACCENT: Record<string, string> = {
  running: '#3E7C59',
  idle: '#5B7A8C',
  fault: '#B4483C',
  offline: '#8B979C',
}
