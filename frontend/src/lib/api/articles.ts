import axios from './axios';

interface ListParams {
  page?: number;
  category?: string;
  tag?: string;
  featured?: boolean;
  search?: string;
  ordering?: string;
  date_from?: string;
  date_to?: string;
}

export const articlesApi = {
  getAll: async (params: ListParams = {}) => {
    const response = await axios.get('/api/articles/', { params });
    return response.data;
  },

  getFeatured: async () => {
    const response = await axios.get('/api/articles/', {
      params: { featured: true },
    });
    return response.data;
  },

  getLatest: async () => {
    const response = await axios.get('/api/articles/recent/');
    return response.data;
  },

  getByCategory: async (categoryId: string, page: number = 1) => {
    const response = await axios.get('/api/articles/', {
      params: { category: categoryId, page },
    });
    return response.data;
  },

  getBySlug: async (slug: string) => {
    const response = await axios.get(`/api/articles/by-slug/${slug}/`);
    return response.data;
  },

  getRelated: async (id: string) => {
    const response = await axios.get(`/api/articles/${id}/related/`);
    return response.data.results;
  },

  incrementViews: async (id: string) => {
    await axios.post(`/api/articles/${id}/increment-views/`);
  },

  getPopular: async () => {
    const response = await axios.get('/api/articles/popular/');
    return response.data;
  },

  createArticle: async (formData: FormData) => {
    const response = await axios.post('/api/articles/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateArticle: async (slug: string, formData: FormData) => {
    const response = await axios.patch(`/api/articles/${slug}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteArticle: async (slug: string) => {
    await axios.delete(`/api/articles/${slug}/`);
  },

  // Admin specific endpoints
  getAllAdmin: async () => {
    const response = await axios.get('/api/articles/admin/');
    return response.data.results;
  },

  publishArticle: async (slug: string) => {
    const response = await axios.post(`/api/articles/${slug}/publish/`);
    return response.data;
  },

  unpublishArticle: async (slug: string) => {
    const response = await axios.post(`/api/articles/${slug}/unpublish/`);
    return response.data;
  },
};
