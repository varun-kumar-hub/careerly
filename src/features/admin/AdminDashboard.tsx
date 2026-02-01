import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { isAdminEmail } from "@/constants/adminEmails";
import Link from "next/link";
import {
    Users,
    Briefcase,
    FileText,
    Activity,
    TrendingUp,
    ArrowLeft
} from "lucide-react";

interface RecentUserProfile {
    id: string;
    full_name: string | null;
    skills: string[] | null;
    academic_year: string | null;
}

export async function AdminDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Double-check admin access (middleware should already handle this)
    if (!user || !isAdminEmail(user.email)) {
        redirect("/dashboard");
    }

    // Fetch admin stats
    const [
        { count: userCount },
        { count: jobCount },
        { count: resumeCount },
        { data: recentUsers }
    ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("jobs").select("*", { count: "exact", head: true }),
        supabase.from("resume_analysis").select("*", { count: "exact", head: true }),
        supabase.from("profiles")
            .select("id, full_name, skills, academic_year")
            .limit(10)
    ]);

    const stats = [
        {
            label: "Total Users",
            value: userCount || 0,
            icon: Users,
            color: "bg-blue-500",
            bgColor: "bg-blue-50"
        },
        {
            label: "Jobs in Database",
            value: jobCount || 0,
            icon: Briefcase,
            color: "bg-green-500",
            bgColor: "bg-green-50"
        },
        {
            label: "Resumes Analyzed",
            value: resumeCount || 0,
            icon: FileText,
            color: "bg-purple-500",
            bgColor: "bg-purple-50"
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-500" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                                <p className="text-sm text-gray-500">Welcome, {user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                            <Activity className="h-4 w-4" />
                            Admin Access
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
                {/* Scraper Status Notification */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-blue-900">Scraper Configuration</h3>
                        <p className="text-blue-700 mt-1">
                            Incremental scraping is active. Jobs older than 6 months are automatically deleted from the database.
                        </p>
                    </div>
                    <div className="flex bg-white/50 rounded-lg p-2 border border-blue-100 divide-x divide-blue-100 text-sm">
                        <div className="px-3 py-1">
                            <span className="block text-xs text-blue-500 font-semibold uppercase">Window</span>
                            <span className="text-blue-900 font-medium">30 Days</span>
                        </div>
                        <div className="px-3 py-1">
                            <span className="block text-xs text-blue-500 font-semibold uppercase">Retention</span>
                            <span className="text-blue-900 font-medium">6 Months</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-3">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">
                                        {stat.value.toLocaleString()}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Users */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            Recent Users ({userCount || 0} total)
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {recentUsers && recentUsers.length > 0 ? (
                            recentUsers.map((profile: RecentUserProfile) => (
                                <div key={profile.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                            {(profile.full_name || "U").charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {profile.full_name || "Unnamed User"}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {profile.academic_year || "No year"} • {profile.skills?.length || 0} skills
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        ID: {profile.id?.slice(0, 8)}...
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-8 text-center text-gray-500">
                                No users found
                            </div>
                        )}
                    </div>
                </div>

                {/* Admin Actions */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Link
                        href="/api/admin/ingest-jobs"
                        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-green-50 group-hover:bg-green-100 transition-colors">
                                <Briefcase className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Refresh Job Database</h3>
                                <p className="text-sm text-gray-500">Trigger a fresh scrape from all job sources</p>
                            </div>
                        </div>
                    </Link>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm opacity-60">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-gray-100">
                                <Users className="h-6 w-6 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-500">Manage Users</h3>
                                <p className="text-sm text-gray-400">Coming soon...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
