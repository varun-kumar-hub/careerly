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
        <div className="group sticky top-0 flex h-screen w-20 flex-col border-r border-gray-200 bg-white text-gray-900 transition-all duration-300 hover:w-64 z-50 shadow-sm">
            <div className="flex h-16 items-center border-b border-gray-100 px-4 whitespace-nowrap overflow-hidden">
                <Link href="/dashboard" className="flex items-center gap-3 font-semibold text-primary">
                    <Briefcase className="h-7 w-7 shrink-0" />
                    <span className="text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">Careerly</span>
                </Link>
            </div>

            <div className="flex-1 overflow-x-hidden overflow-y-auto py-4">
                <nav className="grid gap-2 px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap overflow-hidden",
                                    isActive
                                        ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                                title={item.name}
                            >
                                <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-blue-600" : "text-gray-500")} />
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t border-gray-100 p-4 overflow-hidden whitespace-nowrap">
                <div className="flex items-center gap-3 mb-4 px-1">
                    <div className="h-9 w-9 shrink-0 rounded-full bg-blue-100/50 flex items-center justify-center text-blue-700 font-bold text-sm border border-blue-200">
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="truncate text-sm font-medium text-gray-900">{user?.email}</p>
                        <p className="text-xs text-gray-500">Applicant</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 px-2 text-gray-600 hover:text-red-600 hover:bg-red-50"
                    onClick={() => signOut()}
                    title="Log out"
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Log out</span>
                </Button>
            </div>
        </div>
    );
}
