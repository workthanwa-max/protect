import GameOver from '../components/GameOver'
import LeaderboardBoard from '../components/LeaderboardBoard'
import type { GameSnapshot } from '../game/state'
import type { LeaderboardEntry, SubmitState } from '../services/api'

type GameOverPageProps = {
  snapshot: GameSnapshot
  rewardNotice: string
  submitState: SubmitState
  onRestart: () => void
  onMenu: () => void
  leaderboard: LeaderboardEntry[]
}

export default function GameOverPage({
  snapshot,
  rewardNotice,
  submitState,
  onRestart,
  onMenu,
  leaderboard,
}: GameOverPageProps) {
  return (
    <div className="overlay-wrapper">
      <GameOver
        snapshot={snapshot}
        rewardNotice={rewardNotice}
        submitState={submitState}
        onRestart={onRestart}
        onMenu={onMenu}
      />
      <aside className="overlay-panel leaderboard-panel">
        <LeaderboardBoard
          entries={leaderboard}
          title="สถิติผู้เล่นท็อป 5"
          emptyText="ยังไม่มีสถิติสำหรับตอนนี้"
        />
      </aside>
    </div>
  )
}
