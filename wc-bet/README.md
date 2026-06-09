# ⚽ WC 2026 BET

친구들과 2026 FIFA 월드컵 스코어를 예측하고 실제 금액으로 베팅하는 웹앱.

## 기능
- 이메일/비밀번호 회원가입 및 로그인
- 경기별 승자 + 정확한 스코어 예측 베팅
- 실시간 동기화 (베팅하면 모든 친구 화면에 즉시 반영)
- 풀 방식 정산 (스코어 정확히 맞춘 사람들이 전체 베팅액 나눔)
- 손익 랭킹 보드
- 친구별 정산 내역 (정산 완료 체크)
- 관리자: 경기 결과 직접 입력

---

## 배포 방법

### 1. Firebase 프로젝트 생성
1. https://console.firebase.google.com → 새 프로젝트
2. **Authentication** → 이메일/비밀번호 활성화
3. **Firestore** → 데이터베이스 만들기 (프로덕션 모드)
4. 프로젝트 설정 → 웹 앱 추가 → Firebase SDK 설정값 복사

### 2. 환경변수 설정
```bash
cp .env.local.example .env.local
```
`.env.local`에 Firebase 설정값 붙여넣기.

`NEXT_PUBLIC_ADMIN_UID`는 본인의 Firebase UID (나중에 로그인 후 Firestore users 컬렉션에서 확인).

### 3. Firestore 보안 규칙 적용
Firebase Console → Firestore → 규칙 탭에 `firestore.rules` 내용 붙여넣기.
`REPLACE_WITH_YOUR_ADMIN_UID` 부분을 본인 UID로 교체.

### 4. 경기 데이터 초기 입력
Firebase Console → Firestore → `matches` 컬렉션 수동 생성.
`scripts/seedMatches.ts`에 있는 JSON 데이터를 각 문서로 추가.

필드 예시:
```
id: "kor_bra"
homeName: "대한민국"
awayName: "브라질"
homeFlag: "🇰🇷"
awayFlag: "🇧🇷"
group: "조별리그 E조"
kickoff: "2026-06-13T03:00:00Z"
status: "upcoming"
homeScore: null
awayScore: null
```

### 5. Vercel 배포
```bash
npm install -g vercel
vercel
```
또는 GitHub에 push 후 vercel.com에서 import.
환경변수는 Vercel 대시보드 → Settings → Environment Variables에 입력.

---

## 개발 실행
```bash
npm install
npm run dev
```

## 기술 스택
- Next.js 14 (App Router)
- TypeScript
- Firebase (Auth + Firestore)
- Vercel
