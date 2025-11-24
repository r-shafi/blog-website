import { AdminLayout } from '@/components/admin/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/api/admin';
import { DashboardResponse } from '@/types/admin/dashboard';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  MessageSquare,
  TrendingUp,
  UserCheck,
  Users2,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

export default function DashboardPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedArticles, setSelectedArticles] = useState<number[]>([]);

  const { data: dashboard, isLoading } = useQuery<DashboardResponse>({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboardStats(),
  });

  const quickActionMutation = useMutation({
    mutationFn: ({
      articleId,
      action,
    }: {
      articleId: number;
      action: 'approve' | 'reject';
    }) => adminApi.quickArticleAction(articleId, action),
    onSuccess: (data, variables) => {
      toast({
        title: 'Success',
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update article status',
        variant: 'destructive',
      });
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: ({
      articleIds,
      action,
    }: {
      articleIds: number[];
      action: 'approve' | 'reject';
    }) => adminApi.bulkArticleAction(articleIds, action),
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: data.message,
      });
      setSelectedArticles([]);
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to perform bulk action',
        variant: 'destructive',
      });
    },
  });

  const handleQuickAction = (
    articleId: number,
    action: 'approve' | 'reject'
  ) => {
    quickActionMutation.mutate({ articleId, action });
  };

  const handleBulkAction = (action: 'approve' | 'reject') => {
    if (selectedArticles.length === 0) {
      toast({
        title: 'No articles selected',
        description: 'Please select articles first',
        variant: 'destructive',
      });
      return;
    }
    bulkActionMutation.mutate({ articleIds: selectedArticles, action });
  };

  const toggleArticleSelection = (articleId: number) => {
    setSelectedArticles((prev) =>
      prev.includes(articleId)
        ? prev.filter((id) => id !== articleId)
        : [...prev, articleId]
    );
  };

  const primaryStats = [
    {
      title: 'Total Users',
      value: dashboard?.total_users || 0,
      description: 'Active users on the platform',
      icon: Users2,
      trend: dashboard?.new_users_this_week
        ? `+${dashboard.new_users_this_week} this week`
        : '',
      color: 'blue',
    },
    {
      title: 'Pending Articles',
      value: dashboard?.pending_articles || 0,
      description: 'Articles awaiting approval',
      icon: Clock,
      trend:
        dashboard?.pending_articles > 10
          ? 'High queue - needs attention!'
          : dashboard?.pending_articles > 5
          ? 'Queue building up'
          : 'Normal',
      color:
        dashboard?.pending_articles > 10
          ? 'red'
          : dashboard?.pending_articles > 5
          ? 'yellow'
          : 'green',
    },
    {
      title: 'Published Articles',
      value: dashboard?.published_articles || 0,
      description: 'Live articles on site',
      icon: CheckCircle,
      trend: dashboard?.new_articles_this_week
        ? `+${dashboard.new_articles_this_week} this week`
        : '',
      color: 'green',
    },
    {
      title: 'Unread Messages',
      value: dashboard?.unread_messages || 0,
      description: 'Contact messages pending',
      icon: MessageSquare,
      trend: dashboard?.unread_messages > 5 ? 'Needs attention' : '',
      color: dashboard?.unread_messages > 5 ? 'red' : 'gray',
    },
  ];

  const secondaryStats = [
    {
      title: 'Draft Articles',
      value: dashboard?.draft_articles || 0,
      icon: FileText,
      color: 'gray',
    },
    {
      title: 'Rejected Articles',
      value: dashboard?.rejected_articles || 0,
      icon: XCircle,
      color: 'red',
    },
    {
      title: 'Spam Reports',
      value: dashboard?.spam_reports || 0,
      icon: AlertTriangle,
      color: 'orange',
    },
    {
      title: 'New Users (Week)',
      value: dashboard?.new_users_this_week || 0,
      icon: UserCheck,
      color: 'blue',
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your admin dashboard</p>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {primaryStats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon
                className={`h-4 w-4 ${
                  stat.color === 'blue'
                    ? 'text-blue-600'
                    : stat.color === 'green'
                    ? 'text-green-600'
                    : stat.color === 'yellow'
                    ? 'text-yellow-600'
                    : stat.color === 'red'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                  {stat.trend && (
                    <Badge
                      variant={
                        stat.color === 'red' || stat.color === 'yellow'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className="mt-1 text-xs"
                    >
                      {stat.trend}
                    </Badge>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {secondaryStats.map((stat) => (
          <Card key={stat.title} className="p-4">
            <div className="flex items-center space-x-2">
              <stat.icon
                className={`h-4 w-4 ${
                  stat.color === 'blue'
                    ? 'text-blue-600'
                    : stat.color === 'green'
                    ? 'text-green-600'
                    : stat.color === 'orange'
                    ? 'text-orange-600'
                    : stat.color === 'red'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              />
              <div>
                <p className="text-sm font-medium">{stat.title}</p>
                <p className="text-lg font-bold">
                  {isLoading ? '...' : stat.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Approval Queue */}
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Articles
            </CardTitle>
            {selectedArticles.length > 0 && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('approve')}
                  disabled={bulkActionMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve ({selectedArticles.length})
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkAction('reject')}
                  disabled={bulkActionMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject ({selectedArticles.length})
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : dashboard?.pending_articles_list?.length ? (
              <div className="space-y-3">
                {dashboard.pending_articles_list.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedArticles.includes(article.id)}
                        onCheckedChange={() =>
                          toggleArticleSelection(article.id)
                        }
                      />
                      <div className="flex-1">
                        <h4 className="font-medium line-clamp-1">
                          {article.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          by {article.author_detail.name} •{' '}
                          {new Date(article.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {article.categories_detail.map((cat) => (
                            <Badge
                              key={cat.id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {cat.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAction(article.id, 'approve')}
                        disabled={quickActionMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleQuickAction(article.id, 'reject')}
                        disabled={quickActionMutation.isPending}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No pending articles for approval
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Authors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Authors
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {dashboard?.top_authors?.map((author, index) => (
                  <div key={author.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{author.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {author.article_count} articles
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {author.role}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Articles</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {dashboard?.recent_articles?.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">
                        {article.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        by {article.author_detail.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {article.views}
                      </div>
                      <Badge
                        variant={
                          article.status === 'published'
                            ? 'default'
                            : article.status === 'draft'
                            ? 'secondary'
                            : 'destructive'
                        }
                        className="text-xs"
                      >
                        {article.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {dashboard?.recent_messages?.map((message, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">
                        {message.subject}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        from {message.name}
                      </p>
                    </div>
                    <Badge
                      variant={
                        message.status === 'new' ? 'destructive' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {message.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
