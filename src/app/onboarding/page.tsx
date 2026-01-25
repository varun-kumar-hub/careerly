import { ProfileSetupForm } from "@/features/profile/ProfileSetupForm";

export default function OnboardingPage({ searchParams }: { searchParams: { mode?: string } }) {
    const isEdit = searchParams.mode === 'edit';

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="w-full max-w-3xl bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        {isEdit ? "Edit Profile" : "Welcome to Careerly"}
                    </h1>
                    <p className="mt-2 text-gray-500">
                        {isEdit ? "Update your details below." : "Please complete your profile to access your dashboard."}
                    </p>
                </div>
                <ProfileSetupForm />
            </div>
        </div>
    );
}
