import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Mail, LockKeyhole } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { InlineMessage } from '../../../components/ui/InlineMessage';
import { Input } from '../../../components/ui/Input';
import { Spinner } from '../../../components/ui/Spinner';
import { loginRequest } from '../api/login';
import { loginSchema, type LoginSchema } from '../schemas/loginSchema';
import { useAuthStore } from '../../../stores/auth-store';
import { getErrorMessage } from '../../../utils/getErrorMessage';

type LoginFormProps = {
  onGoToRegister: () => void;
};

export function LoginForm({ onGoToRegister }: LoginFormProps) {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      setSession(data);
      navigate('/feed');
    },
  });

  const onSubmit = (values: LoginSchema) => {
    loginMutation.mutate(values);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <h2 className="text-4xl font-bold leading-tight text-white sm:text-5xl">Olá, de novo!</h2>
        <p className="mt-3 text-lg text-slate-300">
          Por favor, insira os seus dados para fazer login.
        </p>
      </div>

      <FormField label="E-mail" error={errors.email?.message}>
        <div className="relative">
          <Input placeholder="Insira o seu e-mail" {...register('email')} className="pr-12" />
          <Mail className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        </div>
      </FormField>

      <FormField label="Senha" error={errors.password?.message}>
        <div className="relative">
          <Input
            type="password"
            placeholder="Insira a sua senha"
            {...register('password')}
            className="pr-12"
          />
          <LockKeyhole className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        </div>
      </FormField>

      {loginMutation.isError ? (
        <InlineMessage
          message={getErrorMessage(loginMutation.error, 'Credenciais inválidas. Tente novamente.')}
        />
      ) : null}

      <Button type="submit" fullWidth disabled={loginMutation.isPending}>
        {loginMutation.isPending ? (
          <span className="flex items-center gap-2">
            <Spinner />
            Entrando...
          </span>
        ) : (
          'Continuar'
        )}
      </Button>

      <p className="text-center text-sm text-slate-300">
        Ainda não tem conta?{' '}
        <button
          type="button"
          onClick={onGoToRegister}
          className="font-semibold text-brand-400 hover:text-brand-500"
        >
          Cadastre-se
        </button>
      </p>
    </form>
  );
}
