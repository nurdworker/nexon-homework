export interface ManagerUser {
  email: string;
  password: string;
  nickName: string;
  roles: ('user' | 'operator' | 'auditor' | 'admin')[];
  createdAt: Date;
}

export interface SettingConfig {
  dbUri: string;
  dbUriUser: string;
  dbName: string;
  userName: string;
  password: string;
  maxPoolSize: number;
  minPoolSize: number;
  initCollectionLists: readonly string[];
  managerLists: ManagerUser[];
  testSecret: string;
}

export const settingConfig = {
  dbUri: 'mongodb://auth-db:27017',
  dbUriUser:
    'mongodb://authService:test123@auth-db:27017/authDb?authSource=authDb',
  dbName: 'authDb',
  userName: 'authService',
  password: 'test123',
  maxPoolSize: 10,
  minPoolSize: 1,
  initCollectionLists: ['users', 'tokenLogs', 'signLogs'] as const,
  testSecret: 'muzzi',
  managerLists: [
    {
      email: 'bera@nexon.com',
      password: 'test123', // 실제 mongo-init에서 해시 처리할 예정
      nickName: '베라GM',
      roles: ['operator'],
      createdAt: new Date(),
    },
    {
      email: 'croa@nexon.com',
      password: 'test123',
      nickName: '크로아GM',
      roles: ['auditor'],
      createdAt: new Date(),
    },
    {
      email: 'union@nexon.com',
      password: 'test123',
      nickName: '유니온GM',
      roles: ['operator', 'auditor'],
      createdAt: new Date(),
    },
    {
      email: 'elysium@nexon.com',
      password: 'test123',
      nickName: '엘리시움GM',
      roles: ['admin'],
      createdAt: new Date(),
    },
  ],
} as const satisfies SettingConfig;
