import axiosInstance from '@/lib/api/axios';
import { useState } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

export interface ArticleData {
  title: string;
  excerpt: string;
  content: string;
  category_ids: string[];
  tag_ids: string[];
  featured_image: File | null;
  status: 'draft' | 'published';
}

export function useArticle() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const createArticle = async (articleData: ArticleData) => {
    setIsLoading(true);
    console.log('Creating article with data:', articleData);

    try {
      const formData = new FormData();
      formData.append('title', articleData.title);
      formData.append('excerpt', articleData.excerpt);
      formData.append('content', articleData.content);
      formData.append('status', articleData.status);

      articleData.category_ids.forEach((id) => {
        formData.append('category_ids', id);
      });

      articleData.tag_ids.forEach((id) => {
        formData.append('tag_ids', id);
      });

      if (articleData.featured_image) {
        formData.append('featured_image', articleData.featured_image);
      }

      console.log('Sending FormData to API...');
      const response = await axiosInstance.post('/api/articles/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('API Response:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('Create article error:', error);

      let errorMessage = 'An error occurred while saving the article.';

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: any } };
        console.error('Error response:', axiosError.response);

        if (axiosError.response?.data) {
          if (typeof axiosError.response.data === 'string') {
            errorMessage = axiosError.response.data;
          } else if (axiosError.response.data.detail) {
            errorMessage = axiosError.response.data.detail;
          } else if (axiosError.response.data.message) {
            errorMessage = axiosError.response.data.message;
          } else if (axiosError.response.data.error) {
            errorMessage = axiosError.response.data.error;
          }
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createArticle,
    isLoading,
  };
}
