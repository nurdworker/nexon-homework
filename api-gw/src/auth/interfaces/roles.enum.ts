export const RolesEnum = {
  User: 'user',
  Admin: 'admin',
} as const;

export type Role = (typeof RolesEnum)[keyof typeof RolesEnum];