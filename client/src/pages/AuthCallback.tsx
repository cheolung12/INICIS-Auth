import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

export const AuthCallback: React.FC = () => {
  const location = useLocation();
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    const handleAuthResponse = async () => {
      try {
        // [Step2] 통합인증 응답
        const params = new URLSearchParams(location.search);
        const authResponse = {
          resultCode: params.get('resultCode') ?? '',
          resultMsg: params.get('resultMsg') ?? '',
          authRequestUrl: params.get('authRequestUrl') ?? '',
          txId: params.get('txId') ?? '',
          token: params.get('token'),
        };

        if (authResponse.resultCode === '0000') {
          try {
            // [Step3] 결과조회 요청
            const verifyResult = await authService.verifyAuth(authResponse);

            // 부모 창에 인증 성공 메시지를 보내고, 일정 시간 후 현재 창 닫기
            if (window.opener) {
              window.opener.postMessage({
                type: 'AUTH_SUCCESS',
                data: verifyResult
              }, window.location.origin);
              setTimeout(() => window.close(), 500);
            }
          } catch (error) {
            console.error('인증 검증 실패:', error);
            setError('인증 검증 중 오류가 발생했습니다.');
          }
        } else {
          const errorMsg = decodeURIComponent(authResponse.resultMsg);
          setError(`인증 실패: ${errorMsg}`);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setError('인증 처리 중 오류가 발생했습니다.');
      }
    };

    handleAuthResponse();
  }, [location]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      {error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <div className="text-gray-700 flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
          <div>인증 처리 중...</div>
        </div>
      )}
    </div>
  );
};
