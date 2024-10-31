import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CryptoService } from 'src/utils/crypto.util';

@Module({
  controllers: [AuthController],
  providers: [AuthService, CryptoService],
})
export class AuthModule {}
