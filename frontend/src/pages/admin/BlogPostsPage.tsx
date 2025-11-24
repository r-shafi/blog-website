import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/api/admin';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle,
  Clock,
  Eye,
  Filter,
  MoreHorizontal,
  Pencil,
  Star,
  Trash,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function BlogPostsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [deleteArticleId, setDeleteArticleId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get('status') || 'all'
  );

  // Update URL when status filter changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (statusFilter === 'all') {
      params.delete('status');
    } else {
      params.set('status', statusFilter);
    }
    setSearchParams(params, { replace: true });
  }, [statusFilter, searchParams, setSearchParams]);

  const { data: articles, isLoading } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: () => adminApi.getArticles(),
  });

  // Filter articles based on status
  const filteredArticles =
    articles?.results?.filter((article: { status: string }) => {
      if (statusFilter === 'all') return true;
      return article.status === statusFilter;
    }) || [];

  const quickActionMutation = useMutation({
    mutationFn: ({
      articleId,
      action,
    }: {
      articleId: number;
      action: 'approve' | 'reject';
    }) => adminApi.quickArticleAction(articleId, action),
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update article status',
        variant: 'destructive',
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: 'published' | 'draft';
    }) =>
      status === 'published'
        ? adminApi.publishArticle(id)
        : adminApi.unpublishArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast({
        title: 'Success',
        description: 'Article status updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update article status',
        variant: 'destructive',
      });
    },
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast({
        title: 'Success',
        description: 'Article deleted successfully',
      });
      setDeleteArticleId(null);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete article',
        variant: 'destructive',
      });
    },
  });

  const featureArticleMutation = useMutation({
    mutationFn: (articleId: string) => adminApi.featureArticle(articleId),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Article featured status updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update article featured status',
        variant: 'destructive',
      });
    },
  });

  const handleStatusChange = (
    id: string,
    currentStatus: 'published' | 'draft'
  ) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleQuickAction = (
    articleId: number,
    action: 'approve' | 'reject'
  ) => {
    quickActionMutation.mutate({ articleId, action });
  };

  const handleDelete = (articleId: string) => {
    setDeleteArticleId(articleId);
  };

  const confirmDelete = () => {
    if (deleteArticleId) {
      deleteArticleMutation.mutate(deleteArticleId);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div>Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Blog Posts</h1>
            <p className="text-muted-foreground">Manage your blog posts</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Filter className="h-3 w-3" />
              {filteredArticles.length} posts
            </Badge>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Publish Date</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArticles.map(
              (article: {
                id: number;
                title: string;
                excerpt: string;
                status: string;
                featured: boolean;
                author_detail: { name: string };
                views: number;
                publish_date: string;
                slug: string;
              }) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{article.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {article.excerpt}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{article.author_detail.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        article.status === 'published'
                          ? 'default'
                          : article.status === 'pending'
                          ? 'secondary'
                          : article.status === 'draft'
                          ? 'secondary'
                          : 'destructive'
                      }
                      className="flex items-center gap-1 w-fit"
                    >
                      {article.status === 'published' && (
                        <CheckCircle className="h-3 w-3" />
                      )}
                      {(article.status === 'pending' ||
                        article.status === 'draft') && (
                        <Clock className="h-3 w-3" />
                      )}
                      {article.status === 'rejected' && (
                        <XCircle className="h-3 w-3" />
                      )}
                      {article.status === 'published'
                        ? 'Published'
                        : article.status === 'pending'
                        ? 'Pending'
                        : article.status === 'draft'
                        ? 'Draft'
                        : 'Rejected'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={article.featured ? 'default' : 'secondary'}
                      className="flex items-center gap-1 w-fit"
                    >
                      <Star className="h-3 w-3" />
                      {article.featured ? 'Featured' : 'Normal'}
                    </Badge>
                  </TableCell>
                  <TableCell>{article.views}</TableCell>
                  <TableCell>
                    {article.publish_date
                      ? new Date(article.publish_date).toLocaleDateString()
                      : 'Not published'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {article.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleQuickAction(article.id, 'approve')
                            }
                            disabled={quickActionMutation.isPending}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleQuickAction(article.id, 'reject')
                            }
                            disabled={quickActionMutation.isPending}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link
                              to={`/blog/${article.slug}`}
                              className="flex items-center"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              to={`/admin/posts/${article.id}/edit`}
                              className="flex items-center"
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              featureArticleMutation.mutate(
                                article.id.toString()
                              )
                            }
                            disabled={featureArticleMutation.isPending}
                          >
                            <Star className="mr-2 h-4 w-4" />
                            {article.featured
                              ? 'Remove from Featured'
                              : 'Add to Featured'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(article.id.toString())}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!deleteArticleId}
        onOpenChange={() => setDeleteArticleId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              article.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
