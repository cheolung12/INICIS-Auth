import {
  Controller,
  Post,
  Body,
  Query,
  Res,
  Req,
  Logger,
  All,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import {
  AuthRequestDto,
  AuthResponseDto,
  AuthVerifyResponse,
} from './types/auth.types';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('api/auth/request')
  async requestAuth(@Body() authData: AuthRequestDto) {
    this.logger.log('통합인증요청 수신: ' + JSON.stringify(authData));

    const authHash = await this.authService.generateAuthHash(
      authData.mid,
      authData.mTxId,
    );

    let userHash = '';
    if (authData.flgFixedUser === 'Y') {
      userHash = await this.authService.generateUserHash(
        authData.userName,
        authData.mid,
        authData.userPhone,
        authData.mTxId,
        authData.userBirth,
        authData.reqSvcCd,
      );
    }

    const response = {
      ...authData,
      authHash,
      userHash,
    };

    this.logger.log('통합인증요청 응답: ' + JSON.stringify(response));
    return response;
  }

  @All('auth/success')
  async handleSuccess(
    @Body() body: Record<string, any>,
    @Query() query: Record<string, any>,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const params = { ...query, ...body };

    const clientUrl = new URL('/auth/callback', 'http://localhost:5173');
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        clientUrl.searchParams.append(key, value.toString());
      }
    });

    return res.redirect(clientUrl.toString());
  }

  @Post('api/auth/verify')
  async verifyAuth(
    @Body() authResponse: AuthResponseDto,
  ): Promise<AuthVerifyResponse> {
    try {
      const verifyResult =
        await this.authService.verifyAuthResult(authResponse);
      this.logger.log('결과 조회 응답:', verifyResult);
      return verifyResult;
    } catch (error) {
      this.logger.error('결과 조회 실패:', error);
      throw error;
    }
  }
}
