import axiosInstance from '@/lib/api/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  featured_image: string | null;
  parent: number | null;
  article_count: number;
  children: Category[] | null;
}

interface CategoryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Category[];
}

export function useCategories() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: categoriesData,
    isLoading,
    error,
  } = useQuery<CategoryResponse>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/categories/');
      return response.data;
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      parent?: number;
    }) => {
      const response = await axiosInstance.post('/api/categories/', data);
      return response.data;
    },
    onSuccess: (newCategory) => {
      queryClient.setQueryData<CategoryResponse>(['categories'], (old) => {
        if (!old)
          return {
            count: 1,
            next: null,
            previous: null,
            results: [newCategory],
          };
        return {
          ...old,
          count: old.count + 1,
          results: [...old.results, newCategory],
        };
      });
      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create category',
        variant: 'destructive',
      });
    },
  });

  const createCategory = async (data: {
    name: string;
    description?: string;
    parent?: number;
  }) => {
    return createCategoryMutation.mutateAsync(data);
  };

  return {
    categories: categoriesData?.results || [],
    totalCategories: categoriesData?.count || 0,
    isLoading,
    error,
    createCategory,
  };
}
