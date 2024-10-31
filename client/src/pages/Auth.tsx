import React, { useState, useEffect, useRef } from 'react';
import { authService } from '../services/authService';
import { AuthRequest } from '../types/auth';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);  // hidden form

  useEffect(() => {
    // [Step4] 결과 조회 응답
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data.type === 'AUTH_SUCCESS') {
        console.log('인증 성공:', event.data.data);
      } else if (event.data.type === 'AUTH_FAIL') {
        console.error('인증 실패:', event.data.error);
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, []);

  // 팝업창 오픈 함수 (중앙)
  const popupCenter = () => {
    const width = 400;
    const height = 620;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    return window.open(
      'about:blank',
      'sa_popup',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    );
  };

  // [Step1] 통합인증 요청
  const handleAuth = async () => {
    try {
      setLoading(true);

      const authData: AuthRequest = {
        mid: import.meta.env.VITE_INICIS_MID || 'INIiasTest',
        reqSvcCd: '01',
        mTxId: `${Date.now()}`,
        // 서버 콜백 URL  
        successUrl: import.meta.env.VITE_SUCCESS_URL || 'http://localhost:3000/auth/success',
        failUrl: import.meta.env.VITE_FAIL_URL || 'http://localhost:3000/auth/fail',
        flgFixedUser: 'N',
        reservedMsg: 'isUseToken=Y'
      };

      // userHash, authHash 를 서버에서 생성 후 응답
      const response = await authService.requestAuth(authData);
      console.log('통합 인증 응답:', response);

      // 팝업 창 열기
      const popup = popupCenter();
      if (!popup) {
        alert('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
        return;
      }

      if (formRef.current) {
        formRef.current.target = 'sa_popup';
        formRef.current.mid.value = response.mid;
        formRef.current.reqSvcCd.value = response.reqSvcCd;
        formRef.current.mTxId.value = response.mTxId;
        formRef.current.authHash.value = response.authHash;
        formRef.current.successUrl.value = response.successUrl;
        formRef.current.failUrl.value = response.failUrl;
        formRef.current.flgFixedUser.value = response.flgFixedUser;
        formRef.current.userName.value = response.userName;
        formRef.current.userPhone.value = response.userPhone;
        formRef.current.userBirth.value = response.userBirth;
        formRef.current.userHash.value = response.userHash;
        formRef.current.reservedMsg.value = response.reservedMsg;

        formRef.current.submit();
        popup.focus();
      }

    } catch (error) {
      console.error('인증 요청 실패:', error);
      alert('인증 요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">통합인증 테스트</h2>

      <form
        ref={formRef}
        method="post"
        action="https://sa.inicis.com/auth"
        style={{ display: 'none' }}
      >
        <input type="hidden" name="mid" />
        <input type="hidden" name="reqSvcCd" />
        <input type="hidden" name="mTxId" />
        <input type="hidden" name="authHash" />
        <input type="hidden" name="successUrl" />
        <input type="hidden" name="failUrl" />
        <input type="hidden" name="flgFixedUser" />
        <input type="hidden" name="userName" />
        <input type="hidden" name="userPhone" />
        <input type="hidden" name="userBirth" />
        <input type="hidden" name="userHash" />
        <input type="hidden" name="reservedMsg" />
      </form>

      <button
        onClick={handleAuth}
        disabled={loading}
        className={`
          px-6 py-2 rounded-lg 
          ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}
          text-white font-semibold transition-colors
        `}
      >
        {loading ? '처리중...' : '인증하기'}
      </button>
    </div>
  );
};

