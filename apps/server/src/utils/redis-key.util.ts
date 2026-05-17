export function buildRefreshTokenKey(userId: number) {
  return `refresh_token:${userId}`;
}
