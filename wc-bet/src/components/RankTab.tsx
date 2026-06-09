'use client'
import { UserProfile, Match, Bet } from '@/lib/firebase'

const COLORS = ['#F5A623','#5dc882','#6b8ff5','#e05555','#c47cf5','#5bc8d4']

interface Props { users: UserProfile[]; bets: Bet[]; matches: Match[]; currentId: string }

function calcPnl(uid: string, bets: Bet[], matches: Match[]) {
  let pnl = 0, wins = 0, done = 0
  bets.filter(b => b.userId === uid).forEach(b => {
    const m = matches.find(x => x.id === b.matchId)
    if (!m || m.status !== 'done') return
    done++
    const won = m.homeScore === b.homeScore && m.awayScore === b.awayScore
    if (won) {
      wins++
      const pool    = bets.filter(x => x.matchId === b.matchId).reduce((s, x) => s + x.amount, 0)
      const winners = bets.filter(x => x.matchId === b.matchId && x.homeScore === m.homeScore && x.awayScore === m.awayScore)
      pnl += Math.floor(pool / winners.length) - b.amount
    } else { pnl -= b.amount }
  })
  return { pnl, wins, done, total: bets.filter(b => b.userId === uid).length }
}

export default function RankTab({ users, bets, matches, currentId }: Props) {
  const ranked = users
    .map((u, i) => ({ ...u, ...calcPnl(u.id, bets, matches), color: COLORS[i % COLORS.length] }))
    .sort((a, b) => b.pnl - a.pnl)

  return (
    <>
      {ranked.map((u, i) => (
        <div key={u.id} className={`rank-row ${u.id === currentId ? 'me' : ''}`}>
          <div className={`rank-num bebas ${i < 3 ? 'gold' : ''}`}>{i + 1}</div>
          <div className="avatar" style={{ background: u.color, color: '#0D1B2A' }}>{u.name[0]}</div>
          <div className="rank-info">
            <div className="rank-name">{u.name} {u.id === currentId ? '(나)' : ''}</div>
            <div className="rank-stats">베팅 {u.total}건 · 적중 {u.wins}/{u.done}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:15, fontWeight:600, color: u.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {u.pnl >= 0 ? '+' : ''}₩{u.pnl.toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
