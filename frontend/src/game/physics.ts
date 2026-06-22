import type { CoreState, Entity, ShieldState } from './state'

const TAU = Math.PI * 2

export function distanceSquared(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx
  const dy = ay - by
  return dx * dx + dy * dy
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function normalizeAngle(angle: number): number {
  let normalized = angle % TAU
  if (normalized < -Math.PI) normalized += TAU
  if (normalized > Math.PI) normalized -= TAU
  return normalized
}

export function angleDistance(a: number, b: number): number {
  return Math.abs(normalizeAngle(a - b))
}

export function intersectsCore(entity: Entity, core: CoreState): boolean {
  const radius = entity.radius + core.radius
  return distanceSquared(entity.x, entity.y, core.x, core.y) <= radius * radius
}

export function intersectsShield(entity: Entity, core: CoreState, shield: ShieldState): boolean {
  const dx = entity.x - core.x
  const dy = entity.y - core.y
  const distance = Math.hypot(dx, dy)
  const band = shield.thickness * 0.8 + entity.radius
  const inRing = Math.abs(distance - shield.radius) <= band
  const entityAngle = Math.atan2(dy, dx)
  return inRing && angleDistance(entityAngle, shield.angle) <= shield.arc / 2
}

export function reflectFromCore(entity: Entity, core: CoreState, shield: ShieldState): void {
  const dx = entity.x - core.x
  const dy = entity.y - core.y
  const distance = Math.max(0.001, Math.hypot(dx, dy))
  const nx = dx / distance
  const ny = dy / distance
  const dot = entity.vx * nx + entity.vy * ny
  const flickBoost = clamp(Math.abs(shield.angularVelocity) * 0.08, 0, 560)
  const speedBoost = 1.16 + Math.min(0.42, Math.abs(shield.angularVelocity) * 0.0009)
  entity.vx = (entity.vx - 2 * dot * nx) * speedBoost + nx * (280 + flickBoost)
  entity.vy = (entity.vy - 2 * dot * ny) * speedBoost + ny * (280 + flickBoost)
}

export function isOutsideBounds(entity: Entity, width: number, height: number): boolean {
  const margin = 140
  return (
    entity.x < -margin ||
    entity.x > width + margin ||
    entity.y < -margin ||
    entity.y > height + margin
  )
}
