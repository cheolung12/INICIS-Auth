export interface AuthRequest {
  mid: string;
  reqSvcCd: string;
  mTxId: string;
  successUrl: string;
  failUrl: string;
  authHash?: string;
  flgFixedUser: 'Y' | 'N';
  userName?: string;
  userPhone?: string;
  userBirth?: string;
  userHash?: string;
  reservedMsg: string;
}

export interface AuthResponse {
  resultCode: string;
  resultMsg: string;
  authRequestUrl: string;
  txId: string;
  token?: string | null;
}
