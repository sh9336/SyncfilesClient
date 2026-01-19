import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Files,
  Key,
  LogOut,
  Menu,
  X,
  ChevronRight,
  User,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: '/dashboard', icon: Files, label: 'Files' },
  { href: '/sync-tokens', icon: Key, label: 'Sync Tokens' },
  { href: '/profile', icon: Settings, label: 'Profile' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Minimalist */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-60 transform border-r border-border/50 bg-card/50 transition-transform duration-200 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center justify-between border-b border-border/50 px-4">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                <Files className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="font-semibold text-sm tracking-tight text-foreground">Scheduler Files</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-0.5 p-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary/5 text-primary'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  {item.label}
                  {isActive && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-border/50 p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-muted/50">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate font-medium text-foreground text-xs leading-none mb-1">
                      {user?.full_name || 'Tenant User'}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground leading-none">
                      {user?.email}
                    </p>
                  </div>
                  <Settings className="h-3.5 w-3.5 text-muted-foreground/50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem disabled className="text-xs">
                  <span className="text-muted-foreground">
                    {user?.company_name || 'No company'}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center text-xs">
                    <Settings className="mr-2 h-3.5 w-3.5" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive text-xs focus:text-destructive">
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header - Transparent/Minimal */}
        <header className="flex h-14 items-center gap-4 border-b border-border/50 bg-background/50 px-4 backdrop-blur-sm shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Breadcrumb / Title Area - kept empty or minimal so page content dominates */}
          <div className="flex-1 flex items-center gap-2">
            {/* Optional: Add global search or breadcrumbs here later */}
          </div>

          {/* Theme toggle */}
          <ThemeToggle />
        </header>

        {/* Page content - Scrollable Area */}
        <main className="flex-1 overflow-y-auto bg-background/50 relative">
          <div className="flex flex-col min-h-full">
            <div className="flex-1 p-4">
              {children}
            </div>

            <footer className="py-6 px-4 border-t border-border/30 mt-auto bg-background/50 backdrop-blur-sm">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wider opacity-60">
                <span className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500/50"></div>
                  System Operational
                </span>
                <span>Scheduler Files v1.0 • &copy; {new Date().getFullYear()}</span>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
