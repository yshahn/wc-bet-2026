'use client'
import { UserProfile, Match, Bet, markSettled } from '@/lib/firebase'

interface Props { users: UserProfile[]; bets: Bet[]; matches: Match[]; currentId: string; settlements: Record<string, boolean> }

function calcPnl(uid: string, bets: Bet[], matches: Match[]) {
  let pnl = 0
  bets.filter(b => b.userId === uid).forEach(b => {
    const m = matches.find(x => x.id === b.matchId)
    if (!m || m.status !== 'done') return
    const won = m.homeScore === b.homeScore && m.awayScore === b.awayScore
    if (won) {
      const pool    = bets.filter(x => x.matchId === b.matchId).reduce((s, x) => s + x.amount, 0)
      const winners = bets.filter(x => x.matchId === b.matchId && x.homeScore === m.homeScore && x.awayScore === m.awayScore)
      pnl += Math.floor(pool / winners.length) - b.amount
    } else { pnl -= b.amount }
  })
  return pnl
}

export default function SettleTab({ users, bets, matches, currentId, settlements }: Props) {
  const myPnl = calcPnl(currentId, bets, matches)

  const rows = users
    .filter(u => u.id !== currentId)
    .map(u => {
      const theirPnl = calcPnl(u.id, bets, matches)
      const net = myPnl - theirPnl
      if (net === 0) return null
      const key = [currentId, u.id].sort().join('_')
      return { id: u.id, name: u.name, iReceive: net > 0, amount: Math.abs(Math.floor(net / 2)), key, done: !!settlements[key] }
    })
    .filter(Boolean) as { id:string; name:string; iReceive:boolean; amount:number; key:string; done:boolean }[]

  return (
    <>
      <div className="settle-hero">
        <div className="settle-hero-label bebas">나의 현재 손익</div>
        <div className={`settle-big bebas ${myPnl >= 0 ? 'pos' : 'neg'}`}>
          {myPnl >= 0 ? '+' : ''}₩{myPnl.toLocaleString()}
        </div>
        <div className="settle-sub-text">종료된 경기 기준 · 스코어 정확히 맞춘 사람이 풀 나눔</div>
      </div>

      <div className="section-title bebas">친구별 정산</div>

      {rows.length === 0
        ? <div className="empty" style={{ padding:'20px' }}><p>정산할 내역이 없어요</p></div>
        : rows.map(r => (
          <div key={r.key} className="settle-row2">
            <div className="settle-info">
              <div className="settle-desc">{r.iReceive ? `${r.name}님이 나에게 송금` : `내가 ${r.name}님에게 송금`}</div>
              <div className="settle-amt">₩{r.amount.toLocaleString()}</div>
            </div>
            <button className={`settle-done-btn ${r.done ? 'done' : ''}`}
              onClick={() => !r.done && markSettled(r.key, true)}>
              {r.done ? '✓ 완료' : '정산하기'}
            </button>
          </div>
        ))
      }
    </>
  )
}
