import { add } from '../src/utils/helper';

describe('add()', () => {
  it('adds two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('handles zero', () => {
    expect(add(0, 0)).toBe(0);
  });

  it('handles negative numbers', () => {
    expect(add(-2, 3)).toBe(1);
  });
});

