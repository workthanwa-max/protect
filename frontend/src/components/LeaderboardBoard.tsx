import type { LeaderboardEntry } from '../services/api'

import type { PlayLevel } from '../game/state'

type LeaderboardBoardProps = {
  entries: LeaderboardEntry[]
  title?: string
  emptyText?: string
  activeLevel?: PlayLevel
  onLevelChange?: (level: PlayLevel) => void
}

function rankLabel(index: number): string {
  if (index === 0) return '🥇 ทอง'
  if (index === 1) return '🥈 เงิน'
  if (index === 2) return '🥉 ทองแดง'
  return `อันดับ ${index + 1}`
}

function LeaderboardBoard({
  entries,
  title = 'อันดับคะแนนบูธ',
  emptyText = 'ยังไม่มีคะแนนในระบบ',
  activeLevel = 1,
  onLevelChange,
}: LeaderboardBoardProps) {
  const topEntries = entries.slice(0, 5)

  return (
    <div className="leaderboard floating-leaderboard">
      <div className="leaderboard-header">
        <h2>{title}</h2>
        {onLevelChange && (
          <div className="leaderboard-tabs">
            {[1, 2, 3, 4].map((l) => (
              <button
                key={l}
                type="button"
                className={`tab-btn ${activeLevel === l ? 'active' : ''}`}
                onClick={() => onLevelChange(l as PlayLevel)}
              >
                L{l}
              </button>
            ))}
          </div>
        )}
      </div>
      {topEntries.length === 0 ? (
        <p>{emptyText}</p>
      ) : (
        <ol>
          {topEntries.map((entry, index) => (
            <li key={entry.id} className={`rank-${index + 1}`}>
              <span className="rank-medal">{rankLabel(index)}</span>
              <span className="rank-name">{entry.name}</span>
              <strong>{entry.score.toLocaleString()}</strong>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export default LeaderboardBoard
