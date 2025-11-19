import axiosInstance from '@/lib/api/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

export interface Tag {
  id: string;
  name: string;
  slug: string;
  article_count?: number;
}

interface TagResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Tag[];
}

export function useTags() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: tagsData,
    isLoading,
    error,
  } = useQuery<TagResponse>({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/tags/');
      return response.data;
    },
  });

  const createTagMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      try {
        const response = await axiosInstance.post('/api/tags/', data);
        return response.data;
      } catch (error) {
        console.error('Error creating tag:', error);
        throw error;
      }
    },
    onSuccess: (newTag) => {
      queryClient.setQueryData<TagResponse>(['tags'], (old) => {
        if (!old)
          return {
            count: 1,
            next: null,
            previous: null,
            results: [newTag],
          };

        return {
          ...old,
          count: old.count + 1,
          results: [...old.results, newTag],
        };
      });

      toast({
        title: 'Success',
        description: 'Tag created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create tag',
        variant: 'destructive',
      });
    },
  });

  const createTag = async (data: { name: string }) => {
    try {
      const result = await createTagMutation.mutateAsync(data);
      return result;
    } catch (error) {
      console.error('Error in createTag:', error);
      toast({
        title: 'Error',
        description: 'Failed to create tag. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    tags: tagsData?.results || [],
    totalTags: tagsData?.count || 0,
    isLoading,
    error,
    createTag,
  };
}
