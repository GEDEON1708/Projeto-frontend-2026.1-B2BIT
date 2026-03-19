import { z } from 'zod';
import { validateImageInput } from '../../../utils/validateImageInput';

export const postSchema = z.object({
  title: z.string().min(3, 'O titulo deve ter pelo menos 3 caracteres'),
  content: z.string().min(1, 'O conteudo e obrigatorio'),
  image: z
    .string()
    .trim()
    .optional()
    .refine((value) => validateImageInput(value), {
      message: 'Informe uma URL de imagem valida',
    }),
});

export type PostSchema = z.infer<typeof postSchema>;
