import { ProfileSetupForm } from "@/features/profile/ProfileSetupForm";

export default function OnboardingPage() {
    return (
        <div className="min-h-screen bg-muted/50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="w-full max-w-3xl bg-card p-8 rounded-lg shadow-sm border">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome to Careerly</h1>
                    <p className="mt-2 text-muted-foreground">Please complete your profile to access your dashboard.</p>
                </div>
                <ProfileSetupForm />
            </div>
        </div>
    );
}
