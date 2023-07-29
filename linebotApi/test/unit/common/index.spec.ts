/* 各モジュールのテスト */

import { createHash } from 'crypto';
import { createUserIdHash } from 'src/common';

describe('module test', () => {
  it('ユーザーIDをハッシュ化', () => {
    const userId = 'reou43420jfeoa';
    const hash = createHash('sha256').update(userId).digest('hex');
    const result = createUserIdHash(userId);
    console.log('結果', result, hash);
    expect(result).toBe(hash);
  });
});
