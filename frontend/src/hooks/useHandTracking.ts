import { useEffect, useState } from 'react'
import { getVisionRef, stopMediaPipeWorker, subscribeVision, type VisionRef } from '../vision'

export default function useHandTracking(enabled: boolean, sessionKey = 0) {
  const [vision, setVision] = useState<VisionRef>(() => ({ ...getVisionRef() }))

  useEffect(() => {
    const unsubscribe = subscribeVision((next) => {
      setVision({
        ...next,
        left: next.left ? { ...next.left, landmarks: [...next.left.landmarks] } : null,
        right: next.right ? { ...next.right, landmarks: [...next.right.landmarks] } : null,
        stats: { ...next.stats },
      })
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!enabled) {
      stopMediaPipeWorker()
    }

    return () => {
      stopMediaPipeWorker()
    }
  }, [enabled, sessionKey])

  return vision
}
