import { jest } from '@jest/globals';

jest.unstable_mockModule('../../services/user.service.js', () => ({
  findUserByEmail: jest.fn(),
  findUserById: jest.fn()
}));

jest.unstable_mockModule('../../services/redis.service.js', () => ({
  buildRefreshTokenKey: jest.fn(),
  getRefreshToken: jest.fn(),
  revokeRefreshToken: jest.fn(),
  storeRefreshToken: jest.fn()
}));

const { createTokens } = await import('../../services/auth.service.js');

test('createTokens returns access and refresh tokens', () => {
  const tokens = createTokens(123);

  expect(tokens).toHaveProperty('accessToken');
  expect(tokens).toHaveProperty('refreshToken');
  expect(tokens.accessToken).toEqual(expect.any(String));
  expect(tokens.refreshToken).toEqual(expect.any(String));
});
