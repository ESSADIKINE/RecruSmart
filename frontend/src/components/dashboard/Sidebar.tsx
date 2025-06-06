import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  BriefcaseBusiness,
  LayoutDashboard,
  FileText,
  Clock,
  UserCircle,
  FileEdit,
  Users,
  LogOut,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isCandidate = user?.role === 'candidate';

  const candidateLinks = [
    {
      title: 'Dashboard',
      href: '/dashboard/candidate',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: 'Job Listings',
      href: '/dashboard/jobs',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: 'Applications',
      href: '/dashboard/applications',
      icon: <Clock className="h-5 w-5" />,
    },
    {
      title: 'Profile',
      href: '/dashboard/profile',
      icon: <UserCircle className="h-5 w-5" />,
    },
  ];

  const recruiterLinks = [
    {
      title: 'Dashboard',
      href: '/dashboard/recruiter',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: 'Post Job',
      href: '/dashboard/post-job',
      icon: <FileEdit className="h-5 w-5" />,
    },
    {
      title: 'Manage Applicants',
      href: '/dashboard/applicants',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Profile',
      href: '/dashboard/profile',
      icon: <UserCircle className="h-5 w-5" />,
    },
  ];

  const links = isCandidate ? candidateLinks : recruiterLinks;

  return (
    <div className="w-64 h-full flex flex-col border-r bg-card">
      {/* Logo */}
      <div className="px-6 py-5 flex items-center border-b">
        <Link to="/" className="flex items-center space-x-2 font-semibold text-lg">
          <BriefcaseBusiness className="h-6 w-6 text-primary" />
          <span>RecruSmart</span>
        </Link>
      </div>

      {/* User */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={user?.profilePicture || "https://i.pravatar.cc/150?img=33"}
              alt={user?.name || "User"}
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full"></span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role || "User"}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === link.href
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:text-foreground hover:bg-muted"
              )}
            >
              {link.icon}
              <span>{link.title}</span>
            </Link>
          ))}
        </nav>

        <Separator className="my-4" />

        <nav className="space-y-1">
          <Link
            to="/settings"
            className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
          <Link
            to="/help"
            className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
          >
            <HelpCircle className="h-5 w-5" />
            <span>Help & Support</span>
          </Link>
        </nav>
      </ScrollArea>

      {/* Logout */}
      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full flex items-center justify-start"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}