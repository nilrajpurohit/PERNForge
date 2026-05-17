import { createTokens } from '../../services/auth.service.js';

test('createTokens returns access and refresh tokens', () => {
  const tokens = createTokens(123);

  expect(tokens).toHaveProperty('accessToken');
  expect(tokens).toHaveProperty('refreshToken');
  expect(tokens.accessToken).toEqual(expect.any(String));
  expect(tokens.refreshToken).toEqual(expect.any(String));
});
