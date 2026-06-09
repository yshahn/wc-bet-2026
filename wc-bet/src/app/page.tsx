'use client'
import { useEffect, useState } from 'react'
import { loginOrCreateUser, UserProfile } from '@/lib/firebase'
import { seedMatchesIfEmpty } from '@/lib/seedMatches'
import MainApp from '@/components/MainApp'

const STORAGE_KEY = 'wc2026_user'

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null | undefined>(undefined)
  const [name, setName]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    seedMatchesIfEmpty().catch(console.error)
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setProfile(JSON.parse(saved))
      else setProfile(null)
    } catch { setProfile(null) }
  }, [])

  async function enter() {
    if (!name.trim()) return
    setLoading(true); setError('')
    try {
      const p = await loginOrCreateUser(name)
      if (!p) { setError('오류가 발생했습니다'); return }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
      setProfile(p)
    } catch {
      setError('연결 오류. 다시 시도해주세요')
    } finally { setLoading(false) }
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setProfile(null)
    setName('')
  }

  if (profile === undefined) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0D1B2A' }}>
      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, color:'#F5A623', letterSpacing:3 }}>⚽</div>
    </div>
  )

  if (profile) return <MainApp profile={profile} onLogout={logout} />

  return (
    <div style={{ background:'#0D1B2A', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div className="auth-wrap">
        <div className="auth-logo">⚽</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:2, color:'#F5A623', marginBottom:6 }}>WC 2026 BET</div>
        <p className="auth-tagline">친구들과 월드컵 스코어 베팅</p>
        <input
          className="auth-input"
          type="text"
          placeholder="이름 입력 (예: 김철수)"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && enter()}
          autoFocus
          maxLength={20}
        />
        {error && <p className="auth-err">{error}</p>}
        <button className="auth-btn" onClick={enter} disabled={loading || !name.trim()}>
          {loading ? '입장 중...' : '입장하기 →'}
        </button>
        <p style={{ fontSize:12, color:'rgba(255,255,255,.2)', marginTop:20, textAlign:'center', lineHeight:1.6 }}>
          이름으로 계정이 자동 생성됩니다<br/>다음 방문 시 같은 이름으로 입장하세요
        </p>
      </div>
    </div>
  )
}