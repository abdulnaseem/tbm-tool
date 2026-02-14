// web-admin/src/lib/apiClient.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    // 401/403 will be handled by caller
    throw new Error(`API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}
