# INICIS 통합인증

## 공식문서
https://manual.inicis.com/sa/auth.html#popup_28

## 구조
```tree
project/
├── client/                # React Frontend
│   ├── src/
│   │   ├── pages/         
│   │   ├── services/      # API
│   │   └── types/         
│   └── package.json
│
├── server/                # NestJS Backend
│   ├── src/
│   │   ├── auth/          # 인증 모듈
│   │   ├── utils/         
│   │   └── kisa-seed/     # SEED 암복호화 모듈
│   └── package.json
```

## 실행
```bash
# client
cd client
npm i
npm run dev

# server
cd server
npm i
npm run start:dev
```

## 인증 프로세스 흐름

```mermaid
sequenceDiagram
   participant User as 사용자
   participant Client as Frontend
   participant Server as Backend
   participant INICIS as INICIS 서버
   
   %% Step 1: 인증 요청
   User->>Client: 인증 버튼 클릭
   Client->>Server: POST /api/auth/request
   Note over Server: authHash 생성
   Server-->>Client: 응답 (해시값 포함)
   
   %% Step 2: INICIS 팝업
   Client->>INICIS: Hidden Form Submit
   INICIS-->>User: 인증 팝업 표시
   
   %% Step 3: 본인인증
   User->>INICIS: 이름, 전화번호, 생년월일 입력 (figFixedUser='Y'로 고정값도 사용 가능)
   User->>INICIS: 본인인증 수행
   
   %% Step 4: 인증 결과 처리
   INICIS-->>Client: 인증 결과 리다이렉트 (AuthCallback)
   Client->>Server: POST /api/auth/verify
   
   %% Step 5: 결과 검증
   Server->>INICIS: 인증 결과 조회
   INICIS-->>Server: 암호화된 사용자 정보
   Note over Server: SEED-CBC 복호화 수행
   
   %% Step 6: 최종 응답
   Server-->>Client: 검증 결과 응답
   Client-->>User: 인증 완료 메시지
```

## 환경설정
### 1. Frontend(.env)
```bash
# INICIS 가맹점 ID
VITE_INICIS_MID=xxxxx

# 콜백 URL 설정
VITE_SUCCESS_URL=http://localhost:3000/auth/success    # 개발환경
# VITE_SUCCESS_URL=http://서버도메인:3000/auth/success  # 운영환경
VITE_FAIL_URL=http://localhost:3000/auth/fail         # 개발환경
# VITE_FAIL_URL=http://서버도메인:3000/auth/fail       # 운영환경
```
- 환경변수가 없을시 테스트 ID가 적용됩니다.

### 2. Backend(.env)
```bash
# INICIS 가맹점 ID
INICIS_MID=xxxxx

# INICIS API Key
INICIS_API_KEY=xxxxx
```
- 환경변수가 없을시 테스트키와 테스트 ID가 적용됩니다.

