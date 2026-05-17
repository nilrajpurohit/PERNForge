import { expect } from 'chai';
import { buildRefreshTokenKey } from '../../utils/redis-key.util.js';

describe('redis-key util', () => {
  it('builds a refresh token key consistently', () => {
    const key = buildRefreshTokenKey(321);
    expect(key).to.equal('refresh_token:321');
  });
});
