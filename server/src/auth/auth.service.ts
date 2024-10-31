import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import axios, { AxiosError } from 'axios';
import { CryptoService } from '../utils/crypto.util';
import { AuthVerifyResponse } from './types/auth.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly validUrls = [
    'https://kssa.inicis.com',
    'https://fcsa.inicis.com',
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
  ) {}

  private get apiKey(): string {
    return (
      this.configService.get<string>('INICIS_API_KEY') ||
      'TGdxb2l3enJDWFRTbTgvREU3MGYwUT09'
    );
  }

  private get mid(): string {
    return this.configService.get<string>('INICIS_MID') || 'INIiasTest';
  }

  async generateAuthHash(mid: string, mTxId: string): Promise<string> {
    try {
      if (!mid || !mTxId) {
        throw new Error('인증 해시 생성에 필요한 파라미터가 누락되었습니다.');
      }

      const data = `${mid}${mTxId}${this.apiKey}`;
      const hash = createHash('sha256').update(data).digest('hex');

      this.logger.debug('인증 해시 생성 완료', { mid, mTxId });
      return hash;
    } catch (error) {
      this.logger.error('인증 해시 생성 실패', {
        error: error.message,
        mid,
        mTxId,
      });
      throw error;
    }
  }

  async generateUserHash(
    userName: string,
    mid: string,
    userPhone: string,
    mTxId: string,
    userBirth: string,
    reqSvcCd: string,
  ): Promise<string> {
    try {
      // 필수 파라미터 검증
      if (
        !userName ||
        !mid ||
        !userPhone ||
        !mTxId ||
        !userBirth ||
        !reqSvcCd
      ) {
        throw new Error('사용자 해시 생성에 필요한 파라미터가 누락되었습니다.');
      }

      const data = `${userName}${mid}${userPhone}${mTxId}${userBirth}${reqSvcCd}`;
      const hash = createHash('sha256').update(data).digest('hex');

      this.logger.debug('사용자 해시 생성 완료', { mid, mTxId });
      return hash;
    } catch (error) {
      this.logger.error('사용자 해시 생성 실패', {
        error: error.message,
        mid,
        mTxId,
      });
      throw error;
    }
  }

  validateAuthRequestUrl(url: string): boolean {
    if (!url) {
      this.logger.warn('인증 요청 URL이 없습니다.');
      return false;
    }
    return this.validUrls.some((validUrl) => url.startsWith(validUrl));
  }

  async verifyAuthResult(authResponse: any): Promise<AuthVerifyResponse> {
    this.logger.debug('인증 결과 검증 시작', { txId: authResponse?.txId });

    try {
      if (!authResponse?.txId) {
        throw new Error('유효하지 않은 인증 응답입니다.');
      }

      const { authRequestUrl, txId, token } = authResponse;

      if (!this.validateAuthRequestUrl(authRequestUrl)) {
        throw new Error('유효하지 않은 인증 요청 URL입니다.');
      }

      const result = await this.getResultData(
        authRequestUrl,
        txId,
        authResponse,
      );

      if (token && this.hasEncryptedFields(result)) {
        const decryptedResult = await this.decryptUserData(result, token);
        this.logger.debug('인증 데이터 복호화 완료');
        return decryptedResult;
      }

      return result;
    } catch (error) {
      if (error?.response?.data?.resultCode === '9025') {
        return authResponse;
      }
      this.logger.error('인증 결과 검증 실패', {
        error: error.message,
        txId: authResponse?.txId,
      });
      throw error;
    }
  }

  private async decryptUserData(result: any, token: string) {
    const decryptedData: any = {
      resultCode: result.resultCode,
      resultMsg: result.resultMsg ? decodeURIComponent(result.resultMsg) : '',
    };

    const fieldsToDecrypt = ['userName', 'userPhone', 'userBirth', 'userCi'];

    for (const field of fieldsToDecrypt) {
      if (result[field]) {
        try {
          const decrypted = this.cryptoService.decryptSeedCBC(
            result[field],
            token,
          );
          decryptedData[field] = decrypted;
          this.logger.debug(`${field} 복호화 성공`);
        } catch (error) {
          this.logger.error(`${field} 복호화 실패`, { error: error.message });
          decryptedData[field] = result[field];
        }
      }
    }

    return decryptedData;
  }

  private hasEncryptedFields(result: any): boolean {
    return ['userName', 'userPhone', 'userBirth', 'userCi'].some(
      (field) => !!result[field],
    );
  }

  private async getResultData(
    authRequestUrl: string,
    txId: string,
    originalResponse: any,
  ) {
    try {
      const response = await axios.post(
        authRequestUrl,
        {
          mid: this.mid,
          txId,
          timestamp: Date.now(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Origin: 'http://localhost:3000',
            Referer: 'http://localhost:3000',
          },
          timeout: 10000, // 10초 타임아웃
        },
      );

      this.logger.debug('인증 결과 조회 성공', { txId });
      return response.data;
    } catch (error) {
      if (
        error instanceof AxiosError &&
        error.response?.data?.resultCode === '9025'
      ) {
        return originalResponse;
      }
      this.logger.error('인증 결과 조회 실패', {
        error: error.message,
        txId,
      });
      throw error;
    }
  }
}
