import { Film, LogOut, Plus, UserRound } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import styles from './Layout.module.css';
export function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className={styles.shell}>
      <header className={styles.nav}>
        <Link className={styles.brand} to="/">
          <span className={styles.brandMark}>
            <Film size={20} />
          </span>
          Reelhouse
        </Link>
        <nav className={styles.links} aria-label="Main navigation">
          <NavLink className={styles.mobileHide} to="/">
            Browse
          </NavLink>
          {user && <NavLink to="/watchlist">Watchlist</NavLink>}
          {user?.role === 'ADMIN' && (
            <Link className={styles.navCreate} to="/admin/movies/new">
              <Plus size={16} /> Add movie
            </Link>
          )}
          {user ? (
            <button className={styles.navUser} onClick={() => void logout()} title="Sign out">
              <UserRound size={17} />
              <span>{user.displayName}</span>
              <LogOut size={15} />
            </button>
          ) : (
            <Link className="button button-quiet" to="/login">
              Sign in
            </Link>
          )}
        </nav>
      </header>
      <Outlet />
      <footer className={styles.footer}>
        <span>REELHOUSE</span>
        <p>A considered library for people who love cinema.</p>
      </footer>
    </div>
  );
}
