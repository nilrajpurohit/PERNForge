export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};

const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(path: string, body: unknown) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  return response.json();
}

export function login(email: string, password: string) {
  return request('/auth/login', { email, password }) as Promise<AuthResponse>;
}

export function register(name: string, email: string, password: string) {
  return request('/auth/register', { name, email, password }) as Promise<AuthResponse>;
}
