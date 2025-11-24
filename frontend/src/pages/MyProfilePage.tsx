import { ArticlesList } from '@/components/ArticlesList';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  useUserBookmarks,
  useUserDislikedArticles,
  useUserLikedArticles,
} from '@/hooks/use-article-actions';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/lib/api/auth';
import axiosInstance from '@/lib/api/axios';
import { getAvatarUrl } from '@/lib/utils/avatar';
import { AxiosError } from 'axios';
import { AlertCircle, Edit, Eye, EyeOff, Key, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface ErrorResponse {
  detail?: string;
  errors?: Record<string, string[]>;
}

const MyProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    'published' | 'pending' | 'draft' | 'liked' | 'disliked' | 'bookmarked'
  >('published');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use hooks for engagement data
  const { data: bookmarkedArticles, isLoading: bookmarksLoading } =
    useUserBookmarks();
  const { data: likedArticles, isLoading: likedLoading } =
    useUserLikedArticles();
  const { data: dislikedArticles, isLoading: dislikedLoading } =
    useUserDislikedArticles();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    avatarFile: null as File | null,
    avatarPreview: getAvatarUrl(user?.avatar, user?.name),
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchArticles = async () => {
      // For engagement tabs, data comes from hooks
      if (
        selectedTab === 'liked' ||
        selectedTab === 'disliked' ||
        selectedTab === 'bookmarked'
      ) {
        return;
      }

      setLoading(true);
      try {
        const endpoint = '/api/articles/me/';

        const response = await axiosInstance.get(endpoint);
        const allArticles = response.data.results || [];

        // Filter articles based on selected tab
        let filteredArticles = allArticles;
        if (selectedTab !== 'published') {
          filteredArticles = allArticles.filter(
            (article) => article.status === selectedTab
          );
        } else {
          filteredArticles = allArticles.filter(
            (article) => article.status === 'published'
          );
        }

        setArticles(filteredArticles);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [selectedTab]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });

    if (name === 'newPassword') {
      evaluatePasswordStrength(value);
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const evaluatePasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordFeedback('');
      return;
    }

    let strength = 0;
    let feedback = '';

    if (password.length >= 8) {
      strength += 20;
    } else {
      feedback = 'Password should be at least 8 characters long';
    }

    if (/[a-z]/.test(password)) {
      strength += 20;
    } else if (!feedback) {
      feedback = 'Add lowercase letters';
    }

    if (/[A-Z]/.test(password)) {
      strength += 20;
    } else if (!feedback) {
      feedback = 'Add uppercase letters';
    }

    if (/[0-9]/.test(password)) {
      strength += 20;
    } else if (!feedback) {
      feedback = 'Add numbers';
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      strength += 20;
    } else if (!feedback) {
      feedback = 'Add special characters';
    }

    if (!feedback) {
      if (strength <= 40) {
        feedback = 'Weak password';
      } else if (strength <= 80) {
        feedback = 'Moderate password';
      } else {
        feedback = 'Strong password';
      }
    }

    setPasswordStrength(strength);
    setPasswordFeedback(feedback);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileData({
        ...profileData,
        avatarFile: file,
        avatarPreview: URL.createObjectURL(file),
      });
    }
  };

  const validateProfileForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(passwordData.newPassword)) {
      newErrors.newPassword =
        'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(passwordData.newPassword)) {
      newErrors.newPassword =
        'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one number';
    } else if (!/[^A-Za-z0-9]/.test(passwordData.newPassword)) {
      newErrors.newPassword =
        'Password must contain at least one special character';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApiErrors = (errors: Record<string, string[]>) => {
    const formattedErrors: Record<string, string> = {};
    Object.entries(errors).forEach(([key, messages]) => {
      formattedErrors[key] = messages[0]; // Take first error message for each field
    });
    setErrors(formattedErrors);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('bio', profileData.bio);
      if (profileData.avatarFile) {
        formData.append('avatar', profileData.avatarFile);
      }

      const updatedUserData = await authApi.updateProfile(formData);
      updateUser(updatedUserData);

      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been updated successfully.',
      });

      setIsEditing(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse;
        const errorMessage = response?.detail || 'Failed to update profile';

        toast({
          title: 'Update Failed',
          description: errorMessage,
          variant: 'destructive',
        });

        if (response?.errors) {
          handleApiErrors(response.errors);
        }
      } else {
        toast({
          title: 'Update Failed',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      toast({
        title: 'Password Changed',
        description: 'Your password has been changed successfully.',
      });

      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordStrength(0);
      setPasswordFeedback('');
    } catch (error) {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse;
        const errorMessage = response?.detail || 'Failed to change password';

        toast({
          title: 'Update Failed',
          description: errorMessage,
          variant: 'destructive',
        });

        if (response?.errors) {
          handleApiErrors(response.errors);
        }
      } else {
        toast({
          title: 'Update Failed',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getArticleWithCategoryName = (article) => {
    const categoryName = 'Uncategorized';

    return {
      ...article,
      categoryName,
    };
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 40) return 'bg-red-500';
    if (strength <= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Layout>
      <div className="container-newspaper py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-center">
            My Profile
          </h1>
          <Link
            to="/write"
            className="px-4 py-2 rounded-md bg-gray-800 text-white font-medium "
          >
            Write New Blog
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-serif flex justify-between items-center">
                  Profile Details
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <img
                          src={profileData.avatarPreview}
                          alt={profileData.name}
                          className="h-32 w-32 rounded-full object-cover border-2 border-gray-200"
                        />
                        <label
                          htmlFor="avatar-upload"
                          className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </label>
                        <input
                          id="avatar-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleAvatarChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={profileData.bio}
                        onChange={handleInputChange}
                        rows={4}
                      />
                    </div>

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-center mb-4">
                      <img
                        src={profileData.avatarPreview}
                        alt={profileData.name}
                        className="h-32 w-32 rounded-full object-cover border-2 border-gray-200"
                      />
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-700">Name</h3>
                      <p className="mt-1">{user.name}</p>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-700">Email</h3>
                      <p className="mt-1">{user.email}</p>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-700">Bio</h3>
                      <p className="mt-1">{profileData.bio}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-serif flex justify-between items-center">
                  Password Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isChangingPassword ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsChangingPassword(true)}
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className={
                            errors.currentPassword
                              ? 'border-red-500 pr-10'
                              : 'pr-10'
                          }
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="text-sm text-red-500 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.currentPassword}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className={
                            errors.newPassword
                              ? 'border-red-500 pr-10'
                              : 'pr-10'
                          }
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {passwordData.newPassword && (
                        <>
                          <div className="mt-2">
                            <Progress
                              value={passwordStrength}
                              className={`h-1 ${getStrengthColor(
                                passwordStrength
                              )}`}
                            />
                          </div>
                          <p
                            className={`text-xs ${
                              passwordStrength <= 40
                                ? 'text-red-500'
                                : passwordStrength <= 80
                                ? 'text-yellow-500'
                                : 'text-green-500'
                            }`}
                          >
                            {passwordFeedback}
                          </p>
                        </>
                      )}
                      {errors.newPassword && (
                        <p className="text-sm text-red-500 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.newPassword}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className={
                            errors.confirmPassword
                              ? 'border-red-500 pr-10'
                              : 'pr-10'
                          }
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-500 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                          });
                          setPasswordStrength(0);
                          setPasswordFeedback('');
                          setErrors({});
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update Password'}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-serif">
                  My Articles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="container py-8">
                  <Tabs
                    value={selectedTab}
                    onValueChange={(value) => {
                      if (
                        value === 'published' ||
                        value === 'pending' ||
                        value === 'draft' ||
                        value === 'liked' ||
                        value === 'disliked' ||
                        value === 'bookmarked'
                      ) {
                        setSelectedTab(value as typeof selectedTab);
                      }
                    }}
                    className="mb-6"
                  >
                    <TabsList>
                      <TabsTrigger value="published">Published</TabsTrigger>
                      <TabsTrigger value="pending">Pending</TabsTrigger>
                      <TabsTrigger value="draft">Drafts</TabsTrigger>
                      <TabsTrigger value="liked">Liked</TabsTrigger>
                      <TabsTrigger value="disliked">Disliked</TabsTrigger>
                      <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <ArticlesList
                    articles={
                      selectedTab === 'liked'
                        ? likedArticles?.results || []
                        : selectedTab === 'disliked'
                        ? dislikedArticles?.results || []
                        : selectedTab === 'bookmarked'
                        ? bookmarkedArticles?.results || []
                        : articles
                    }
                    status={selectedTab}
                    loading={
                      selectedTab === 'liked'
                        ? likedLoading
                        : selectedTab === 'disliked'
                        ? dislikedLoading
                        : selectedTab === 'bookmarked'
                        ? bookmarksLoading
                        : loading
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyProfilePage;
