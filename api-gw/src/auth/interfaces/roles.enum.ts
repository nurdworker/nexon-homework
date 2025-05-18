export const RolesEnum = {
  User: 'user',
  Operator: 'operator',
  Auditor: 'auditor',
  Admin: 'admin',
} as const;

export type Role = (typeof RolesEnum)[keyof typeof RolesEnum];
