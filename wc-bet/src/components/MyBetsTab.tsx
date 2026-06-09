'use client'
import { Bet, Match } from '@/lib/firebase'

interface Props { myBets: Bet[]; matches: Match[]; bets: Bet[] }

export default function MyBetsTab({ myBets, matches, bets }: Props) {
  if (!myBets.length) {
    return (
      <div className="empty">
        <div className="empty-icon">🎫</div>
        <p>아직 베팅한 경기가 없어요</p>
      </div>
    )
  }

  return (
    <>
      {myBets.map(b => {
        const m = matches.find(x => x.id === b.matchId)
        if (!m) return null
        const won  = m.status === 'done' && m.homeScore === b.homeScore && m.awayScore === b.awayScore
        const lost = m.status === 'done' && !won
        const pool    = bets.filter(x => x.matchId === b.matchId).reduce((s, x) => s + x.amount, 0)
        const winners = bets.filter(x => x.matchId === b.matchId && m.status === 'done' && x.homeScore === m.homeScore && x.awayScore === m.awayScore)
        const payout  = won && winners.length > 0 ? Math.floor(pool / winners.length) : 0
        const pnl     = won ? payout - b.amount : lost ? -b.amount : 0

        return (
          <div key={b.id} className="bet-card">
            <div className="bet-card-header">
              <div className="bet-card-match">{m.homeFlag} {m.homeName} vs {m.awayName} {m.awayFlag}</div>
              <span className={`pill ${won ? 'pill-win' : lost ? 'pill-lose' : 'pill-pend'}`}>
                {won ? '✓ 적중' : lost ? '✗ 실패' : '대기중'}
              </span>
            </div>
            <div className="detail-row"><span>예측 스코어</span><span>{b.homeScore} : {b.awayScore}</span></div>
            <div className="detail-row"><span>예측 승자</span><span>{b.winnerName}</span></div>
            {m.status === 'done' && <div className="detail-row"><span>실제 스코어</span><span>{m.homeScore} : {m.awayScore}</span></div>}
            <div className="detail-row"><span>총 베팅 풀</span><span>₩{pool.toLocaleString()}</span></div>
            <div className="pnl-row">
              <span className="pnl-label">내 베팅: ₩{b.amount.toLocaleString()}</span>
              <span className={`pnl-value ${won ? 'pos' : lost ? 'neg' : 'pen'}`}>
                {won ? `+₩${(pnl).toLocaleString()} 수령` : lost ? `-₩${b.amount.toLocaleString()}` : '결과 대기'}
              </span>
            </div>
          </div>
        )
      })}
    </>
  )
}
