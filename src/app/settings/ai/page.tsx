import { AIConfigForm } from "@/features/settings/components/AIConfigForm";
import { BackButton } from "@/components/ui/BackButton";

export default function AISettingsPage() {
    return (
        <div className="container py-8 px-4 max-w-5xl mx-auto">
            <div className="mb-6">
                <BackButton fallbackUrl="/dashboard" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
            <AIConfigForm />
        </div>
    );
}
