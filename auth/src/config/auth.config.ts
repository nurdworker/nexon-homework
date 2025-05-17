export interface AuthConfig {
  dbUri: string;
  dbUriUser: string;
  dbName: string;
  userName: string;
  password: string;
  maxPoolSize: number;
  minPoolSize: number;
  initCollectionLists: readonly string[];
  testSecret: string;
}

export const authConfig = {
  dbUri: 'mongodb://auth-db:27017',
  dbUriUser: 'mongodb://authService:test123@auth-db:27017/authDb?authSource=authDb',
  dbName: 'authDb',
  userName: 'authService',
  password: 'test123',
  maxPoolSize: 10,
  minPoolSize: 1,
  initCollectionLists: ['users', 'tokenLogs'] as const,
  testSecret: 'muzzi',
} as const satisfies AuthConfig;
