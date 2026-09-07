import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { ApiError } from '../lib/api';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const data = new FormData(event.currentTarget);
    try {
      if (mode === 'login') await login(String(data.get('email')), String(data.get('password')));
      else
        await register(
          String(data.get('email')),
          String(data.get('displayName')),
          String(data.get('password')),
        );
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? '/');
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : 'Unable to continue');
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className="eyebrow">Welcome to Reelhouse</p>
        <h1>{mode === 'login' ? 'Sign in' : 'Join the club'}</h1>
        <p>
          {mode === 'login'
            ? 'Continue building your personal watchlist.'
            : 'Save remarkable films for later.'}
        </p>
        <form onSubmit={(event) => void submit(event)}>
          {mode === 'register' && (
            <label>
              Display name
              <input
                name="displayName"
                minLength={2}
                maxLength={100}
                required
                autoComplete="name"
              />
            </label>
          )}
          <label>
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={mode === 'login' ? 'member@reelhouse.test' : ''}
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              minLength={10}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              defaultValue={mode === 'login' ? 'Reelhouse123!' : ''}
            />
            <small>At least 10 characters with uppercase, lowercase, and a number.</small>
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button disabled={busy} className="button button-primary">
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <button
          className="text-button"
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError('');
          }}
        >
          {mode === 'login' ? 'New here? Create an account' : 'Already a member? Sign in'}
        </button>
      </div>
    </main>
  );
}
