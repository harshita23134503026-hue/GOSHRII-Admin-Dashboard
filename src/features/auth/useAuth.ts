/**
 * Re-exports useAuth from authContext.
 * Kept in a separate file so Vite Fast Refresh can optimize
 * the AuthProvider component and useAuth hook independently.
 */
export { useAuth } from './authContext';
