import { sumTest } from './testFunc';

test('add 1 + 2 to equal 3', () => {
  expect(sumTest(1, 2)).toBe(3);
});
