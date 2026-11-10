/**
 * Users created by `prisma/seed.ts`. Requires `npm run db:seed` to have
 * been run against the local database.
 */
export const seededUsers = {
  admin: { username: "admin", password: "!password123" },
  jane: { username: "jane", password: "!password123" },
} as const;

export type SeededUsername = keyof typeof seededUsers;
