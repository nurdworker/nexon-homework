// //auth packages
// import { JwtService } from '@nestjs/jwt';
// import { join } from 'path';
// import { readFileSync } from 'fs';
// import * as bcrypt from 'bcrypt';
// import { authConfig } from './config/auth.config';
// // import { connectToDatabase } from './db';
// import { ObjectId } from 'mongodb';

// // auth types
// interface JwtPayload {
//   sub: string;
//   username: string;
//   roles: string[];
// }

// interface SignUpInfo {
//   email: string;
//   password: string;
//   nickName: string;
// }

// interface AuthData {
//   nickName: string;
//   accessToken: string;
//   refreshToken: string;
//   message: string;
// }

// // password hashing
// const SALT_ROUNDS: number = 10;

// async function hashPassword(plainTextPassword: string): Promise<string> {
//   const hashed = await bcrypt.hash(plainTextPassword, SALT_ROUNDS);
//   return hashed;
// }

// async function comparePassword(
//   plainTextPassword: string,
//   hashedPassword: string,
// ): Promise<boolean> {
//   return await bcrypt.compare(plainTextPassword, hashedPassword);
// }

// // jwt token
// const privateKeyPath = join(__dirname, '..', 'keys', 'private.key');
// const privateKey = readFileSync(privateKeyPath, 'utf8');

// const jwtService = new JwtService({
//   privateKey,
//   signOptions: {
//     algorithm: 'RS256',
//     expiresIn: '1h',
//   },
// });

// export async function createJwtToken(payload: JwtPayload): Promise<string> {
//   const token = jwtService.sign(payload);
//   return token;
// }

// export async function signUp(signUpInfo: SignUpInfo): Promise<AuthData> {
//   const { email, password, nickName } = signUpInfo;
//   const hashedPassword = await hashPassword(password);

//   // 2. 사용자 데이터 준비
//   const newUser = {
//     email,
//     password: hashedPassword,
//     nickName,
//     roles: ['user'],
//     createdAt: new Date(),
//   };

//   // 3. MongoDB 연결 및 insert
//   const db = await connectToDatabase();
//   const usersCollection = db.collection('users');

//   // 이메일 중복 검사
//   const existing = await usersCollection.findOne({ email });
//   if (existing) {
//     throw new Error('이미 존재하는 이메일입니다.');
//   }

//   await usersCollection.insertOne(newUser);

//   // 4. JWT payload 정의
//   const payload: JwtPayload = {
//     sub: email,
//     username: nickName,
//     roles: ['user'],
//   };

//   // 5. accessToken (1시간)
//   const accessToken = jwtService.sign(payload, {
//     expiresIn: '1h',
//   });

//   // 6. refreshToken (2주)
//   const refreshToken = jwtService.sign(payload, {
//     expiresIn: '14d',
//   });

//   // 7. 응답
//   return {
//     nickName,
//     accessToken,
//     refreshToken,
//     message: 'User registered successfully',
//   };
// }
