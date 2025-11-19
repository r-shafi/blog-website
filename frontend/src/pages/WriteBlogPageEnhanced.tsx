import Layout from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useArticle } from '@/hooks/use-article';
import { useAuth } from '@/hooks/use-auth';
import { useCategories } from '@/hooks/use-categories';
import { useTags, type Tag } from '@/hooks/use-tags';
import { useToast } from '@/hooks/use-toast';
import { useZodForm } from '@/hooks/use-zod-form';
import axiosInstance from '@/lib/api/axios';
import { cn } from '@/lib/utils';
import { articleSchema } from '@/lib/validations/article';
import {
  Check,
  ChevronsUpDown,
  Eye,
  Loader2,
  PlusCircle,
  Save,
  Send,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

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

const modules = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      ['link', 'image', 'video'],
      ['blockquote', 'code-block'],
      [{ color: [] }, { background: [] }],
      ['clean'],
    ],
  },
};

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
  'video',
  'code-block',
  'align',
  'color',
  'background',
];

type FormData = z.infer<typeof articleSchema>;

function CategorySelect({
  value,
  onValueChange,
  categories,
  createCategory,
}: {
  value: string;
  onValueChange: (value: string) => void;
  categories: Category[];
  createCategory: (data: {
    name: string;
    description?: string;
  }) => Promise<Category>;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const selectedCategory = categories.find(
    (cat) => cat.id.toString() === value
  );

  const handleCreateCategory = async () => {
    if (!search.trim()) return;

    try {
      const newCategory = await createCategory({
        name: search.trim(),
        description: `Auto-created category: ${search.trim()}`,
      });
      onValueChange(newCategory.id.toString());
      setOpen(false);
      setSearch('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create category',
        variant: 'destructive',
      });
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedCategory ? selectedCategory.name : 'Select category...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search or create category..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              <div className="flex flex-col items-center gap-2 p-4">
                <p>No category found.</p>
                {search.trim() && (
                  <Button
                    size="sm"
                    onClick={handleCreateCategory}
                    className="w-full"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create "{search.trim()}"
                  </Button>
                )}
              </div>
            </CommandEmpty>
            <CommandGroup>
              {filteredCategories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={() => {
                    onValueChange(category.id.toString());
                    setOpen(false);
                    setSearch('');
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === category.id.toString()
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  {category.name}
                </CommandItem>
              ))}
              {search.trim() &&
                !filteredCategories.some(
                  (cat) => cat.name.toLowerCase() === search.toLowerCase()
                ) && (
                  <CommandItem
                    onSelect={handleCreateCategory}
                    className="border-t mt-2 pt-2"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create "{search.trim()}"
                  </CommandItem>
                )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function TagsSelect({
  value,
  onValueChange,
  tags,
  createTag,
}: {
  value: string[];
  onValueChange: (value: string[]) => void;
  tags: Tag[];
  createTag: (data: { name: string }) => Promise<Tag>;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const selectedTags = tags.filter((tag) => value.includes(tag.id));

  const handleCreateTag = async () => {
    if (!search.trim()) return;

    try {
      const newTag = await createTag({ name: search.trim() });
      onValueChange([...value, newTag.id]);
      setOpen(false);
      setSearch('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create tag',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveTag = (tagId: string) => {
    onValueChange(value.filter((id) => id !== tagId));
  };

  const filteredTags = tags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(search.toLowerCase()) &&
      !value.includes(tag.id)
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {tag.name}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag.id)}
              className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add tags...
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              placeholder="Search or create tag..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                <div className="flex flex-col items-center gap-2 p-4">
                  <p>No tag found.</p>
                  {search.trim() && (
                    <Button
                      size="sm"
                      onClick={handleCreateTag}
                      className="w-full"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create "{search.trim()}"
                    </Button>
                  )}
                </div>
              </CommandEmpty>
              <CommandGroup>
                {filteredTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => {
                      onValueChange([...value, tag.id]);
                      setSearch('');
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {tag.name}
                  </CommandItem>
                ))}
                {search.trim() &&
                  !filteredTags.some(
                    (tag) => tag.name.toLowerCase() === search.toLowerCase()
                  ) && (
                    <CommandItem
                      onSelect={handleCreateTag}
                      className="border-t mt-2 pt-2"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create "{search.trim()}"
                    </CommandItem>
                  )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function PreviewPanel({
  content,
  title,
  excerpt,
  featuredImage,
}: {
  content: string;
  title: string;
  excerpt: string;
  featuredImage: File | null;
}) {
  const featuredImageUrl = featuredImage ? URL.createObjectURL(featuredImage) : null;

  // Cleanup object URL when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (featuredImageUrl) {
        URL.revokeObjectURL(featuredImageUrl);
      }
    };
  }, [featuredImageUrl]);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          <CardTitle>Live Preview</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {featuredImageUrl && (
          <div className="w-full">
            <img
              src={featuredImageUrl}
              alt="Featured image preview"
              className="w-full h-48 object-cover rounded-lg border"
            />
          </div>
        )}
        {title && (
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          </div>
        )}
        {excerpt && (
          <div>
            <p className="text-lg text-muted-foreground">{excerpt}</p>
          </div>
        )}
        {content && (
          <div
            className="prose prose-gray max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
        {!title && !excerpt && !content && !featuredImage && (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            Start typing to see preview...
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function WriteBlogPageEnhanced() {
  const [content, setContent] = useState<string>('');
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const {
    categories,
    isLoading: isCategoriesLoading,
    createCategory,
  } = useCategories();
  const { tags = [], isLoading: isTagsLoading, createTag } = useTags();
  const { createArticle, isLoading: isCreating } = useArticle();

  const form = useZodForm({
    schema: articleSchema,
    defaultValues: {
      title: '',
      excerpt: '',
      category_id: '',
      tag_ids: [],
      featured_image: null,
      status: 'pending' as const,
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  // Debug form state
  React.useEffect(() => {
    console.log('Form errors:', form.formState.errors);
    console.log('Form values:', form.getValues());
    console.log('Form isValid:', form.formState.isValid);
  }, [form]);

  const imageHandler = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'File size must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axiosInstance.post(
          '/api/articles/upload-image/',
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );

        const imageUrl = response.data.url;

        const quillElement = document.querySelector('.ql-editor');
        if (quillElement) {
          const currentContent =
            content + `<img src="${imageUrl}" alt="Uploaded image" />`;
          setContent(currentContent);
        }

        toast({
          title: 'Success',
          description: 'Image uploaded successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to upload image',
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
      }
    },
    [toast, content]
  );

  const customModules = useMemo(
    () => ({
      ...modules,
      toolbar: {
        ...modules.toolbar,
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [imageHandler]
  );

  const onSubmit = async (
    data: FormData,
    action: 'save_draft' | 'submit_for_review' = 'submit_for_review'
  ) => {
    try {
      console.log('onSubmit called with:', { data, action, content });

      // For submit_for_review, require content
      if (
        action === 'submit_for_review' &&
        (!content || content.trim() === '' || content === '<p><br></p>')
      ) {
        console.log('Content validation failed for submission');
        toast({
          title: 'Error',
          description: 'Content is required when submitting for review',
          variant: 'destructive',
        });
        return;
      }

      // Determine status based on action and user role
      let status: 'draft' | 'pending' | 'published' = 'pending';
      if (action === 'save_draft') {
        status = 'draft';
      } else if (user?.role === 'admin') {
        // Admin can publish directly
        status = 'published';
      } else {
        // Regular users submit for review (pending)
        status = 'pending';
      }

      const articleData = {
        title: data.title,
        excerpt: data.excerpt,
        content: content || '', // Allow empty content for drafts
        category_ids: [data.category_id],
        tag_ids: data.tag_ids || [],
        featured_image: featuredImage,
        status: status,
      };

      console.log('Submitting article data:', articleData);

      const result = await createArticle(articleData);
      console.log('Article created successfully:', result);

      const successMessage =
        action === 'save_draft'
          ? 'Article saved as draft successfully!'
          : user?.role === 'admin'
          ? 'Article published successfully!'
          : 'Article submitted for review successfully!';

      toast({
        title: 'Success',
        description: successMessage,
      });

      // Redirect to profile page instead of admin articles
      navigate('/profile');
    } catch (error: unknown) {
      console.error('Article submission error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: 'Error',
        description: errorMessage || 'Failed to create article',
        variant: 'destructive',
      });
    }
  };

  const handleSaveDraft = async () => {
    console.log('Save Draft clicked');
    console.log('Form values:', form.getValues());
    console.log('Form errors before validation:', form.formState.errors);

    // Trigger validation for only the required fields, excluding content
    const isValid = await form.trigger(['title', 'excerpt', 'category_id']);
    console.log('Form is valid:', isValid);
    console.log('Form errors after validation:', form.formState.errors);

    if (isValid) {
      const data = form.getValues();
      console.log('Submitting with data:', data);
      await onSubmit(data, 'save_draft');
    } else {
      console.log('Form validation failed with errors:', form.formState.errors);
      toast({
        title: 'Validation Error',
        description: 'Please fix the form errors before saving',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitForReview = async () => {
    console.log('Submit for Review clicked');
    console.log('Form values:', form.getValues());
    console.log('Form errors before validation:', form.formState.errors);

    // Trigger validation for only the required fields, excluding content
    const isValid = await form.trigger(['title', 'excerpt', 'category_id']);
    console.log('Form is valid:', isValid);
    console.log('Form errors after validation:', form.formState.errors);

    if (isValid) {
      const data = form.getValues();
      console.log('Submitting with data:', data);
      await onSubmit(data, 'submit_for_review');
    } else {
      console.log('Form validation failed with errors:', form.formState.errors);
      toast({
        title: 'Validation Error',
        description: 'Please fix the form errors before submitting',
        variant: 'destructive',
      });
    }
  };

  // Check authentication after all hooks are defined
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Write New Article</h1>
          <p className="text-muted-foreground">
            Create and publish a new blog post
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Article Details</CardTitle>
                <CardDescription>
                  Fill in the basic information for your article
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter article title..."
                      {...form.register('title')}
                      onChange={(e) => {
                        form.register('title').onChange(e);
                        setValue('title', e.target.value);
                        console.log('Title changed:', e.target.value);
                      }}
                      className={
                        form.formState.errors.title ? 'border-red-500' : ''
                      }
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      placeholder="Brief description of your article..."
                      className="min-h-[100px]"
                      {...form.register('excerpt')}
                      onChange={(e) => {
                        form.register('excerpt').onChange(e);
                        setValue('excerpt', e.target.value);
                      }}
                    />
                    {form.formState.errors.excerpt && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.excerpt.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <CategorySelect
                      value={watchedValues.category_id || ''}
                      onValueChange={(value) => setValue('category_id', value)}
                      categories={categories}
                      createCategory={createCategory}
                    />
                    {form.formState.errors.category_id && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.category_id.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Tags (Optional)</Label>
                    <TagsSelect
                      value={watchedValues.tag_ids || []}
                      onValueChange={(value) => setValue('tag_ids', value)}
                      tags={tags}
                      createTag={createTag}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="featured_image">Featured Image</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="featured_image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setFeaturedImage(file);
                          setValue('featured_image', file);
                        }}
                        className="flex-1"
                      />
                      {featuredImage && (
                        <div className="text-sm text-muted-foreground">
                          {featuredImage.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
                <CardDescription>
                  Write your article content using the rich text editor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={(value) => {
                      setContent(value);
                      setValue('content', value);
                    }}
                    modules={customModules}
                    formats={formats}
                    placeholder="Start writing your article..."
                    style={{ minHeight: '300px' }}
                  />

                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleFileChange}
                  />

                  {isUploading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading image...
                    </div>
                  )}

                  {form.formState.errors.content && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.content.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  handleSaveDraft();
                }}
                disabled={isCreating || isCategoriesLoading || isTagsLoading}
                className="min-w-[120px]"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save as Draft
                  </>
                )}
              </Button>

              <Button
                type="button"
                onClick={() => {
                  handleSubmitForReview();
                }}
                disabled={isCreating || isCategoriesLoading || isTagsLoading}
                className="min-w-[140px]"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {user?.role === 'admin'
                      ? 'Publish Article'
                      : 'Submit for Review'}
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="lg:sticky lg:top-20 lg:h-fit lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <PreviewPanel
              title={watchedValues.title || ''}
              excerpt={watchedValues.excerpt || ''}
              content={content}
              featuredImage={featuredImage}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
