import { createHash } from 'crypto';

export const createUserIdHash = (userId: string): string => {
  const userIdHash = createHash('sha256').update(userId).digest('hex');
  console.log('関数内', userIdHash);
  return userIdHash;
};
