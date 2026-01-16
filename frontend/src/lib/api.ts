export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000';

const toBearer = (token: string) =>
  token.startsWith('Bearer ') ? token : `Bearer ${token}`;

export async function apiClient(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = toBearer(token);
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
}

export function setStoredAuth(token: string, user?: unknown) {
  const bearer = toBearer(token);
  localStorage.setItem('jwt', bearer);
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

export function clearStoredAuth() {
  localStorage.removeItem('jwt');
  localStorage.removeItem('user');
}
