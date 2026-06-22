import GameOver from '../components/GameOver'
import LeaderboardBoard from '../components/LeaderboardBoard'
import type { GameSnapshot, PlayLevel } from '../game/state'
import type { LeaderboardEntry, SubmitState } from '../services/api'

type GameOverPageProps = {
  snapshot: GameSnapshot
  rewardNotice: string
  submitState: SubmitState
  onRestart: () => void
  onMenu: () => void
  leaderboard: LeaderboardEntry[]
  leaderboardLevel: PlayLevel
  setLeaderboardLevel: (level: PlayLevel) => void
}

export default function GameOverPage({
  snapshot,
  rewardNotice,
  submitState,
  onRestart,
  onMenu,
  leaderboard,
  leaderboardLevel,
  setLeaderboardLevel,
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
          activeLevel={leaderboardLevel}
          onLevelChange={setLeaderboardLevel}
          title={`สถิติผู้เล่นท็อป 5 (ระดับ ${leaderboardLevel})`}
          emptyText="ยังไม่มีสถิติสำหรับระดับนี้"
        />
      </aside>
    </div>
  )
}
