import { db } from './firebase'
import { collection, getDocs, setDoc, doc } from 'firebase/firestore'

const DEFAULT_MATCHES = [
  { id:'kor_bra', homeName:'대한민국', awayName:'브라질', homeFlag:'🇰🇷', awayFlag:'🇧🇷', group:'조별리그 E조', kickoff:'2026-06-13T03:00:00Z', status:'upcoming', homeScore:null, awayScore:null },
  { id:'kor_sen', homeName:'대한민국', awayName:'세네갈', homeFlag:'🇰🇷', awayFlag:'🇸🇳', group:'조별리그 E조', kickoff:'2026-06-17T06:00:00Z', status:'upcoming', homeScore:null, awayScore:null },
  { id:'kor_por', homeName:'대한민국', awayName:'포르투갈', homeFlag:'🇰🇷', awayFlag:'🇵🇹', group:'조별리그 E조', kickoff:'2026-06-21T00:00:00Z', status:'upcoming', homeScore:null, awayScore:null },
  { id:'usa_mex', homeName:'미국', awayName:'멕시코', homeFlag:'🇺🇸', awayFlag:'🇲🇽', group:'조별리그 A조', kickoff:'2026-06-11T22:00:00Z', status:'upcoming', homeScore:null, awayScore:null },
  { id:'bra_arg', homeName:'브라질', awayName:'아르헨티나', homeFlag:'🇧🇷', awayFlag:'🇦🇷', group:'조별리그 E조', kickoff:'2026-06-15T02:00:00Z', status:'upcoming', homeScore:null, awayScore:null },
  { id:'ger_fra', homeName:'독일', awayName:'프랑스', homeFlag:'🇩🇪', awayFlag:'🇫🇷', group:'조별리그 D조', kickoff:'2026-06-14T20:00:00Z', status:'upcoming', homeScore:null, awayScore:null },
  { id:'eng_esp', homeName:'잉글랜드', awayName:'스페인', homeFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayFlag:'🇪🇸', group:'조별리그 B조', kickoff:'2026-06-16T23:00:00Z', status:'upcoming', homeScore:null, awayScore:null },
  { id:'jpn_ger', homeName:'일본', awayName:'독일', homeFlag:'🇯🇵', awayFlag:'🇩🇪', group:'조별리그 C조', kickoff:'2026-06-14T00:00:00Z', status:'upcoming', homeScore:null, awayScore:null },
  { id:'por_uru', homeName:'포르투갈', awayName:'우루과이', homeFlag:'🇵🇹', awayFlag:'🇺🇾', group:'조별리그 F조', kickoff:'2026-06-12T02:00:00Z', status:'upcoming', homeScore:null, awayScore:null },
  { id:'arg_mor', homeName:'아르헨티나', awayName:'모로코', homeFlag:'🇦🇷', awayFlag:'🇲🇦', group:'조별리그 G조', kickoff:'2026-06-13T23:00:00Z', status:'upcoming', homeScore:null, awayScore:null },
]

export async function seedMatchesIfEmpty() {
  const snap = await getDocs(collection(db, 'matches'))
  if (!snap.empty) return
  for (const m of DEFAULT_MATCHES) {
    await setDoc(doc(db, 'matches', m.id), m)
  }
}