import type { LeaderboardEntry } from '../services/api'

type LeaderboardBoardProps = {
  entries: LeaderboardEntry[]
  title?: string
  emptyText?: string
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
}: LeaderboardBoardProps) {
  const topEntries = entries.slice(0, 5)

  return (
    <div className="leaderboard floating-leaderboard">
      <div className="leaderboard-header">
        <h2>{title}</h2>
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
