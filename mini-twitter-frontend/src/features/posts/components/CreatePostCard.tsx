import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImagePlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/Button';
import { InlineMessage } from '../../../components/ui/InlineMessage';
import { Input } from '../../../components/ui/Input';
import { Spinner } from '../../../components/ui/Spinner';
import { Textarea } from '../../../components/ui/Textarea';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { validateImageUrl } from '../../../utils/validateImageInput';
import { createPost } from '../api/createPost';
import { postSchema, type PostSchema } from '../schemas/postSchema';

type CreatePostCardProps = {
  search: string;
};

export function CreatePostCard({ search }: CreatePostCardProps) {
  const queryClient = useQueryClient();
  const [showImageField, setShowImageField] = useState(false);
  const [isValidatingImage, setIsValidatingImage] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    setValue,
    formState: { errors },
  } = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
      image: '',
    },
  });

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      reset();
      setShowImageField(false);
      queryClient.invalidateQueries({ queryKey: ['posts', search] });
    },
  });

  const onSubmit = async (values: PostSchema) => {
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

    createPostMutation.mutate({
      title: values.title,
      content: values.content,
      image: imageUrl || undefined,
    });
  };

  return (
    <form className="panel p-4 sm:p-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-3">
        <Input placeholder="Titulo do post" {...register('title')} />
        {errors.title ? <p className="text-sm text-rose-400">{errors.title.message}</p> : null}

        <Textarea
          {...register('content')}
          rows={4}
          placeholder="E ai, o que esta rolando?"
          className="min-h-[150px] resize-none"
        />
        {errors.content ? <p className="text-sm text-rose-400">{errors.content.message}</p> : null}

        {showImageField ? (
          <div>
            <Input placeholder="Cole a URL da imagem (opcional)" {...register('image')} />
            {errors.image ? <p className="mt-2 text-sm text-rose-400">{errors.image.message}</p> : null}
          </div>
        ) : null}

        {createPostMutation.isError ? (
          <InlineMessage
            message={getErrorMessage(
              createPostMutation.error,
              'Nao foi possivel publicar agora. Tente novamente.',
            )}
          />
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => {
            setShowImageField((current) => {
              const nextValue = !current;

              if (!nextValue) {
                clearErrors('image');
                setValue('image', '');
              }

              return nextValue;
            });
          }}
          disabled={createPostMutation.isPending || isValidatingImage}
          className="inline-flex items-center gap-2 rounded-xl p-2 text-brand-400 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ImagePlus className="h-5 w-5" />
          <span className="text-sm font-medium">Imagem</span>
        </button>

        <Button
          type="submit"
          disabled={createPostMutation.isPending || isValidatingImage}
          className="h-12 px-6 text-sm sm:text-base"
        >
          {isValidatingImage ? (
            <span className="flex items-center gap-2">
              <Spinner />
              Validando imagem...
            </span>
          ) : createPostMutation.isPending ? (
            <span className="flex items-center gap-2">
              <Spinner />
              Postando...
            </span>
          ) : (
            'Postar'
          )}
        </Button>
      </div>
    </form>
  );
}
