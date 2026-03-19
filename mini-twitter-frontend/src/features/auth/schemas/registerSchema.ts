import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Digite seu nome com pelo menos 2 caracteres'),
  email: z.string().email('Digite um e-mail válido'),
  password: z.string().min(4, 'A senha deve ter pelo menos 4 caracteres'),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
