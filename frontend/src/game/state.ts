import type { HandCoord } from '../vision'

export type GamePhase = 'ready' | 'running' | 'gameover'

export type EntityKind = 'toxin' | 'nutrient'

export type ControlMode = 'mouse' | 'body'

export type Entity = {
  active: boolean
  kind: EntityKind
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  value: number
  age: number
  hue: number
  icon: number
  reacted: boolean
}

export type Particle = {
  active: boolean
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  life: number
  maxLife: number
  color: string
}

export type FloatingText = {
  active: boolean
  x: number
  y: number
  vy: number
  life: number
  maxLife: number
  text: string
  color: string
}

export type InputState = {
  x: number
  y: number
  targetX: number
  targetY: number
  pointerActive: boolean
  activeHand?: HandCoord
  activeHandSide?: 'L' | 'R'
}

export type ShieldState = {
  angle: number
  previousAngle: number
  angularVelocity: number
  radius: number
  arc: number
  thickness: number
}

export type CoreState = {
  x: number
  y: number
  radius: number
  health: number
  maxHealth: number
}


export type GameSnapshot = {
  phase: 'ready' | 'running' | 'gameover'
  score: number
  health: number
  maxHealth: number
  combo: number
  playtime: number
  deflects: number
  nutrients: number
  handLeft?: HandCoord
  handRight?: HandCoord
}

export type GameState = {
  phase: GamePhase
  width: number
  height: number
  dpr: number
  elapsed: number
  spawnTimer: number
  nutrientTimer: number
  difficulty: number
  score: number
  combo: number
  deflects: number
  nutrients: number
  shake: number
  flash: number
  ecoMode: boolean
  input: InputState
  core: CoreState
  shield: ShieldState
  entities: Entity[]
  particles: Particle[]
  texts: FloatingText[]
}

export const SCORE_THRESHOLDS = {
  TIER_2: 1200,
  TIER_3: 2500,
  TIER_4: 4500,
}

export function createGameState(controlMode: ControlMode = 'mouse'): GameState {
  return {
    phase: 'ready',
    width: 960,
    height: 640,
    dpr: 1,
    elapsed: 0,
    spawnTimer: 0,
    nutrientTimer: 1.8,
    difficulty: 1,
    score: 0,
    combo: 0,
    deflects: 0,
    nutrients: 0,
    shake: 0,
    flash: 0,
    ecoMode: false,
    input: {
      x: 480,
      y: 320,
      targetX: 480,
      targetY: 320,
      pointerActive: false,
    },
    core: {
      x: 480,
      y: 320,
      radius: 42,
      health: 100,
      maxHealth: 100,
    },
    shield: {
      angle: -Math.PI / 2,
      previousAngle: -Math.PI / 2,
      angularVelocity: 0,
      radius: 108,
      arc: controlMode === 'body' ? (Math.PI * 2) / 3 : Math.PI / 2,
      thickness: 18,
    },
    entities: [],
    particles: [],
    texts: [],
  }
}

export function resetGameState(state: GameState, controlMode: ControlMode = 'mouse'): void {
  const width = state.width
  const height = state.height
  const dpr = state.dpr
  const entities = state.entities
  const particles = state.particles
  const texts = state.texts
  Object.assign(state, createGameState(controlMode))
  state.width = width
  state.height = height
  state.dpr = dpr
  state.entities = entities
  state.particles = particles
  state.texts = texts
  state.entities.forEach((entity) => {
    entity.active = false
    entity.reacted = false
  })
  state.particles.forEach((particle) => {
    particle.active = false
  })
  state.texts.forEach((text) => {
    text.active = false
  })
  resizeGameState(state, width, height, dpr)
  state.phase = 'running'
}

export function resizeGameState(
  state: GameState,
  width: number,
  height: number,
  dpr: number,
): void {
  state.width = width
  state.height = height
  state.dpr = dpr
  state.core.x = width / 2
  state.core.y = height / 2
  state.core.radius = Math.max(34, Math.min(width, height) * 0.065)
  state.shield.radius = state.core.radius + Math.max(62, Math.min(width, height) * 0.11)
  state.shield.thickness = Math.max(14, Math.min(width, height) * 0.024)
  state.input.targetX = state.input.pointerActive ? state.input.targetX : state.core.x
  state.input.targetY = state.input.pointerActive ? state.input.targetY : state.core.y - state.shield.radius
  state.input.x = state.input.targetX
  state.input.y = state.input.targetY
}

export function toSnapshot(state: GameState): GameSnapshot {
  return {
    phase: state.phase,
    score: Math.floor(state.score),
    health: Math.max(0, Math.ceil(state.core.health)),
    maxHealth: state.core.maxHealth,
    combo: state.combo,
    playtime: state.elapsed,
    deflects: state.deflects,
    nutrients: state.nutrients,
  }
}
