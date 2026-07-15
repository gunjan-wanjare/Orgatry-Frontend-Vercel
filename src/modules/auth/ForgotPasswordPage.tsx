import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader2, MailCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { FormField } from '@/components/forms/FormField';
import { authApi } from '@/services/api/auth.api';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/schemas/auth.schemas';
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

export function ForgotPasswordPage() {
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { userId: '' }
  });
  const mutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => toast.success('Password reset request accepted')
  });

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
            Forgot password
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-[#595959] [font-family:Inter,sans-serif]">
            Enter your user ID and we will send a reset request for your Orgatry account.
          </p>
        </header>

        <form
          className="grid gap-5"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values.userId))}
          noValidate
        >
          <FormField
            label="User ID"
            name="userId"
            register={form.register}
            error={form.formState.errors.userId?.message}
            placeholder="Email or Employee ID"
            autoComplete="username"
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
              aria-label={mutation.isPending ? 'Submitting request' : 'Submit request'}
            >
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <MailCheck className="size-4" aria-hidden />
              )}
              {mutation.isPending ? 'Submitting...' : 'Submit request'}
            </LandingButton>
          </motion.div>
        </form>

        <div className="mt-6">
          <Link className={authLinkClassName} to="/login">
            Back to sign in
          </Link>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
