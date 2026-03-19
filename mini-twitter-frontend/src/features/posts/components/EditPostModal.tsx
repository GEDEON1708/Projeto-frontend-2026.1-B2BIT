import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/Button';
import { InlineMessage } from '../../../components/ui/InlineMessage';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Spinner } from '../../../components/ui/Spinner';
import { Textarea } from '../../../components/ui/Textarea';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { validateImageUrl } from '../../../utils/validateImageInput';
import { updatePost } from '../api/updatePost';
import { postSchema, type PostSchema } from '../schemas/postSchema';
import type { Post } from '../types/post';

type EditPostModalProps = {
  post: Post | null;
  search: string;
  onClose: () => void;
};

export function EditPostModal({ post, search, onClose }: EditPostModalProps) {
  const queryClient = useQueryClient();
  const isOpen = Boolean(post);
  const [isValidatingImage, setIsValidatingImage] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
      image: '',
    },
  });

  useEffect(() => {
    if (post) {
      reset({
        title: post.title,
        content: post.content,
        image: post.image ?? '',
      });
    }
  }, [post, reset]);

  const updatePostMutation = useMutation({
    mutationFn: updatePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', search] });
      onClose();
    },
  });

  const onSubmit = async (values: PostSchema) => {
    if (!post) {
      return;
    }

    const imageUrl = values.image?.trim();

    clearErrors('image');

    if (imageUrl) {
      setIsValidatingImage(true);

      try {
        const imageError = await validateImageUrl(imageUrl);

        if (imageError) {
          setError('image', {
            type: 'manual',
            message: imageError,
          });
          return;
        }
      } finally {
        setIsValidatingImage(false);
      }
    }

    updatePostMutation.mutate({
      id: post.id,
      title: values.title,
      content: values.content,
      image: imageUrl || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} title="Editar post" onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Input placeholder="Titulo do post" {...register('title')} />
          {errors.title ? <p className="mt-2 text-sm text-rose-400">{errors.title.message}</p> : null}
        </div>

        <div>
          <Textarea
            rows={5}
            className="min-h-[180px] resize-none"
            placeholder="Conteudo do post"
            {...register('content')}
          />
          {errors.content ? <p className="mt-2 text-sm text-rose-400">{errors.content.message}</p> : null}
        </div>

        <div>
          <Input placeholder="URL da imagem (opcional)" {...register('image')} />
          {errors.image ? <p className="mt-2 text-sm text-rose-400">{errors.image.message}</p> : null}
        </div>

        {updatePostMutation.isError ? (
          <InlineMessage
            message={getErrorMessage(
              updatePostMutation.error,
              'Nao foi possivel salvar as alteracoes neste momento.',
            )}
          />
        ) : null}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose} className="h-12">
            Cancelar
          </Button>
          <Button type="submit" className="h-12" disabled={updatePostMutation.isPending || isValidatingImage}>
            {isValidatingImage ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Validando imagem...
              </span>
            ) : updatePostMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Salvando...
              </span>
            ) : (
              'Salvar alteracoes'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
