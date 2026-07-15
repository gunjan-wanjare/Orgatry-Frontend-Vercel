import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader2, LogIn } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FormField } from '@/components/forms/FormField';
import { authApi } from '@/services/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { loginSchema, type LoginFormValues } from '@/schemas/auth.schemas';
import { LandingButton } from '@/modules/landing/shared/LandingButton';
import { AuthLayout } from './AuthLayout';
import { authCardClassName, authInputClassName, authLabelClassName, authLinkClassName } from './auth-ui';
import { cn } from '@/lib/utils';

const cardMotion = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const }
  }
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);
  const abortControllerRef = useRef<AbortController | null>(null);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userId: '',
      password: ''
    }
  });

  const mutation = useMutation({
    mutationFn: (values: LoginFormValues) => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
      return authApi.login(values, abortControllerRef.current.signal);
    },
    onSuccess: (session) => {
      setSession(session);
      toast.success('Welcome back', { description: 'Session established securely.' });
      const target = session.user.forcePasswordReset
        ? '/change-password'
        : ((location.state as { from?: Location } | null)?.from?.pathname ?? '/dashboard');
      navigate(target, { replace: true });
    },
    onError: (error) => {
      if (error.name !== 'CanceledError') {
        toast.error(error.message);
      }
    }
  });

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  const submit = (values: LoginFormValues) => {
    if (mutation.isPending) {
      return;
    }

    mutation.mutate(values);
  };

  return (
    <AuthLayout>
      <motion.div
        className={authCardClassName}
        variants={cardMotion}
        initial="hidden"
        animate="visible"
      >
        <header className="mb-7">
          <h2 className="m-0 text-[28px] font-bold leading-tight text-[#171717] [font-family:Manrope,sans-serif]">
            Sign in
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-[#595959] [font-family:Inter,sans-serif]">
            Use your email or employee ID and password to access Orgatry.
          </p>
        </header>

        <form className="grid gap-5" onSubmit={form.handleSubmit(submit)} noValidate>
          <FormField
            label="Email / Employee ID"
            name="userId"
            register={form.register}
            error={form.formState.errors.userId?.message}
            placeholder="Email or Employee ID"
            autoComplete="username"
            labelClassName={authLabelClassName}
            inputClassName={authInputClassName}
          />
          <FormField
            label="Password"
            name="password"
            type="password"
            register={form.register}
            error={form.formState.errors.password?.message}
            placeholder="Password"
            autoComplete="current-password"
            labelClassName={authLabelClassName}
            inputClassName={authInputClassName}
          />

          <motion.div whileHover={{ scale: mutation.isPending ? 1 : 1.01 }} whileTap={{ scale: 0.99 }}>
            <LandingButton
              type="submit"
              variant="primary"
              disabled={mutation.isPending}
              className={cn(
                'mt-1 w-full shadow-[0_8px_24px_rgba(34,197,94,0.28)]',
                'focus-visible:ring-offset-white'
              )}
              aria-label={mutation.isPending ? 'Signing in' : 'Sign in'}
            >
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <LogIn className="size-4" aria-hidden />
              )}
              {mutation.isPending ? 'Signing in...' : 'Sign in'}
            </LandingButton>
          </motion.div>
        </form>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Link className={authLinkClassName} to="/forgot-password">
            Forgot password?
          </Link>
          <Link className="text-sm text-[#8b8b8b] transition-colors hover:text-[#171717] [font-family:Inter,sans-serif]" to="/">
            Back to home
          </Link>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
