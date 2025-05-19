import * as jwt from 'jsonwebtoken';

export function decodeJwtPayload(
  authHeader: string,
): Record<string, any> | null {
  try {
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    const payload = jwt.decode(token);
    if (!payload || typeof payload !== 'object') return null;

    return payload;
  } catch (error) {
    console.error('[utils] JWT 디코딩 실패:', error);
    return null;
  }
}
