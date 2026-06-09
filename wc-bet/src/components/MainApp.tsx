'use client'
import { useEffect, useState } from 'react'
import {
  UserProfile, Match, Bet,
  subscribeMatches, subscribeBets, subscribeUsers, subscribeSettlements,
} from '@/lib/firebase'
import MatchesTab from './MatchesTab'
import MyBetsTab  from './MyBetsTab'
import RankTab    from './RankTab'
import SettleTab  from './SettleTab'

type Tab = 'matches' | 'mybets' | 'rank' | 'settle'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'matches', label: '경기',   icon: '⚽' },
  { id: 'mybets',  label: '내베팅', icon: '🎫' },
  { id: 'rank',    label: '랭킹',   icon: '🏆' },
  { id: 'settle',  label: '정산',   icon: '💰' },
]

interface Props {
  profile: UserProfile
  onLogout: () => void
}

export default function MainApp({ profile, onLogout }: Props) {
  const [tab,         setTab]         = useState<Tab>('matches')
  const [matches,     setMatches]     = useState<Match[]>([])
  const [bets,        setBets]        = useState<Bet[]>([])
  const [users,       setUsers]       = useState<UserProfile[]>([])
  const [settlements, setSettlements] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const unsubs = [
      subscribeMatches(setMatches),
      subscribeBets(setBets),
      subscribeUsers(setUsers),
      subscribeSettlements(setSettlements),
    ]
    return () => unsubs.forEach(u => u())
  }, [])

  const sortedMatches = [...matches].sort((a, b) => {
    const ak = a.homeName === '대한민국' || a.awayName === '대한민국'
    const bk = b.homeName === '대한민국' || b.awayName === '대한민국'
    if (ak && !bk) return -1
    if (!ak && bk) return 1
    return a.kickoff.localeCompare(b.kickoff)
  })

  return (
    <div className="app-shell">
      <header className="header">
        <div>
          <div className="header-title bebas">⚽ WC 2026 BET</div>
          <div className="header-sub">{profile.name}님</div>
        </div>
        <button onClick={onLogout} style={{ background:'transparent', border:'1px solid rgba(255,255,255,.15)', borderRadius:8, padding:'6px 12px', color:'rgba(255,255,255,.4)', fontSize:12, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
          나가기
        </button>
      </header>

      <nav className="tabs">
        {TABS.map(t => (
          <div key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <span style={{ fontSize:18, display:'block', marginBottom:2 }}>{t.icon}</span>
            {t.label}
          </div>
        ))}
      </nav>

      <main className="page">
        {tab === 'matches' && <MatchesTab matches={sortedMatches} bets={bets} profile={profile} />}
        {tab === 'mybets'  && <MyBetsTab  myBets={bets.filter(b => b.userId === profile.id)} matches={matches} bets={bets} />}
        {tab === 'rank'    && <RankTab    users={users} bets={bets} matches={matches} currentId={profile.id} />}
        {tab === 'settle'  && <SettleTab  users={users} bets={bets} matches={matches} currentId={profile.id} settlements={settlements} />}
      </main>
    </div>
  )
}
