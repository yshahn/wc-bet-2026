import { initializeApp, getApps } from 'firebase/app'
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  Timestamp,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const db = getFirestore(app)

// ─── Users ───────────────────────────────────────────────────────────────────

export async function loginOrCreateUser(name: string): Promise<UserProfile | null> {
  if (!name.trim()) return null
  const id = name.trim().toLowerCase().replace(/\s+/g, '_')
  const ref = doc(db, 'users', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    const profile: UserProfile = { id, name: name.trim(), createdAt: serverTimestamp() as Timestamp }
    await setDoc(ref, profile)
    return profile
  }
  return snap.data() as UserProfile
}

export function subscribeUsers(cb: (users: UserProfile[]) => void) {
  return onSnapshot(collection(db, 'users'), snap => {
    cb(snap.docs.map(d => d.data() as UserProfile))
  })
}

// ─── Matches ─────────────────────────────────────────────────────────────────

export function subscribeMatches(cb: (matches: Match[]) => void) {
  return onSnapshot(query(collection(db, 'matches'), orderBy('kickoff')), snap => {
    cb(snap.docs.map(d => d.data() as Match))
  })
}

export async function updateMatchScore(matchId: string, homeScore: number, awayScore: number) {
  await updateDoc(doc(db, 'matches', matchId), { homeScore, awayScore, status: 'done' })
}

// ─── Bets ────────────────────────────────────────────────────────────────────

export async function placeBet(bet: BetInput) {
  const id = `${bet.userId}_${bet.matchId}`
  await setDoc(doc(db, 'bets', id), { ...bet, id, createdAt: serverTimestamp() })
}

export function subscribeBets(cb: (bets: Bet[]) => void) {
  return onSnapshot(collection(db, 'bets'), snap => {
    cb(snap.docs.map(d => d.data() as Bet))
  })
}

// ─── Settlements ─────────────────────────────────────────────────────────────

export async function markSettled(key: string, settled: boolean) {
  await setDoc(doc(db, 'settlements', key), { key, settled, updatedAt: serverTimestamp() })
}

export function subscribeSettlements(cb: (s: Record<string, boolean>) => void) {
  return onSnapshot(collection(db, 'settlements'), snap => {
    const map: Record<string, boolean> = {}
    snap.docs.forEach(d => { map[d.data().key] = d.data().settled })
    cb(map)
  })
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  name: string
  createdAt: Timestamp
}

export interface Match {
  id: string
  homeName: string
  awayName: string
  homeFlag: string
  awayFlag: string
  group: string
  kickoff: string
  status: 'upcoming' | 'live' | 'done'
  homeScore: number | null
  awayScore: number | null
}

export interface BetInput {
  userId: string
  matchId: string
  winner: 'home' | 'draw' | 'away'
  winnerName: string
  homeScore: number
  awayScore: number
  amount: number
}

export interface Bet extends BetInput {
  id: string
  createdAt: Timestamp
}
