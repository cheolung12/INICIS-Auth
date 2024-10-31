export interface AuthRequestDto {
  mid: string;
  reqSvcCd: string;
  mTxId: string;
  successUrl: string;
  failUrl: string;
  flgFixedUser: 'Y' | 'N';
  userName?: string;
  userPhone?: string;
  userBirth?: string;
  userHash?: string;
  reservedMsg: string;
}

export interface AuthResponseDto {
  resultCode: string;
  resultMsg: string;
  authRequestUrl: string;
  txId: string;
  token?: string;
}

export interface AuthVerifyResponse {
  resultCode: string;
  resultMsg: string;
  userName?: string;
  userPhone?: string;
  userBirth?: string;
  userCi?: string;
  [key: string]: any;
}
