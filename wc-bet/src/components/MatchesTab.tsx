'use client'
import { useState } from 'react'
import { Match, Bet, UserProfile, BetInput, placeBet, updateMatchScore } from '@/lib/firebase'

const ADMIN_NAME = process.env.NEXT_PUBLIC_ADMIN_NAME || ''

interface Props { matches: Match[]; bets: Bet[]; profile: UserProfile }
interface BetForm { winner: 'home' | 'draw' | 'away' | null; homeScore: string; awayScore: string; amount: string }

export default function MatchesTab({ matches, bets, profile }: Props) {
  const [open,       setOpen]       = useState<Match | null>(null)
  const [form,       setForm]       = useState<BetForm>({ winner:null, homeScore:'', awayScore:'', amount:'' })
  const [saving,     setSaving]     = useState(false)
  const [adminScore, setAdminScore] = useState<Record<string, { h:string; a:string }>>({})

  const isAdmin = profile.name === ADMIN_NAME

  function openModal(m: Match) {
    if (m.status === 'done') return
    const ex = bets.find(b => b.matchId === m.id && b.userId === profile.id)
    setForm(ex
      ? { winner: ex.winner, homeScore: String(ex.homeScore), awayScore: String(ex.awayScore), amount: String(ex.amount) }
      : { winner: null, homeScore: '', awayScore: '', amount: '' })
    setOpen(m)
  }

  async function submitBet() {
    if (!open || !form.winner || form.homeScore === '' || form.awayScore === '' || !form.amount) return
    setSaving(true)
    await placeBet({
      userId: profile.id,
      matchId: open.id,
      winner: form.winner,
      winnerName: form.winner === 'home' ? open.homeName : form.winner === 'away' ? open.awayName : '무승부',
      homeScore: parseInt(form.homeScore),
      awayScore: parseInt(form.awayScore),
      amount: parseInt(form.amount),
    })
    setSaving(false)
    setOpen(null)
  }

  function statusPill(m: Match) {
    if (m.status === 'live') return <span className="pill pill-live">🔴 LIVE</span>
    if (m.status === 'done') return <span className="pill pill-done">종료</span>
    const d = new Date(m.kickoff)
    const label = d.toLocaleString('ko-KR', { month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit' })
    return <span className="pill pill-upcoming">{label}</span>
  }

  const canBet = form.winner && form.homeScore !== '' && form.awayScore !== '' && !!form.amount

  return (
    <>
      {matches.map(m => {
        const myBet = bets.find(b => b.matchId === m.id && b.userId === profile.id)
        return (
          <div key={m.id} className={`match-card ${myBet ? 'bet-placed' : ''}`} onClick={() => openModal(m)}>
            <div className="match-meta">
              <span className="match-group">{m.group}</span>
              {statusPill(m)}
            </div>
            <div className="teams">
              <div className="team">
                <span className="flag">{m.homeFlag}</span>
                <div className="team-name">{m.homeName}</div>
              </div>
              <div className="scoreboard">
                {m.homeScore !== null
                  ? <div className={`score bebas ${m.status==='live' ? 'live' : ''}`}>{m.homeScore}:{m.awayScore}</div>
                  : <div className="vs bebas">VS</div>}
              </div>
              <div className="team">
                <span className="flag">{m.awayFlag}</span>
                <div className="team-name">{m.awayName}</div>
              </div>
            </div>
            {myBet && (
              <div className="bet-chip">✓ {myBet.winnerName} 승 | {myBet.homeScore}:{myBet.awayScore} | ₩{myBet.amount.toLocaleString()}</div>
            )}
            {isAdmin && m.status !== 'done' && (
              <div className="score-update-form" onClick={e => e.stopPropagation()}>
                <span style={{ fontSize:11, color:'rgba(255,255,255,.3)' }}>결과 입력:</span>
                <input className="mini-input" type="number" placeholder="홈" min={0}
                  value={adminScore[m.id]?.h || ''}
                  onChange={e => setAdminScore(p => ({ ...p, [m.id]: { ...p[m.id], h: e.target.value } }))} />
                <span style={{ color:'rgba(255,255,255,.3)', fontFamily:"'Bebas Neue',sans-serif" }}>:</span>
                <input className="mini-input" type="number" placeholder="원정" min={0}
                  value={adminScore[m.id]?.a || ''}
                  onChange={e => setAdminScore(p => ({ ...p, [m.id]: { ...p[m.id], a: e.target.value } }))} />
                <button className="mini-btn" onClick={() => {
                  const s = adminScore[m.id]
                  if (s?.h && s?.a) updateMatchScore(m.id, parseInt(s.h), parseInt(s.a))
                }}>확정</button>
              </div>
            )}
          </div>
        )
      })}

      {open && (
        <div className="overlay" onClick={() => setOpen(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title bebas">{open.homeFlag} vs {open.awayFlag} 베팅</div>
            <div className="modal-sub">{open.homeName} vs {open.awayName} · {open.group}</div>

            <div className="field">
              <div className="field-label">승자 예측</div>
              <div className="winner-grid">
                {(['home','draw','away'] as const).map(w => (
                  <div key={w} className={`winner-btn ${form.winner===w ? 'active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, winner: w }))}>
                    <span className="winner-flag">{w==='home' ? open.homeFlag : w==='away' ? open.awayFlag : '🤝'}</span>
                    {w==='home' ? open.homeName : w==='away' ? open.awayName : '무승부'}
                  </div>
                ))}
              </div>
            </div>

            <div className="field">
              <div className="field-label">스코어 예측</div>
              <div className="score-row">
                <input className="score-input" type="number" min={0} max={20} placeholder="0"
                  value={form.homeScore} onChange={e => setForm(f => ({ ...f, homeScore: e.target.value }))} />
                <div className="score-sep bebas">:</div>
                <input className="score-input" type="number" min={0} max={20} placeholder="0"
                  value={form.awayScore} onChange={e => setForm(f => ({ ...f, awayScore: e.target.value }))} />
              </div>
            </div>

            <div className="field">
              <div className="field-label">베팅 금액 (₩)</div>
              <input className="amount-input" type="number" placeholder="금액 입력"
                value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              <div className="presets">
                {[1000,3000,5000,10000,20000].map(a => (
                  <button key={a} className="preset" onClick={() => setForm(f => ({ ...f, amount: String(a) }))}>₩{a.toLocaleString()}</button>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setOpen(null)}>취소</button>
              <button className="btn-confirm" onClick={submitBet} disabled={!canBet || saving}>
                {saving ? '저장 중...' : '베팅 확정 →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
