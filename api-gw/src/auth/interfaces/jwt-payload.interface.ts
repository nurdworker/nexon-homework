export interface JwtPayload {
  sub: string; // 일반적으로 user ID 또는 email
  username: string;
  roles: string[]; // ex: ['user'], ['admin']
}