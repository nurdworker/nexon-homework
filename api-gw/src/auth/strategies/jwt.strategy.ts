import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['RS256'],
      secretOrKey: fs.readFileSync('/app/keys/public.key'),
    });
  }

  async validate(payload: JwtPayload) {
    // 여기서 payload는 JWT 페이로드를 의미.
    // 추가 검증이나 사용자 조회를 원하면 여기서 할 수 있음.
    return payload; // validate가 리턴하는 값이 request.user에 저장됨
  }
}
