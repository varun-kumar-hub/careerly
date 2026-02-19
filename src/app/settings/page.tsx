import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Shield, Bell, Github } from "lucide-react";

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login");
    }

    return (
        <div className="container max-w-4xl py-10">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>

            <div className="grid gap-6">
                <div className="border rounded-lg p-6 bg-white shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profile Settings
                    </h2>
                    <p className="text-gray-600 mb-4">Manage your personal information and preferences.</p>
                    <Link
                        href="/profile"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                        Edit Profile
                    </Link>
                </div>

                <div className="border rounded-lg p-6 bg-white shadow-sm opacity-60">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Security & Privacy
                    </h2>
                    <p className="text-gray-600 mb-4">Password and authentication settings (Coming soon).</p>
                </div>

                <div className="border rounded-lg p-6 bg-white shadow-sm opacity-60">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notifications
                    </h2>
                    <p className="text-gray-600 mb-4">Manage email and push notifications (Coming soon).</p>
                </div>

                <div className="border rounded-lg p-6 bg-white shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Github className="h-5 w-5" />
                        Integrations
                    </h2>
                    <p className="text-gray-600 mb-4">Connect external accounts.</p>
                    <Link
                        href="/settings/ai"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                    >
                        Manage AI Integrations
                    </Link>
                </div>
            </div>
        </div>
    );
}
