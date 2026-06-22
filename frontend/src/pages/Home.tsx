import { useNavigate } from 'react-router-dom'
import StartScreen from '../components/StartScreen'
import LeaderboardBoard from '../components/LeaderboardBoard'
import type { PlayLevel } from '../game/state'
import type { LeaderboardEntry } from '../services/api'

type HomeProps = {
  leaderboard: LeaderboardEntry[]
  leaderboardLevel: PlayLevel
  setLeaderboardLevel: (level: PlayLevel) => void
  onStartSetup: () => void
}

export default function Home({
  leaderboard,
  leaderboardLevel,
  setLeaderboardLevel,
  onStartSetup,
}: HomeProps) {
  const navigate = useNavigate()

  const handleStart = () => {
    onStartSetup()
    navigate('/setup')
  }

  return (
    <div className="overlay-wrapper home-wrapper">
      <section className="overlay-panel menu-panel">
        <StartScreen onStart={handleStart} />
      </section>
      
      <div className="home-leaderboard-container">
        <LeaderboardBoard
          entries={leaderboard}
          activeLevel={leaderboardLevel}
          onLevelChange={setLeaderboardLevel}
          title={`สถิติผู้เล่นท็อป 5 (ระดับ ${leaderboardLevel})`}
          emptyText="ยังไม่มีสถิติสำหรับระดับนี้"
        />
      </div>
    </div>
  )
}
