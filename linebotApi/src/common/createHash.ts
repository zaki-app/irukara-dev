import { createHash } from 'crypto';

export const createUserIdHash = (userId: string): string => {
  const userIdHash = createHash('sha256').update(userId).digest('hex');
  return userIdHash;
};
