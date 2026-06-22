import type { GameState } from './state'

function drawBackground(ctx: CanvasRenderingContext2D, state: GameState): void {
  const gradient = ctx.createRadialGradient(
    state.core.x,
    state.core.y,
    20,
    state.core.x,
    state.core.y,
    Math.max(state.width, state.height) * 0.68,
  )
  gradient.addColorStop(0, '#1e293b')
  gradient.addColorStop(0.48, '#0f172a')
  gradient.addColorStop(1, '#020617')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, state.width, state.height)

  ctx.save()
  ctx.globalAlpha = 0.45
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1
  const gap = 48
  for (let x = (state.elapsed * 8) % gap; x < state.width; x += gap) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x - state.height * 0.28, state.height)
    ctx.stroke()
  }
  ctx.restore()
}

function drawCore(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { core } = state
  const pulse = 1 + Math.sin(state.elapsed * 5.4) * 0.035
  const healthRatio = Math.max(0, core.health / core.maxHealth)

  ctx.save()
  ctx.shadowBlur = 34
  ctx.shadowColor = `rgba(56, 189, 248, ${0.4 + healthRatio * 0.5})`
  ctx.fillStyle = '#1e293b'
  ctx.beginPath()
  ctx.arc(core.x, core.y, core.radius * pulse, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#f472b6'
  ctx.strokeStyle = `rgba(56, 189, 248, ${0.6 + healthRatio * 0.4})`
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(core.x, core.y - core.radius * 0.62)
  ctx.bezierCurveTo(
    core.x - core.radius * 0.72,
    core.y - core.radius * 0.74,
    core.x - core.radius * 0.9,
    core.y + core.radius * 0.2,
    core.x - core.radius * 0.28,
    core.y + core.radius * 0.58,
  )
  ctx.bezierCurveTo(
    core.x,
    core.y + core.radius * 0.82,
    core.x + core.radius * 0.72,
    core.y + core.radius * 0.54,
    core.x + core.radius * 0.74,
    core.y - core.radius * 0.08,
  )
  ctx.bezierCurveTo(
    core.x + core.radius * 0.86,
    core.y - core.radius * 0.7,
    core.x + core.radius * 0.18,
    core.y - core.radius * 0.78,
    core.x,
    core.y - core.radius * 0.62,
  )
  ctx.fill()
  ctx.stroke()

  ctx.globalAlpha = 0.68
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(core.x, core.y - core.radius * 0.54)
  ctx.lineTo(core.x, core.y + core.radius * 0.5)
  ctx.moveTo(core.x - core.radius * 0.46, core.y - core.radius * 0.18)
  ctx.quadraticCurveTo(core.x - core.radius * 0.2, core.y - core.radius * 0.04, core.x, core.y - core.radius * 0.12)
  ctx.moveTo(core.x + core.radius * 0.46, core.y - core.radius * 0.2)
  ctx.quadraticCurveTo(core.x + core.radius * 0.18, core.y - core.radius * 0.02, core.x, core.y - core.radius * 0.12)
  ctx.moveTo(core.x - core.radius * 0.38, core.y + core.radius * 0.22)
  ctx.quadraticCurveTo(core.x - core.radius * 0.12, core.y + core.radius * 0.08, core.x, core.y + core.radius * 0.18)
  ctx.moveTo(core.x + core.radius * 0.38, core.y + core.radius * 0.2)
  ctx.quadraticCurveTo(core.x + core.radius * 0.12, core.y + core.radius * 0.08, core.x, core.y + core.radius * 0.18)
  ctx.stroke()
  ctx.restore()
}

function drawToxinIcon(ctx: CanvasRenderingContext2D, icon: number, radius: number): void {
  const icons = ['💊', '💉', '🚬']
  const emoji = icons[icon % icons.length]
  
  ctx.save()
  ctx.font = `${Math.round(radius * 1.5)}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, 0, 0)
  ctx.restore()
}

function drawHealthIcon(ctx: CanvasRenderingContext2D, icon: number, radius: number): void {
  const icons = ['🍎', '🥗', '📚', '❤️']
  const emoji = icons[icon % icons.length]
  
  ctx.save()
  ctx.font = `${Math.round(radius * 1.5)}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, 0, 0)
  ctx.restore()
}

