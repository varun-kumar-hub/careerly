import { createClient } from "@/utils/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { deleteApplicationAction } from "@/features/applications/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ExternalLink, MapPin, Trash2 } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";

export default async function ApplicationsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const { data: applications } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    // ...

    return (
        <div className="space-y-8 max-w-5xl mx-auto p-4 sm:p-6">
            <BackButton fallbackUrl="/dashboard" />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">My Applications</h1>
                    <p className="text-gray-400">Track and manage your job applications.</p>
                </div>
                <Link href="/jobs">
                    <Button>Find More Jobs</Button>
                </Link>
            </div>

            <div className="grid gap-4">
                {(!applications || applications.length === 0) && (
                    <div className="text-center py-12 border rounded bg-muted/20 text-gray-500">
                        You haven't tracked any applications yet.
                    </div>
                )}

                {applications?.map((app) => (
                    <Card key={app.id} className="p-6 bg-gray-900 border-gray-800 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <div className="space-y-2 flex-1">
                            <h3 className="text-xl font-semibold text-blue-400">
                                {app.job_url ? (
                                    <a href={app.job_url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2">
                                        {app.job_title}
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                ) : (
                                    app.job_title
                                )}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-300 font-medium">
                                <span>{app.company_name}</span>
                                {app.location && (
                                    <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1 text-sm text-gray-500">
                                            <MapPin className="h-3 w-3" />
                                            {app.location}
                                        </span>
                                    </>
                                )}
                            </div>
                            <div className="flex gap-2 mt-2">
                                <Badge variant={
                                    app.status === 'offer' ? 'default' :
                                        app.status === 'rejected' ? 'destructive' :
                                            'secondary'
                                } className="capitalize">
                                    {app.status}
                                </Badge>
                                <span className="text-xs text-gray-500 self-center">
                                    Applied: {new Date(app.applied_date).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <form action={async () => {
                                "use server";
                                await deleteApplicationAction(app.id);
                            }}>
                                <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </form>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
