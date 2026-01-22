"use client";

import { useProfile } from "@/hooks/useProfile";
import { Card } from "@/components/ui/Card"; // Need to create this
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";

export default function DashboardPage() {
    const { profile, loading } = useProfile();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        {loading ? "Loading..." : `Welcome back, ${profile?.full_name || 'candidate'}!`}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/resume">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Upload Resume
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Quick Stats / Cards Placeholder */}
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <h3 className="font-semibold leading-none tracking-tight">Resume Status</h3>
                    <p className="text-sm text-muted-foreground mt-2">No active resume uploaded.</p>
                    <Button variant="link" className="px-0 mt-4 h-auto" asChild>
                        <Link href="/resume">Upload now &rarr;</Link>
                    </Button>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <h3 className="font-semibold leading-none tracking-tight">Job Recommendations</h3>
                    <p className="text-sm text-muted-foreground mt-2">Complete your profile and resume to see matches.</p>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <h3 className="font-semibold leading-none tracking-tight">Applications</h3>
                    <div className="text-2xl font-bold mt-2">0</div>
                    <p className="text-xs text-muted-foreground">Active applications</p>
                </div>
            </div>
        </div>
    );
}
