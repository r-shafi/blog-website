import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { adminApi } from '@/lib/api/admin';
import { useQuery } from '@tanstack/react-query';
import { Bell, Clock, MessageSquare, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotificationBell() {
  const { data: dashboard } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboardStats(),
    refetchInterval: 30000,
  });

  const notifications = [];

  // Generate notifications based on data
  if (dashboard?.pending_articles > 0) {
    notifications.push({
      id: 'pending-articles',
      title: 'Articles Awaiting Approval',
      message: `${dashboard.pending_articles} articles need your review`,
      icon: Clock,
      href: '/admin/posts?status=pending',
      urgent: dashboard.pending_articles > 10,
    });
  }

  if (dashboard?.unread_messages > 0) {
    notifications.push({
      id: 'unread-messages',
      title: 'New Contact Messages',
      message: `${dashboard.unread_messages} unread messages`,
      icon: MessageSquare,
      href: '/admin/messages',
      urgent: dashboard.unread_messages > 5,
    });
  }

  if (dashboard?.new_users_this_week > 5) {
    notifications.push({
      id: 'new-users',
      title: 'High User Registration',
      message: `${dashboard.new_users_this_week} new users this week`,
      icon: Users,
      href: '/admin/users',
      urgent: false,
    });
  }

  if (dashboard?.spam_reports > 0) {
    notifications.push({
      id: 'spam-reports',
      title: 'Spam Reports',
      message: `${dashboard.spam_reports} items flagged for review`,
      icon: Bell,
      href: '/admin/posts',
      urgent: true,
    });
  }

  const urgentCount = notifications.filter((n) => n.urgent).length;
  const totalCount = notifications.length;

  if (totalCount === 0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {totalCount > 0 && (
            <Badge
              variant={urgentCount > 0 ? 'destructive' : 'secondary'}
              className="absolute -top-1 -right-1 h-5 min-w-[20px] text-xs flex items-center justify-center"
            >
              {totalCount > 99 ? '99+' : totalCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
              {urgentCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {urgentCount} urgent
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-64 overflow-y-auto">
            {notifications.map((notification) => (
              <Link
                key={notification.id}
                to={notification.href}
                className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <notification.icon
                    className={`h-4 w-4 mt-0.5 ${
                      notification.urgent ? 'text-red-500' : 'text-blue-500'
                    }`}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {notification.title}
                      </p>
                      {notification.urgent && (
                        <Badge variant="destructive" className="text-xs">
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
