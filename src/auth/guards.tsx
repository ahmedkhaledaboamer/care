import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { Role } from '../api/types';
import { useAuth } from './AuthContext';
import { homeFor } from './permissions';
import { PageLoader } from '../components/ui/Spinner';

/** Requires a logged-in user; optionally restricts to roles. */
export function RequireAuth({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { isAuthenticated, isRestoring, user } = useAuth();
  const location = useLocation();

  if (isRestoring) return <PageLoader />;
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/forbidden" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

/** Login/signup pages: bounce authenticated users to their home. */
export function GuestOnly({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) return <Navigate to={homeFor(user)} replace />;
  return <>{children}</>;
}
