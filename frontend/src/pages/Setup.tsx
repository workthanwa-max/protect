import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CameraPreview from '../components/CameraPreview'
import PermissionScreen from '../components/PermissionScreen'
import { startMediaPipeWorker, stopMockVision } from '../vision'
import type { VisionRef } from '../vision'
import type { ControlMode } from '../game/state'

type SetupPhase = 'control' | 'permission' | 'camera-loading' | 'hand-confirm' | 'countdown'

type SetupProps = {
  controlMode: ControlMode
  setControlMode: (mode: ControlMode) => void
  cameraEnabled: boolean
  setCameraEnabled: (enabled: boolean) => void
  vision: VisionRef
}

import { CalibrationScreen } from '../components/CalibrationScreen'

export default function Setup({
  controlMode,
  setControlMode,
  cameraEnabled,
  setCameraEnabled,
  vision,
}: SetupProps) {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<SetupPhase>('control')
  const [handHoldMs, setHandHoldMs] = useState(0)
  const [countdown, setCountdown] = useState<number | null>(null)
  
  const leftReady = Boolean(vision.left?.active)
  const rightReady = Boolean(vision.right?.active)
  const handFocused = leftReady || rightReady

  const beginCountdown = () => {
    setCountdown(3)
    setPhase('countdown')
  }

  const resetCameraFlow = () => {
    setCameraEnabled(false)
    setHandHoldMs(0)
    setCountdown(null)
  }

  const chooseMouse = () => {
    setControlMode('mouse')
    resetCameraFlow()
    setHandHoldMs(0)
    beginCountdown()
  }

  const chooseBody = () => {
    stopMockVision()
    setControlMode('body')
    setHandHoldMs(0)
    setCountdown(null)
    setPhase('permission')
  }

  const handleRequestCamera = async () => {
    stopMockVision()
    setCameraEnabled(true)
    setPhase('camera-loading')
    await startMediaPipeWorker()
  }

  const handlePermissionBack = () => {
    resetCameraFlow()
    setPhase('control')
  }

  useEffect(() => {
    if (phase === 'camera-loading' && cameraEnabled && vision.mode === 'camera') {
      setPhase('hand-confirm')
    }
  }, [cameraEnabled, phase, vision.mode])

  useEffect(() => {
    if (phase !== 'hand-confirm' || controlMode !== 'body' || !cameraEnabled || vision.mode !== 'camera') return undefined

    let last = performance.now()
    const timer = window.setInterval(() => {
      const now = performance.now()
      const dt = now - last
      last = now
      setHandHoldMs((current) => {
        if (handFocused) {
          return Math.min(3000, current + dt)
        }
        return Math.max(0, current - dt * 2) // drains twice as fast as it fills
      })
    }, 100)

    return () => window.clearInterval(timer)
  }, [cameraEnabled, controlMode, handFocused, phase, vision.mode])

  useEffect(() => {
    if (phase === 'hand-confirm' && controlMode === 'body' && handHoldMs >= 3000) {
      beginCountdown()
    }
  }, [controlMode, handHoldMs, phase])

  useEffect(() => {
    if (phase !== 'countdown' || countdown === null) return undefined

    if (countdown <= 0) {
      setCountdown(null)
      navigate('/play')
      return undefined
    }

    const timer = window.setTimeout(() => setCountdown((value) => (value === null ? null : value - 1)), 1000)
    return () => window.clearTimeout(timer)
  }, [countdown, phase, navigate])

  const holdProgress = handHoldMs / 3000

  return (
    <>
      {phase === 'control' && (
        <div className="overlay-wrapper setup-wrapper">
          <section className="flow-panel">
            <p className="eyebrow">เลือกวิธีคุม</p>
            <h1>คุมโล่</h1>
            <p className="panel-copy">เลือกอย่างใดอย่างหนึ่ง ระบบจะไม่สลับโหมดระหว่างเล่น</p>

            <div className="control-grid">
              <button
                type="button"
                className={`control-card ${controlMode === 'mouse' ? 'selected' : ''}`}
                onClick={chooseMouse}
              >
                <strong>เมาส์</strong>
                <span>แม่น · เบาเครื่อง</span>
                <small>คลิกเพื่อเริ่มนับถอยหลัง</small>
              </button>
              <button
                type="button"
                className={`control-card ${controlMode === 'body' ? 'selected' : ''}`}
                onClick={chooseBody}
              >
                <strong>ร่างกาย</strong>
                <span>ใช้มือหมุนโล่</span>
                <small>ขอเปิดกล้องทันที</small>
              </button>
            </div>
          </section>
        </div>
      )}

      {phase === 'hand-confirm' && (
        <div className="fullscreen-camera-wrapper">
          <CameraPreview vision={vision} compact={false} />
          <CalibrationScreen 
            leftReady={leftReady}
            rightReady={rightReady}
            handReady={handFocused}
            readyProgress={holdProgress} 
            onBack={() => setPhase('control')} 
          />
        </div>
      )}
      {phase === 'permission' && (
        <div className="overlay-wrapper setup-wrapper">
          <PermissionScreen
            status={vision.mode}
            errorMessage={vision.mode === 'error' ? vision.message : ''}
            onRequestCamera={handleRequestCamera}
            onBack={handlePermissionBack}
          />
        </div>
      )}

      {phase === 'camera-loading' && (
        <div className="overlay-wrapper setup-wrapper">
          <section className="flow-panel">
            <p className="eyebrow">เปิดกล้อง</p>
            <h1>ขอสิทธิ์</h1>
            <p className="panel-copy">{vision.mode === 'error' ? vision.message : 'อนุญาตกล้องเพื่อใช้มือควบคุมโล่'}</p>
            <div className="confirm-copy">
              <strong>{vision.mode === 'error' ? 'ไม่สำเร็จ' : 'รอสักครู่'}</strong>
              <span>{vision.mode === 'error' ? 'กลับไปเลือกใหม่ได้' : vision.message}</span>
            </div>
            {vision.mode === 'error' && (
              <div className="actions">
                <button type="button" onClick={() => handleRequestCamera()}>
                  ลองอีกครั้ง
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {phase === 'countdown' && (
        <div className="fullscreen-camera-wrapper">
          <CameraPreview vision={vision} holdProgress={1} />
          <div className="giant-countdown-overlay">
            <strong>{countdown}</strong>
            <p>เตรียมตัวเริ่มเกม!</p>
            <div className="item-legend" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: 'rgba(15, 23, 42, 0.85)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(103, 232, 249, 0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', marginTop: '40px', transform: 'scale(1.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-good)', boxShadow: '0 0 16px var(--color-good)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', textShadow: 'none' }}>ยาเขียว</span>
                  <span style={{ fontSize: '15px', color: 'var(--color-good)', fontWeight: 600, textShadow: 'none' }}>+16 HP</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-danger)', boxShadow: '0 0 16px var(--color-danger)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', textShadow: 'none' }}>ยาแดง</span>
                  <span style={{ fontSize: '15px', color: 'var(--color-danger)', fontWeight: 600, textShadow: 'none' }}>-HP (หลบ!)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
