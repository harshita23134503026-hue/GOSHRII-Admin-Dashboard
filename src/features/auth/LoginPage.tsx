import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Eye,
  EyeOff,
  Store,
  ShoppingBag,
  Car,
  PackageSearch,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from './authContext';

// ==========================================
// FORM SCHEMA
// ==========================================

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email or username is required')
    .refine(
      (val) => ['admin', 'store'].includes(val.toLowerCase()) || z.string().email().safeParse(val).success,
      'Please enter a valid email address or username'
    ),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ==========================================
// SERVICE PILLAR CARDS (left panel)
// ==========================================

const servicePillars = [
  {
    icon: ShoppingBag,
    label: 'Grocery',
    stat: '10-min delivery',
    color: 'bg-white/15',
  },
  {
    icon: Car,
    label: 'Rides',
    stat: 'City-wide fleet',
    color: 'bg-white/15',
  },
  {
    icon: PackageSearch,
    label: 'Parcels',
    stat: 'Local P2P',
    color: 'bg-white/15',
  },
];

// ==========================================
// LOGIN PAGE COMPONENT
// ==========================================

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setAuthError(null);

    const result = await login(data.email, data.password);

    if (result.success) {
      setLoginSuccess(true);
      setTimeout(() => navigate(from, { replace: true }), 600);
    } else {
      setAuthError(result.error || 'Authentication failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans antialiased">
      {/* ===========================
          LEFT BRAND PANEL
      =========================== */}
      <div
        className="hidden lg:flex lg:w-[58%] xl:w-[60%] relative flex-col justify-between p-10 xl:p-14 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0E5A3D 0%, #16845B 45%, #1a9e6e 100%)',
        }}
      >
        {/* Decorative mesh blobs */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          {/* Top-right large blob */}
          <div
            className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #a4d7c2 0%, transparent 70%)' }}
          />
          {/* Bottom-left blob */}
          <div
            className="absolute -bottom-40 -left-20 w-[380px] h-[380px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #d1ebe0 0%, transparent 70%)' }}
          />
          {/* Center subtle highlight */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07]"
            style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 60%)' }}
          />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg">
              <Store className="w-6 h-6 text-white stroke-[2]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white tracking-tight leading-none">GOSHRII</p>
              <p className="text-[11px] text-green-200 font-semibold tracking-[0.2em] uppercase mt-0.5">
                Ops Console
              </p>
            </div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight mb-4">
            One platform.
            <br />
            <span className="text-green-200">Three services.</span>
          </h1>
          <p className="text-green-100/80 text-base xl:text-lg leading-relaxed max-w-sm mb-10">
            Manage your entire operations — groceries, ride bookings, and parcel deliveries — from a single unified console.
          </p>

          {/* Service pillar cards */}
          <div className="grid grid-cols-3 gap-3 max-w-sm">
            {servicePillars.map(({ icon: Icon, label, stat, color }) => (
              <div
                key={label}
                className={`${color} backdrop-blur-sm border border-white/20 rounded-xl p-4 flex flex-col items-center text-center gap-2 hover:bg-white/20 transition-colors duration-200`}
              >
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-white text-xs font-semibold">{label}</p>
                <p className="text-green-200/80 text-[10px] leading-tight">{stat}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer hub indicator */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse shrink-0" />
            <span className="text-green-100 text-xs font-medium">Koramangala Hub — Active</span>
            <span className="text-green-200/50 text-xs mx-1">·</span>
            <span className="text-green-200/70 text-xs">Bengaluru</span>
          </div>
        </div>
      </div>

      {/* ===========================
          RIGHT LOGIN FORM PANEL
      =========================== */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-white min-h-screen">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center shadow">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-ink-primary tracking-tight leading-none">GOSHRII</p>
            <p className="text-[10px] text-brand-700 font-semibold tracking-wider uppercase">Ops Console</p>
          </div>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-ink-secondary mt-1.5">
              Sign in to access the GOSHRII Ops Console
            </p>
          </div>

          {/* Auth Error */}
          {authError && (
            <div className="flex items-start gap-2.5 p-3.5 mb-5 bg-red-50 border border-red-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700 font-medium">{authError}</p>
            </div>
          )}

          {/* Success State */}
          {loginSuccess && (
            <div className="flex items-center gap-2.5 p-3.5 mb-5 bg-green-50 border border-green-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-xs text-green-700 font-medium">Authenticated! Redirecting...</p>
            </div>
          )}

          {/* Form */}
          <form
            id="goshrii-login-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-xs font-semibold text-ink-primary">
                Email or Username
              </label>
              <input
                id="login-email"
                type="text"
                autoComplete="username"
                placeholder="admin@goshrii.in or admin"
                {...register('email')}
                className={`w-full px-3.5 py-2.5 text-sm bg-surface-secondary border rounded-xl text-ink-primary placeholder:text-ink-muted transition-all duration-150 outline-none focus:ring-2 focus:bg-white ${
                  errors.email
                    ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500'
                    : 'border-border-light focus:ring-brand-500/20 focus:border-brand-500'
                }`}
              />
              {errors.email && (
                <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-xs font-semibold text-ink-primary">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  {...register('password')}
                  className={`w-full pl-3.5 pr-10 py-2.5 text-sm bg-surface-secondary border rounded-xl text-ink-primary placeholder:text-ink-muted transition-all duration-150 outline-none focus:ring-2 focus:bg-white ${
                    errors.password
                      ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500'
                      : 'border-border-light focus:ring-brand-500/20 focus:border-brand-500'
                  }`}
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-ink-muted hover:text-ink-primary transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5">
              <input
                id="login-remember-me"
                type="checkbox"
                {...register('rememberMe')}
                className="w-4 h-4 rounded border-border-light text-brand-500 focus:ring-brand-500/30 focus:ring-2 cursor-pointer accent-brand-500"
              />
              <label
                htmlFor="login-remember-me"
                className="text-xs text-ink-secondary cursor-pointer select-none"
              >
                Keep me signed in
              </label>
            </div>

            {/* Submit */}
            <button
              id="login-submit-button"
              type="submit"
              disabled={isLoading || loginSuccess}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition-all duration-150 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : loginSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Signed in!
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>


          {/* Demo Credential Cards */}
          <div className="mt-6 space-y-2">
            <p className="text-center text-[10px] font-semibold text-ink-muted uppercase tracking-wider mb-2">Demo Accounts</p>

            {/* Admin */}
            <div className="rounded-xl border border-border-light bg-surface-secondary/60 px-3 py-2.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink-primary">Admin</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-brand-50 text-brand-700 font-semibold border border-brand-200/60">Full Access</span>
              </div>
              <p className="text-ink-muted mt-0.5 font-mono">admin@goshrii.in or admin / admin</p>
            </div>

            {/* Store Manager */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-900">Store Manager</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-semibold border border-amber-300">Commerce Only</span>
              </div>
              <p className="text-amber-700 mt-0.5 font-mono">store@goshrii.in / store@2024</p>
            </div>
          </div>

          <p className="text-center text-[11px] text-ink-muted mt-4">
            GOSHRII Multi-Service Admin Platform · v2.0
          </p>
        </div>
      </div>
    </div>
  );
};
