"use client";

import {
  AlertCircle,
  BookMarked,
  BookOpen,
  Building2,
  LayoutDashboard,
  LogOut,
  Settings,
  UserCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { signOut } from "@/lib/actions/auth";
import { routes } from "@/lib/routes";
import type { UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: routes.dashboard,
    icon: LayoutDashboard,
    roles: ["system_operator", "library_admin", "librarian"],
  },
  {
    title: "Catalog",
    href: routes.catalog,
    icon: BookOpen,
    roles: ["library_admin", "librarian"],
  },
  {
    title: "Members",
    href: routes.members,
    icon: Users,
    roles: ["library_admin", "librarian"],
  },
  {
    title: "Borrowings",
    href: routes.borrowings,
    icon: BookMarked,
    roles: ["library_admin", "librarian"],
  },
  {
    title: "Overdue",
    href: routes.overdue,
    icon: AlertCircle,
    roles: ["library_admin", "librarian"],
  },
  {
    title: "Libraries",
    href: routes.libraries,
    icon: Building2,
    roles: ["system_operator"],
  },
  {
    title: "Users",
    href: routes.users,
    icon: Users,
    roles: ["system_operator"],
  },
  {
    title: "Librarians",
    href: routes.librarians,
    icon: UserCog,
    roles: ["library_admin"],
  },
  {
    title: "Policies",
    href: routes.policies,
    icon: Settings,
    roles: ["library_admin"],
  },
];

interface AppSidebarProps {
  userRole: UserRole;
  userName?: string | null;
  libraryName?: string | null;
}

export function AppSidebar({
  userRole,
  userName,
  libraryName,
}: AppSidebarProps) {
  const pathname = usePathname();

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userRole),
  );

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside className="flex flex-col h-screen w-64 bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-lg">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-sidebar-foreground">LIMS</h1>
            <p className="text-xs text-muted-foreground">Library Management</p>
          </div>
        </div>
      </div>

      {/* Library info */}
      {libraryName && (
        <div className="px-4 py-3 bg-sidebar-accent/50 border-b border-sidebar-border">
          <p className="text-xs text-muted-foreground">Current Library</p>
          <p className="text-sm font-medium text-sidebar-foreground truncate">
            {libraryName}
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-menu-active text-sidebar-menu-active-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-menu-hover hover:text-sidebar-menu-hover-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-sidebar-foreground truncate">
            {userName || "User"}
          </p>
          <p className="text-xs text-muted-foreground capitalize">
            {userRole.replace("_", " ")}
          </p>
        </div>
        <Separator className="my-2" />
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
