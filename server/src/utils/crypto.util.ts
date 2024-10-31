import { Injectable, Logger } from '@nestjs/common';
import { KISA_SEED_CBC } from '../../kisa-seed/index';

@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);
  private readonly IV = 'SASKGINICIS00000';

  decryptSeedCBC(encryptedData: string, tokenBase64: string): string {
    try {
      // 입력값 검증
      if (!encryptedData || !tokenBase64) {
        throw new Error('필수 암호화 매개변수가 누락되었습니다.');
      }

      // Base64 디코딩
      const keyBytes = Buffer.from(tokenBase64, 'base64');
      const ivBytes = Buffer.from(this.IV);
      const encryptedBytes = Buffer.from(encryptedData, 'base64');

      // Uint8Array 변환
      const keyDataArray = new Uint8Array(keyBytes);
      const ivDataArray = new Uint8Array(ivBytes);
      const encryptedDataArray = new Uint8Array(encryptedBytes);

      // SEED-CBC 복호화
      const decryptedData = KISA_SEED_CBC.SEED_CBC_Decrypt(
        keyDataArray,
        ivDataArray,
        encryptedDataArray,
        0,
        encryptedDataArray.length,
      );

      // UTF-8로 직접 디코딩
      const result = new TextDecoder('utf-8').decode(decryptedData);

      return result;
    } catch (error) {
      this.logger.error('복호화 실패', {
        error: error.message,
        stack: error.stack,
        details: {
          encryptedDataLength: encryptedData?.length,
          tokenLength: tokenBase64?.length,
        },
      });
      throw error;
    }
  }
}
