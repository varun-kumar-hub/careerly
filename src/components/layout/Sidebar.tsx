"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/cn";
import {
    Briefcase,
    FileText,
    Home,
    LayoutDashboard,
    LogOut,
    Settings,
    User
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Find Jobs", href: "/jobs", icon: Briefcase },
    { name: "My Resume", href: "/resume", icon: FileText },
    { name: "Applications", href: "/applications", icon: Home }, // Using Home as placeholder for Apps
    { name: "Profile", href: "/profile", icon: User },
];

export function Sidebar() {
    const pathname = usePathname();
    const { signOut, user } = useAuth();

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-card">
            <div className="flex h-14 items-center border-b px-4">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                    <Briefcase className="h-6 w-6 text-primary" />
                    <span className="text-lg">Careerly</span>
                </Link>
            </div>

            <div className="flex-1 overflow-auto py-4">
                <nav className="grid gap-1 px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t p-4">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="truncate text-sm font-medium text-foreground">{user?.email}</p>
                        <p className="text-xs text-muted-foreground">Applicant</p>
                    </div>
                </div>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => signOut()}>
                    <LogOut className="h-4 w-4" />
                    Log out
                </Button>
            </div>
        </div>
    );
}
