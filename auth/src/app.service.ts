import { Injectable } from '@nestjs/common';
import { KafkaService } from './kafka/kafka.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { readFileSync } from 'fs';
import { join } from 'path';
import { DatabaseService } from './database/database.service';
import { ObjectId } from 'mongodb';
import { UnauthorizedException } from '@nestjs/common';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  nickName: string;
}

interface JwtPayload {
  email: string;
  nickName: string;
  roles: string[];
}

export interface SignUpInfo {
  email: string;
  password: string;
  nickName: string;
}

export interface SignInInfo {
  email: string;
  password: string;
}

const SALT_ROUNDS = 10;

const privateKeyPath = join(__dirname, '..', 'keys', 'private.key');
const privateKey = readFileSync(privateKeyPath, 'utf8');

const publicKeyPath = join(__dirname, '..', 'keys', 'public.key');
const publicKey = readFileSync(publicKeyPath, 'utf8');

const jwtService = new JwtService({
  privateKey,
  signOptions: { algorithm: 'RS256' },
});

const jwtVerifyService = new JwtService({
  publicKey,
  verifyOptions: { algorithms: ['RS256'] },
});

@Injectable()
export class AppService {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly databaseService: DatabaseService,
  ) {}

  getHello(): string {
    console.log('api-gw auth 연결 완료');
    return 'Hello from auth';
  }

  async signUp(signUpInfo: SignUpInfo): Promise<AuthResponse> {
    const now = new Date();
    const midnight = new Date();

    // 자정시간으로 토큰 만료시간 정하기기
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();
    const secondsUntilMidnight = Math.floor(msUntilMidnight / 1000);
    const { email, password, nickName } = signUpInfo;

    // 닉네임 한글 2~6글자 검사
    const nickNameRegex = /^[가-힣]{2,6}$/;
    if (!nickNameRegex.test(nickName)) {
      throw new Error(
        '닉네임은 한글만 사용 가능하며, 2글자 이상 6글자 이하로 입력해주세요.',
      );
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const db = await this.databaseService.connect();
    const usersCollection = db.collection('users');

    const existing = await usersCollection.findOne({ email });
    if (existing) throw new Error('이미 존재하는 이메일입니다.');

    const newUser = {
      email,
      password: hashedPassword,
      nickName,
      roles: ['user'],
      createdAt: new Date(),
    };
    await usersCollection.insertOne(newUser);
    const insertedUser = await usersCollection.findOne({ email });

    const payload: JwtPayload = {
      email: email,
      nickName: nickName,
      roles: ['user'],
    };

    const accessToken = jwtService.sign(payload, {
      expiresIn: secondsUntilMidnight,
    });

    const refreshToken = jwtService.sign(payload, {
      expiresIn: '14d',
    });

    // 토큰 로그 저장
    await this.logToken(insertedUser._id, accessToken, 'access');
    await this.logToken(insertedUser._id, refreshToken, 'refresh');

    // Kafka 이벤트 보내기
    await this.kafkaService.sendMessage('user.signup', {
      userId: insertedUser._id.toString(),
      email,
      nickName,
    });
    return { nickName, accessToken, refreshToken };
  }

  async signIn(signInInfo: SignInInfo): Promise<AuthResponse> {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();
    const secondsUntilMidnight = Math.floor(msUntilMidnight / 1000);
    const { email, password } = signInInfo;

    const db = await this.databaseService.connect();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email });
    if (!user) throw new Error('존재하지 않는 사용자입니다.');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('비밀번호가 일치하지 않습니다.');

    const payload: JwtPayload = {
      email: email,
      nickName: user.nickName,
      roles: user.roles || ['user'],
    };

    const accessToken = jwtService.sign(payload, {
      expiresIn: secondsUntilMidnight,
    });

    const refreshToken = jwtService.sign(payload, {
      expiresIn: '14d',
    });

    // 로그 저장
    await this.logToken(user._id, accessToken, 'access');
    await this.logToken(user._id, refreshToken, 'refresh');

    return { nickName: user.nickName, accessToken, refreshToken };
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    const db = await this.databaseService.connect();
    const tokenLogs = db.collection('tokenLogs');

    // 1. refresh 토큰 로그에서 유효한 토큰인지 확인 (DB에 해시된 토큰으로 저장되어 있음)
    // bcrypt로 해시 비교가 비용이 있으므로, 최근 유효한 토큰만 조회하거나 인덱스 사용 권장
    const logs = await tokenLogs.find({ kind: 'refresh' }).toArray();

    let isValidToken = false;
    for (const log of logs) {
      const match = await bcrypt.compare(refreshToken, log.hashedToken);
      if (match) {
        isValidToken = true;
        break;
      }
    }
    if (!isValidToken) {
      throw new UnauthorizedException('유효하지 않은 refresh token입니다.');
    }

    // 2. 토큰 payload 검증 및 복호화 (만료 검증 포함)
    let payload: JwtPayload;
    try {
      payload = jwtVerifyService.verify(refreshToken, {
        algorithms: ['RS256'],
        // refresh용 비밀키 또는 공개키를 별도로 관리한다면 추가 설정 필요
      });
    } catch (err) {
      console.log(err.message);
      throw new UnauthorizedException('refresh token 검증 실패 또는 만료됨');
    }

    // 3. 새 access 토큰 발급 (자정까지 만료 시간 맞춤)
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();
    const secondsUntilMidnight = Math.floor(msUntilMidnight / 1000);

    const newAccessToken = jwtService.sign(
      {
        email: payload.email,
        nickName: payload.nickName,
        roles: payload.roles,
      },
      {
        expiresIn: secondsUntilMidnight,
        algorithm: 'RS256',
      },
    );

    // 4. 새 access 토큰 로그 기록
    const user = await db.collection('users').findOne({ email: payload.email });
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }
    await this.logToken(user._id, newAccessToken, 'access');

    return { accessToken: newAccessToken };
  }

  // 로그아웃: refresh 토큰 무효화
  async logout(refreshToken: string): Promise<{ message: string }> {
    const db = await this.databaseService.connect();
    const tokenLogs = db.collection('tokenLogs');

    // bcrypt 비교해서 해당 refresh 토큰 해시 로그를 삭제
    const logs = await tokenLogs.find({ kind: 'refresh' }).toArray();

    for (const log of logs) {
      const match = await bcrypt.compare(refreshToken, log.hashedToken);
      if (match) {
        await tokenLogs.deleteOne({ _id: log._id });
        break;
      }
    }

    return { message: '로그아웃 되었습니다.' };
  }

  private async logToken(
    userId: ObjectId,
    token: string,
    kind: 'access' | 'refresh',
  ) {
    const db = await this.databaseService.connect();
    const tokenLogs = db.collection('tokenLogs');

    const hashedToken = await bcrypt.hash(token, SALT_ROUNDS);

    const createdAt = new Date();

    const insertResult = await tokenLogs.insertOne({
      userId,
      kind,
      hashedToken,
      createdAt,
    });

    const logId = insertResult.insertedId;

    // Kafka에 메시지 전송
    await this.kafkaService.sendMessage('user.token', {
      logId,
      userId,
      kind,
      createdAt,
    });
  }
}
