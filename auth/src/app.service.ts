import { Injectable } from '@nestjs/common';
import { KafkaService } from './kafka/kafka.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { readFileSync } from 'fs';
import { join } from 'path';
import { DatabaseService } from './database/database.service';
import { ObjectId } from 'mongodb';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  nickName: string;
}

interface JwtPayload {
  sub: string;
  username: string;
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

const jwtService = new JwtService({
  privateKey,
  signOptions: { algorithm: 'RS256' },
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
      sub: email,
      username: nickName,
      roles: ['user'],
    };

    const accessToken = jwtService.sign(payload, {
      expiresIn: secondsUntilMidnight,
    });

    const refreshToken = jwtService.sign(payload, {
      expiresIn: '14d',
    });

    // 토큰 로그 저장
    await this.logToken(email, insertedUser._id, accessToken, 'access');
    await this.logToken(email, insertedUser._id, refreshToken, 'refresh');

    // Kafka 이벤트 보내기
    await this.kafkaService.sendMessage('user-signup-events', {
      event: 'user_signup',
      userId: insertedUser._id.toString(),
      email,
      nickName,
      createdAt: insertedUser.createdAt.toISOString(),
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
      sub: email,
      username: user.nickName,
      roles: user.roles || ['user'],
    };

    const accessToken = jwtService.sign(payload, {
      expiresIn: secondsUntilMidnight,
    });

    const refreshToken = jwtService.sign(payload, {
      expiresIn: '14d',
    });

    // 로그 저장
    await this.logToken(email, user._id, accessToken, 'access');
    await this.logToken(email, user._id, refreshToken, 'refresh');

    return { nickName: user.nickName, accessToken, refreshToken };
  }

  private async logToken(
    email: string,
    userId: ObjectId,
    token: string,
    kind: 'access' | 'refresh',
  ) {
    const db = await this.databaseService.connect();
    const tokenLogs = db.collection('tokenLogs');

    const hashedToken = await bcrypt.hash(token, SALT_ROUNDS);

    const createdAt = new Date();

    const insertResult = await tokenLogs.insertOne({
      email,
      userId,
      kind,
      hashedToken,
      createdAt,
    });

    const logId = insertResult.insertedId;

    // Kafka에 메시지 전송
    await this.kafkaService.sendMessage('token-log-events', {
      logId,
      userId,
      email,
      kind,
      createdAt,
    });
  }
}
