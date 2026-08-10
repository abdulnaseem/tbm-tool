import { createHmac, timingSafeEqual } from 'node:crypto';

export const GRAPPLE_ACCESS_COOKIE = 'tbm_grapple_hub_access';

type AccessPayload = {
  programme: 'THE_GRAPPLE_HUB';
  exp: number;
  v: 1;
};

function getSecret() {
  const secret = process.env.GRAPPLE_HUB_SIGNUP_SECRET;

  if (!secret) {
    throw new Error('GRAPPLE_HUB_SIGNUP_SECRET is not configured');
  }

  return secret;
}

function sign(value: string) {
  return createHmac('sha256', getSecret())
    .update(value)
    .digest('base64url');
}

export function createGrappleAccessToken(expiresAt: Date) {
  const payload: AccessPayload = {
    programme: 'THE_GRAPPLE_HUB',
    exp: Math.floor(expiresAt.getTime() / 1000),
    v: 1,
  };

  const encodedPayload = Buffer.from(
    JSON.stringify(payload),
    'utf8',
  ).toString('base64url');

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyGrappleAccessToken(
  token?: string | null,
): AccessPayload | null {
  if (!token) return null;

  const [encodedPayload, suppliedSignature] = token.split('.');

  if (!encodedPayload || !suppliedSignature) return null;

  const expectedSignature = sign(encodedPayload);
  const suppliedBuffer = Buffer.from(suppliedSignature, 'utf8');
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

  if (suppliedBuffer.length !== expectedBuffer.length) return null;

  if (!timingSafeEqual(suppliedBuffer, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    ) as AccessPayload;

    if (
      payload.programme !== 'THE_GRAPPLE_HUB' ||
      payload.v !== 1 ||
      !Number.isFinite(payload.exp)
    ) {
      return null;
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}