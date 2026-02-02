"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/cn";
import { isAdminEmail } from "@/constants/adminEmails";
import {
    Briefcase,
    FileText,
    Home,
    LayoutDashboard,
    LogOut,
    Settings,
    User,
    Shield,
    Sparkles,
    Search
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GitHubConnect } from "@/features/github/components/GitHubConnect";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Recommended Jobs", href: "/jobs/recommended", icon: Sparkles },
    { name: "Explore Jobs", href: "/jobs/explore", icon: Search },
    { name: "My Resume", href: "/resume", icon: FileText },
    { name: "Applications", href: "/applications", icon: Home },
    { name: "API Key", href: "/settings/ai", icon: Settings },
    { name: "Profile", href: "/profile", icon: User },
];

import { useState } from "react";
import { cleanupOldJobsAction } from "@/features/admin/actions";

export function Sidebar() {
    const pathname = usePathname();
    const { signOut, user } = useAuth();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isCleaning, setIsCleaning] = useState(false);

    // Check if current user is admin
    const isAdmin = user?.email ? isAdminEmail(user.email) : false;

    const handleLogout = async () => {
        setIsCleaning(true);
        try {
            // Remove jobs posted before 30 days on logout
            await cleanupOldJobsAction();
        } catch (error) {
            console.error("Cleanup failed:", error);
        } finally {
            setIsCleaning(false);
            await signOut();
        }
    };

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

                    {/* Admin Panel Link - Only visible for admins */}
                    {isAdmin && (
                        <Link
                            href="/admin"
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap overflow-hidden",
                                pathname === "/admin"
                                    ? "bg-red-50 text-red-700 hover:bg-red-100"
                                    : "text-red-600 hover:bg-red-50 hover:text-red-700"
                            )}
                            title="Admin Panel"
                        >
                            <Shield className={cn("h-5 w-5 shrink-0 transition-colors", pathname === "/admin" ? "text-red-600" : "text-red-500")} />
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">Admin Panel</span>
                        </Link>
                    )}

                    {/* GitHub Connection */}
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <GitHubConnect compact />
                    </div>
                </nav>
            </div>

            <div className="border-t border-gray-100 p-4 overflow-hidden whitespace-nowrap">
                <div className="flex items-center gap-3 mb-4 px-1">
                    <div className={cn(
                        "h-9 w-9 shrink-0 rounded-full flex items-center justify-center font-bold text-sm border",
                        isAdmin
                            ? "bg-red-100/50 text-red-700 border-red-200"
                            : "bg-blue-100/50 text-blue-700 border-blue-200"
                    )}>
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="truncate text-sm font-medium text-gray-900">{user?.email}</p>
                        <p className={cn("text-xs font-medium", isAdmin ? "text-red-600" : "text-gray-500")}>
                            {isAdmin ? "Admin" : "Applicant"}
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 px-2 text-gray-600 hover:text-red-600 hover:bg-red-50"
                    onClick={() => setShowLogoutConfirm(true)}
                    title="Log out"
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Log out</span>
                </Button>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-semibold text-gray-900">Sign out?</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Are you sure you want to sign out? This will also clean up old job listings (older than 30 days) from the cache.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowLogoutConfirm(false)}
                                disabled={isCleaning}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleLogout}
                                disabled={isCleaning}
                            >
                                {isCleaning ? "Cleaning..." : "Yes, Sign Out"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
