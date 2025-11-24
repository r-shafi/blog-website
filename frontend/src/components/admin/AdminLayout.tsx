import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/use-auth';
import { adminApi } from '@/lib/api/admin';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  FilesIcon,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Tags,
  Users2,
} from 'lucide-react';
import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NotificationBell } from './NotificationBell';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get notification counts
  const { data: dashboard } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboardStats(),
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const sidebarLinks = [
    {
      title: 'Overview',
      href: '/admin',
      icon: BarChart3,
      badge: null,
    },
    {
      title: 'Users',
      href: '/admin/users',
      icon: Users2,
      badge:
        dashboard?.new_users_this_week > 0
          ? dashboard.new_users_this_week
          : null,
    },
    {
      title: 'Blog Posts',
      href: '/admin/posts',
      icon: FilesIcon,
      badge:
        dashboard?.pending_articles > 0 ? dashboard.pending_articles : null,
    },
    {
      title: 'Categories & Tags',
      href: '/admin/taxonomy',
      icon: Tags,
      badge: null,
    },
    {
      title: 'Messages',
      href: '/admin/messages',
      icon: MessageSquare,
      badge: dashboard?.unread_messages > 0 ? dashboard.unread_messages : null,
    },
    {
      title: 'Newsletter Subscribers',
      href: '/admin/subscribers',
      icon: Mail,
      badge: null,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
        <Link to="/admin" className="font-bold text-xl">
          Admin Dashboard
        </Link>
        <div className="hidden lg:block">
          <NotificationBell />
        </div>
      </div>
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50'
                    : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <link.icon className="h-4 w-4" />
                <span className="flex-1">{link.title}</span>
                {link.badge && (
                  <Badge
                    variant="destructive"
                    className="ml-auto h-5 min-w-[20px] text-xs flex items-center justify-center"
                  >
                    {link.badge > 99 ? '99+' : link.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      {/* User profile section */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={user?.avatar || '/placeholder.svg'}
            alt={user?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:block bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        {sidebarContent}
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 h-16">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              {sidebarContent}
            </SheetContent>
          </Sheet>
          <Link to="/admin" className="font-bold text-lg">
            Admin Dashboard
          </Link>
          <NotificationBell />
        </div>
      </div>

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="container mx-auto max-w-7xl p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
