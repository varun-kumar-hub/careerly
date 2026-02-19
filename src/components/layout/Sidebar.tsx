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
import { useState } from "react";
import { cleanupOldJobsAction } from "@/features/admin/actions";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Recommended Jobs", href: "/jobs/recommended", icon: Sparkles },
    { name: "Explore Jobs", href: "/jobs/explore", icon: Search },
    { name: "My Resume", href: "/resume", icon: FileText },
    { name: "Applications", href: "/applications", icon: Home },
    { name: "API Key", href: "/settings/ai", icon: Settings },
    { name: "Profile", href: "/profile", icon: User },
];

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
        <aside className="group w-20 hover:w-64 bg-white border-r border-gray-200 shadow-sm hidden md:flex flex-col shrink-0 transition-all duration-300 ease-in-out z-20 h-screen sticky top-0">
            {/* Logo Area */}
            <div className="flex h-16 items-center px-4 border-b border-gray-100 overflow-hidden whitespace-nowrap shrink-0">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 shrink-0">
                        <Briefcase className="h-6 w-6" />
                    </div>
                    <span className="text-xl font-bold text-gray-900 tracking-tight opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">Careerly</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6 overflow-x-hidden scrollbar-none hover:scrollbar-thin">
                <div>
                    {/* Section Header */}
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-4 whitespace-nowrap">
                        Main
                    </h3>
                    <ul className="space-y-1">
                        {navItems.slice(0, 3).map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 overflow-hidden whitespace-nowrap",
                                        pathname === item.href
                                            ? "bg-primary/5 text-primary"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                    title={item.name}
                                >
                                    <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", pathname === item.href ? "text-primary" : "text-gray-400 group-hover:text-gray-500")} />
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-[-10px] group-hover:translate-x-0">{item.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-4 whitespace-nowrap">
                        Career Tools
                    </h3>
                    <ul className="space-y-1">
                        {navItems.slice(3, 5).map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 overflow-hidden whitespace-nowrap",
                                        pathname === item.href
                                            ? "bg-primary/5 text-primary"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                    title={item.name}
                                >
                                    <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", pathname === item.href ? "text-primary" : "text-gray-400")} />
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-[-10px] group-hover:translate-x-0">{item.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-4 whitespace-nowrap">
                        System
                    </h3>
                    <ul className="space-y-1">
                        {navItems.slice(5).map((item) => {
                            if (item.adminOnly && !isAdmin) return null;
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 overflow-hidden whitespace-nowrap",
                                            pathname === item.href
                                                ? "bg-primary/5 text-primary"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        )}
                                        title={item.name}
                                    >
                                        <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", pathname === item.href ? "text-primary" : "text-gray-400")} />
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-[-10px] group-hover:translate-x-0">{item.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                        {/* Admin Link */}
                        {isAdmin && (
                            <li>
                                <Link
                                    href="/admin"
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 overflow-hidden whitespace-nowrap",
                                        pathname === "/admin"
                                            ? "bg-red-50 text-red-700"
                                            : "text-gray-600 hover:bg-red-50 hover:text-red-700"
                                    )}
                                    title="Admin Panel"
                                >
                                    <Shield className={cn("h-5 w-5 shrink-0 transition-colors", pathname === "/admin" ? "text-red-600" : "text-gray-400")} />
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-[-10px] group-hover:translate-x-0">Admin Panel</span>
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </nav>

            {/* GitHub Connect */}
            <div className="p-3 border-t border-gray-100 overflow-hidden">
                <GitHubConnect compact />
            </div>

            {/* Profile & Logout */}
            <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
                    <div className="h-9 w-9 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm text-primary font-bold">
                        {user?.email?.[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
                            {user?.email?.split('@')[0]}
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                            {isAdmin ? 'Administrator' : 'Job Seeker'}
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="mt-3 flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors overflow-hidden whitespace-nowrap"
                    title="Sign Out"
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Sign Out</span>
                </button>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl ring-1 ring-gray-200 animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-semibold text-gray-900">Sign out?</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Are you sure you want to sign out? This will clear your session.
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
                                {isCleaning ? "Signing out..." : "Sign Out"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
