import { createHmac } from 'node:crypto';

const secret = process.env.GRAPPLE_HUB_SIGNUP_SECRET;

if (!secret) {
  console.error('Missing GRAPPLE_HUB_SIGNUP_SECRET.');
  process.exit(1);
}

const daysArg = process.argv.find((arg) =>
  arg.startsWith('--days='),
);

const days = daysArg
  ? Number(daysArg.split('=')[1])
  : 90;

if (!Number.isFinite(days) || days <= 0) {
  console.error('--days must be a positive number.');
  process.exit(1);
}

const baseUrl =
  process.env.SIGNUP_BASE_URL ||
  'https://signup.thebutterflymovement.health';

const expiresAt = new Date(
  Date.now() + days * 24 * 60 * 60 * 1000,
);

const payload = {
  programme: 'THE_GRAPPLE_HUB',
  exp: Math.floor(expiresAt.getTime() / 1000),
  v: 1,
};

const encodedPayload = Buffer.from(
  JSON.stringify(payload),
  'utf8',
).toString('base64url');

const signature = createHmac(
  'sha256',
  secret,
)
  .update(encodedPayload)
  .digest('base64url');

const token = `${encodedPayload}.${signature}`;

console.log('');
console.log('Private The Grapple Hub signup link:');
console.log('');
console.log(
  `${baseUrl}/the-grapple-hub?access=${token}`,
);
console.log('');
console.log(`Expires: ${expiresAt.toISOString()}`);
console.log('');