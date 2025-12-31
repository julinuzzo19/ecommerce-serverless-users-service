export const Tables = {
  USERS: process.env.USERS_TABLE!,
} as const;

export const Indexes = {
  USERS_EMAIL: "EmailIndex",
} as const;
