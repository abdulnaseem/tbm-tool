// web-admin/src/lib/config
// export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

// export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// web-admin/src/lib/config.ts
const configuredApiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

export const API_BASE =
  configuredApiBase || 'http://localhost:4000/api';

if (!API_BASE) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured');
}