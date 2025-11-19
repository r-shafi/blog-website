import axiosInstance from '@/lib/api/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Like/Dislike article
export const useArticleReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      slug,
      reaction,
    }: {
      slug: string;
      reaction: 'like' | 'dislike';
    }) => {
      const response = await axiosInstance.post(`/api/articles/${slug}/like/`, {
        reaction,
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update the article in all relevant queries
      queryClient.invalidateQueries({ queryKey: ['article', variables.slug] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['user-liked-articles'] });
      queryClient.invalidateQueries({ queryKey: ['user-disliked-articles'] });
    },
  });
};

// Bookmark article
export const useArticleBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      const response = await axiosInstance.post(
        `/api/articles/${slug}/bookmark/`
      );
      return response.data;
    },
    onSuccess: (data, slug) => {
      // Update the article in all relevant queries
      queryClient.invalidateQueries({ queryKey: ['article', slug] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['user-bookmarks'] });
    },
  });
};

// Get user's bookmarked articles
export const useUserBookmarks = () => {
  return useQuery({
    queryKey: ['user-bookmarks'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/articles/me/bookmarks/');
      return response.data;
    },
    enabled: true, // Will rely on auth token in axios instance
  });
};

// Get user's liked articles
export const useUserLikedArticles = () => {
  return useQuery({
    queryKey: ['user-liked-articles'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/articles/me/liked/');
      return response.data;
    },
    enabled: true, // Will rely on auth token in axios instance
  });
};

// Get user's disliked articles
export const useUserDislikedArticles = () => {
  return useQuery({
    queryKey: ['user-disliked-articles'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/articles/me/disliked/');
      return response.data;
    },
    enabled: true, // Will rely on auth token in axios instance
  });
};
