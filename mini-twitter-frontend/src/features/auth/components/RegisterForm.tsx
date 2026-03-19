import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { InlineMessage } from '../../../components/ui/InlineMessage';
import { Input } from '../../../components/ui/Input';
import { Spinner } from '../../../components/ui/Spinner';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { registerRequest } from '../api/register';
import { registerSchema, type RegisterSchema } from '../schemas/registerSchema';

type RegisterFormProps = {
  onGoToLogin: () => void;
};

export function RegisterForm({ onGoToLogin }: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: () => {
      reset();
      onGoToLogin();
    },
  });

  const onSubmit = (values: RegisterSchema) => {
    registerMutation.mutate(values);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <h2 className="text-4xl font-bold leading-tight text-white sm:text-5xl">Olá, vamos começar!</h2>
        <p className="mt-3 text-lg text-slate-300">
          Por favor, insira os dados solicitados para fazer cadastro.
        </p>
      </div>

      <FormField label="Nome" error={errors.name?.message}>
        <div className="relative">
          <Input placeholder="Insira o seu nome" {...register('name')} className="pr-12" />
          <UserRound className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        </div>
      </FormField>

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

      {registerMutation.isError ? (
        <InlineMessage
          message={getErrorMessage(
            registerMutation.error,
            'Não foi possível cadastrar. Verifique os dados informados.',
          )}
        />
      ) : null}

      <Button type="submit" fullWidth disabled={registerMutation.isPending}>
        {registerMutation.isPending ? (
          <span className="flex items-center gap-2">
            <Spinner />
            Cadastrando...
          </span>
        ) : (
          'Continuar'
        )}
      </Button>

      <p className="text-center text-sm text-slate-300">
        Já possui conta?{' '}
        <button
          type="button"
          onClick={onGoToLogin}
          className="font-semibold text-brand-400 hover:text-brand-500"
        >
          Faça login
        </button>
      </p>
    </form>
  );
}
