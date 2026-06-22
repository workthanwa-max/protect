import type { Entity, EntityKind, FloatingText, GameState, Particle } from './state'

function nextInactive<T extends { active: boolean }>(pool: T[], factory: () => T): T {
  const item = pool.find((candidate) => !candidate.active)
  if (item) return item
  const created = factory()
  pool.push(created)
  return created
}

export function spawnEntity(
  state: GameState,
  kind: EntityKind,
  x: number,
  y: number,
  vx: number,
  vy: number,
  radius: number,
): Entity {
  const entity = nextInactive<Entity>(state.entities, () => ({
    active: false,
    kind: 'toxin',
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 0,
    value: 0,
    age: 0,
    hue: 0,
    icon: 0,
    reacted: false,
  }))
  entity.active = true
  entity.kind = kind
  entity.x = x
  entity.y = y
  entity.vx = vx
  entity.vy = vy
  entity.radius = radius
  entity.value = kind === 'toxin' ? 10 : 14
  entity.age = 0
  entity.hue = kind === 'toxin' ? 318 + Math.random() * 30 : 148 + Math.random() * 34
  entity.icon = Math.floor(Math.random() * 3)
  entity.reacted = false
  return entity
}

export function spawnParticles(
  state: GameState,
  x: number,
  y: number,
  color: string,
  count: number,
  power: number,
): void {
  for (let index = 0; index < count; index += 1) {
    const particle = nextInactive<Particle>(state.particles, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 0,
      life: 0,
      maxLife: 0,
      color: '',
    }))
    const angle = Math.random() * Math.PI * 2
    const speed = power * (0.35 + Math.random() * 0.85)
    particle.active = true
    particle.x = x
    particle.y = y
    particle.vx = Math.cos(angle) * speed
    particle.vy = Math.sin(angle) * speed
    particle.radius = 1.6 + Math.random() * 3.8
    particle.life = 0.24 + Math.random() * 0.44
    particle.maxLife = particle.life
    particle.color = color
  }
}

export function spawnText(
  state: GameState,
  x: number,
  y: number,
  text: string,
  color: string,
): void {
  const floatingText = nextInactive<FloatingText>(state.texts, () => ({
    active: false,
    x: 0,
    y: 0,
    vy: 0,
    life: 0,
    maxLife: 0,
    text: '',
    color: '',
  }))
  floatingText.active = true
  floatingText.x = x
  floatingText.y = y
  floatingText.vy = -42
  floatingText.life = 0.9
  floatingText.maxLife = 0.9
  floatingText.text = text
  floatingText.color = color
}