function drawShield(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { core, shield } = state
  const start = shield.angle - shield.arc / 2
  const end = shield.angle + shield.arc / 2

  ctx.save()
  ctx.lineCap = 'round'
  ctx.shadowBlur = 24 + Math.min(26, Math.abs(shield.angularVelocity) * 0.012)
  ctx.shadowColor = '#8b5cf6'
  ctx.strokeStyle = '#a78bfa'
  ctx.lineWidth = shield.thickness
  ctx.beginPath()
  ctx.arc(core.x, core.y, shield.radius, start, end)
  ctx.stroke()

  ctx.globalAlpha = 0.32
  ctx.strokeStyle = '#67e8f9'
  ctx.lineWidth = shield.thickness + 13
  ctx.beginPath()
  ctx.arc(core.x, core.y, shield.radius, start, end)
  ctx.stroke()
  ctx.restore()
}

function drawInputCue(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (!state.input.pointerActive) return

  const { input, core } = state
  const angle = Math.atan2(input.y - core.y, input.x - core.x)
  const anchorX = core.x + Math.cos(angle) * state.shield.radius
  const anchorY = core.y + Math.sin(angle) * state.shield.radius

  ctx.save()
  ctx.globalAlpha = 0.72
  ctx.strokeStyle = 'rgba(103, 232, 249, 0.72)'
  ctx.lineWidth = 2
  ctx.setLineDash([7, 10])
  ctx.beginPath()
  ctx.moveTo(input.x, input.y)
  ctx.lineTo(anchorX, anchorY)
  ctx.stroke()

  ctx.setLineDash([])
  ctx.shadowBlur = 18
  ctx.shadowColor = '#67e8f9'
  ctx.strokeStyle = '#67e8f9'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(input.x, input.y, 12 + Math.sin(state.elapsed * 7) * 2, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

function drawEntities(ctx: CanvasRenderingContext2D, state: GameState): void {
  state.entities.forEach((entity) => {
    if (!entity.active) return
    ctx.save()
    const toxin = entity.kind === 'toxin'
    ctx.globalAlpha = entity.reacted ? 0.42 : 1
    ctx.shadowBlur = toxin ? 22 : 18
    ctx.shadowColor = toxin ? '#fb7185' : '#86efac'
    ctx.translate(entity.x, entity.y)
    ctx.rotate(entity.age * (toxin ? 2.3 : -1.6))
    if (!toxin && !entity.reacted) {
      ctx.fillStyle = 'rgba(20, 83, 45, 0.9)'
      ctx.beginPath()
      ctx.arc(0, 0, entity.radius * 1.12, 0, Math.PI * 2)
      ctx.fill()
    } else if (toxin && !entity.reacted) {
      ctx.fillStyle = 'rgba(127, 29, 29, 0.9)'
      ctx.beginPath()
      ctx.arc(0, 0, entity.radius * 1.12, 0, Math.PI * 2)
      ctx.fill()
    }
    if (toxin) {
      drawToxinIcon(ctx, entity.icon, entity.radius)
    } else {
      drawHealthIcon(ctx, entity.icon, entity.radius)
    }
    ctx.restore()
  })
}

function drawParticles(ctx: CanvasRenderingContext2D, state: GameState): void {
  state.particles.forEach((particle) => {
    if (!particle.active) return
    const alpha = Math.max(0, particle.life / particle.maxLife)
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = particle.color
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, particle.radius * alpha, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  })
}

function drawFloatingTexts(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.save()
  ctx.font = '700 18px ui-monospace, SFMono-Regular, Consolas, monospace'
  ctx.textAlign = 'center'
  state.texts.forEach((text) => {
    if (!text.active) return
    ctx.globalAlpha = Math.max(0, text.life / text.maxLife)
    ctx.fillStyle = text.color
    ctx.fillText(text.text, text.x, text.y)
  })
  ctx.restore()
}

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.save()
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0)
  ctx.clearRect(0, 0, state.width, state.height)

  const shake = state.shake * state.shake * 9
  if (shake > 0.01) {
    ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake)
  }

  drawBackground(ctx, state)
  drawParticles(ctx, state)
  drawCore(ctx, state)
  drawShield(ctx, state)
  drawInputCue(ctx, state)
  drawEntities(ctx, state)
  drawFloatingTexts(ctx, state)

  if (state.flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${Math.min(0.18, state.flash * 0.16)})`
    ctx.fillRect(0, 0, state.width, state.height)
  }
  ctx.restore()
}
