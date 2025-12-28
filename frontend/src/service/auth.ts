import { apiRequest, saveAuthToken, clearAuthToken } from "./api";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function signupWithEmail(email: string, password: string, name: string): Promise<User> {
  const response = await apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name })
  });
  
  saveAuthToken(response.token);
  return response.user;
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  
  saveAuthToken(response.token);
  return response.user;
}

export async function loginWithGoogle(): Promise<User> {
  // Google OAuth would need to be implemented on backend
  // For now, throw an error
  throw new Error('Google login not implemented yet. Please use email/password.');
}

export async function logout(): Promise<void> {
  await apiRequest('/auth/logout', { method: 'POST' });
  clearAuthToken();
}

export async function resetPassword(email: string): Promise<void> {
  await apiRequest('/auth/reset-password-request', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await apiRequest('/auth/me');
    return response.user;
  } catch (error) {
    clearAuthToken();
    return null;
  }
}
