import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useArticle } from '@/hooks/use-article';
import { useCategories } from '@/hooks/use-categories';
import { useTags } from '@/hooks/use-tags';
import { useToast } from '@/hooks/use-toast';
import { useZodForm } from '@/hooks/use-zod-form';
import { articleSchema } from '@/lib/validations/article';
import axios from 'axios';
import { Check, Loader2, Save } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

const modules = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
    handlers: {},
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
  'link',
  'image',
];

type FormData = z.infer<typeof articleSchema>;

const WriteBlogPage = () => {
  const quillRef = useRef<ReactQuill>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const { categories, isLoading: isCategoriesLoading } = useCategories();
  const { tags = [], isLoading: isTagsLoading, createTag } = useTags();
  const { createArticle, isLoading: isSubmitting } = useArticle();

  const form = useZodForm({
    schema: articleSchema,
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      category_id: '',
      tag_ids: [],
      featured_image: null,
    },
  });

  const handleFeaturedImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      form.setValue('featured_image', file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleInlineImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      if (input.files?.length && quillRef.current) {
        const file = input.files[0];
        try {
          setIsUploadingImage(true);
          const formData = new FormData();
          formData.append('image', file);

          const API_URL =
            import.meta.env.VITE_API_URL || 'http://localhost:8000';
          const response = await axios.post(
            `${API_URL}/api/articles/upload/`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );

          const quill = quillRef.current.getEditor();
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', response.data.url);
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to upload image',
            variant: 'destructive',
          });
        } finally {
          setIsUploadingImage(false);
        }
      }
    };
  }, [toast]);

  React.useEffect(() => {
    if (modules.toolbar.handlers) {
      modules.toolbar.handlers['image'] = handleInlineImageUpload;
    }
  }, [handleInlineImageUpload]);

  const handleTagSelect = async (tagId: string) => {
    const currentTags = form.watch('tag_ids') || [];
    if (currentTags.includes(tagId)) {
      form.setValue(
        'tag_ids',
        currentTags.filter((id) => id !== tagId)
      );
    } else {
      form.setValue('tag_ids', [...currentTags, tagId]);
    }
  };

  const handleNewTag = async () => {
    if (tagInput.trim()) {
      try {
        const newTag = await createTag({ name: tagInput.trim() });
        form.setValue('tag_ids', [...(form.watch('tag_ids') || []), newTag.id]);
        setTagInput('');
        setIsTagsOpen(false);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to create tag',
          variant: 'destructive',
        });
      }
    }
  };

  const onSubmit = async (data: FormData, isDraft: boolean) => {
    try {
      const articleData = {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        category_ids: [data.category_id],
        tag_ids: data.tag_ids,
        featured_image: data.featured_image,
        status: isDraft ? 'draft' : 'published',
      };

      await createArticle(articleData);
      toast({
        title: 'Success',
        description: isDraft
          ? 'Article saved as draft'
          : 'Article published successfully',
      });
      navigate('/profile');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save article',
        variant: 'destructive',
      });
    }
  };

  return (
    <Layout>
      <div className="container-newspaper py-12">
        <h1 className="text-4xl font-serif font-bold mb-8 text-center">
          Write New Article
        </h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-serif">
              Create Your Story
            </CardTitle>
            <CardDescription>Create a new blog post</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...form.register('title')}
                  placeholder="Enter article title"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  {...form.register('excerpt')}
                  placeholder="Brief summary of your article"
                />
                {form.formState.errors.excerpt && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.excerpt.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.watch('category_id')}
                  onValueChange={(value) => form.setValue('category_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.category_id && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.category_id.message}
                  </p>
                )}
              </div>

              {/* <div className="space-y-2">
                <Label>Tags</Label>
                <Popover open={isTagsOpen} onOpenChange={setIsTagsOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {form.watch('tag_ids')?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {(form.watch('tag_ids') || []).map((tagId) => {
                            const tagList = Array.isArray(tags) ? tags : [];
                            const tag = tagList.find((t) => t.id === tagId);
                            return tag ? (
                              <Badge key={tag.id} variant="secondary">
                                {tag.name}
                                <button
                                  type="button"
                                  className="ml-1"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    try {
                                      handleTagSelect(tag.id);
                                    } catch (error) {
                                      console.error(
                                        'Failed to remove tag:',
                                        error
                                      );
                                    }
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          Select tags...
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search or create tag..."
                        value={tagInput}
                        onValueChange={setTagInput}
                      />
                      <CommandEmpty>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={handleNewTag}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create "{tagInput}"
                        </Button>
                      </CommandEmpty>
                      <CommandGroup>
                        <ScrollArea className="h-[200px]">
                          {(tags || []).map((tag) => (
                            <CommandItem
                              key={tag.id}
                              value={tag.name}
                              onSelect={() => handleTagSelect(tag.id)}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  (form.watch('tag_ids') || []).includes(tag.id)
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                }`}
                              />
                              {tag.name}
                            </CommandItem>
                          ))}
                        </ScrollArea>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                {form.formState.errors.tag_ids && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.tag_ids.message}
                  </p>
                )}
              </div> */}

              <div className="space-y-2">
                <Label>Featured Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFeaturedImageChange}
                />
                {previewImage && (
                  <div className="mt-2 relative w-full aspect-video">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="rounded-lg object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <div className="min-h-[400px]">
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    modules={modules}
                    formats={formats}
                    value={form.watch('content')}
                    onChange={(value) => form.setValue('content', value)}
                    className="h-[350px]"
                  />
                </div>
                {form.formState.errors.content && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.content.message}
                  </p>
                )}
              </div>

              <div className="pt-8 md:pt-4 grid grid-cols-2 md:flex md:justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    form.handleSubmit((data) => onSubmit(data, true))()
                  }
                  disabled={isSubmitting || isUploadingImage}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Draft
                </Button>
                <Button
                  type="button"
                  onClick={() =>
                    form.handleSubmit((data) => onSubmit(data, false))()
                  }
                  disabled={isSubmitting || isUploadingImage}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Publish
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default WriteBlogPage;
