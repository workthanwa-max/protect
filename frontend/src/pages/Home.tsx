import { useNavigate } from 'react-router-dom'
import StartScreen from '../components/StartScreen'
import LeaderboardBoard from '../components/LeaderboardBoard'
import type { LeaderboardEntry } from '../services/api'

type HomeProps = {
  leaderboard: LeaderboardEntry[]
  onStartSetup: () => void
}

export default function Home({
  leaderboard,
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
          title="สถิติผู้เล่นท็อป 5"
          emptyText="ยังไม่มีสถิติสำหรับตอนนี้"
        />
      </div>
    </div>
  )
}
