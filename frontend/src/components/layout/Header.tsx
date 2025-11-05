import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import {
  ChevronDown,
  LayoutDashboardIcon,
  LogOut,
  Menu,
  Moon,
  PenSquare,
  Sun,
  UserCircle,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container-newspaper">
        <div className="flex justify-between items-center py-4 border-b border-gray-100">
          <Link to="/" className="font-serif text-3xl font-bold">
            Blog Website
          </Link>

          <nav className="hidden md:flex justify-center py-4 pl-16">
            <ul className="flex space-x-8">
              <li>
                <Link
                  to="/"
                  className="navbar-link text-sm uppercase tracking-wider font-medium"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/blogs"
                  className="navbar-link text-sm uppercase tracking-wider font-medium"
                >
                  Blogs
                </Link>
              </li>
              <li>
                <Link
                  to="/authors"
                  className="navbar-link text-sm uppercase tracking-wider font-medium"
                >
                  Authors
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="navbar-link text-sm uppercase tracking-wider font-medium"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="navbar-link text-sm uppercase tracking-wider font-medium"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={
                theme === 'dark'
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <div className="hidden md:flex space-x-2">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <UserCircle className="h-4 w-4" />
                      {user?.name || 'Account'}
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-white dark:bg-gray-900 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 min-w-[180px] p-1"
                  >
                    {user?.role === 'admin' && (
                      <DropdownMenuItem
                        asChild
                        className="py-2 px-3 my-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 cursor-pointer w-full"
                        >
                          <LayoutDashboardIcon className="h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user?.role && (
                      <DropdownMenuItem
                        asChild
                        className="py-2 px-3 my-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Link
                          to="/write"
                          className="flex items-center gap-2 cursor-pointer w-full"
                        >
                          <PenSquare className="h-4 w-4" />
                          <span>Write</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      asChild
                      className="py-2 px-3 my-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 cursor-pointer w-full"
                      >
                        <UserCircle className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
                    <DropdownMenuItem
                      onClick={logout}
                      className="py-2 px-3 my-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">Register</Button>
                  </Link>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden">
            <nav className="flex flex-col space-y-4 py-4">
              <Link
                to="/"
                className="navbar-link px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/blogs"
                className="navbar-link px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blogs
              </Link>
              <Link
                to="/authors"
                className="navbar-link px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Authors
              </Link>
              <Link
                to="/about"
                className="navbar-link px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="navbar-link px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="navbar-link px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              {(user?.role === 'admin' || user?.role === 'author') && (
                <Link
                  to="/write"
                  className="navbar-link px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Write
                </Link>
              )}
              <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center gap-2"
                      >
                        <UserCircle className="h-4 w-4" />
                        Profile
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      className="w-full flex items-center gap-2"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button size="sm" className="w-full">
                        Register
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
