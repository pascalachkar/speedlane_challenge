import { createContext, useContext, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../lib/api';
import type { User } from '../lib/types';
interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, displayName: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useQueryClient();
  const me = useQuery({
    queryKey: ['me'],
    queryFn: () => api<{ user: User }>('/auth/me'),
    retry: false,
  });
  const loginMutation = useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      api<{ user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: (data) => client.setQueryData(['me'], data),
  });
  const registerMutation = useMutation({
    mutationFn: (input: { email: string; displayName: string; password: string }) =>
      api<{ user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: (data) => client.setQueryData(['me'], data),
  });
  const logoutMutation = useMutation({
    mutationFn: () => api<void>('/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      client.setQueryData(['me'], null);
      client.removeQueries({ queryKey: ['watchlist'] });
    },
  });
  const user = me.data?.user ?? null;
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: me.isLoading,
        login: async (email, password) =>
          (await loginMutation.mutateAsync({ email, password })).user,
        register: async (email, displayName, password) =>
          (await registerMutation.mutateAsync({ email, displayName, password })).user,
        logout: () => logoutMutation.mutateAsync(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new ApiError(500, 'AuthProvider is missing');
  return context;
}
