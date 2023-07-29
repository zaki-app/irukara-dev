/* リクエストがLINEプラットフォームからか検証 */

import { LineInspection } from 'src/common';
import { messageEventData, testSignature } from 'test/unit/unitTestData/common';

describe('request is LINE?', () => {
  // falseが返却されたらOK
  it('著名の検証', () => {
    const signature = testSignature;
    const msgEvent = messageEventData;

    const result = new LineInspection().verifySignature(
      signature,
      JSON.stringify(msgEvent),
    );
    expect(result).toBeFalsy();
  });
});
