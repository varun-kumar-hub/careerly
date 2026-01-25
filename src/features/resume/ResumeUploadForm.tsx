"use client";

import { useTransition, useState } from "react";
import { uploadResumeAction } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2 } from "lucide-react";

/**
 * Component for uploading resumes.
 * Uses a Server Action `uploadResumeAction` to handle the file upload and analysis.
 * Displays a loading state while processing.
 */
export function ResumeUploadForm() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setError(null);
        startTransition(async () => {
            const result = await uploadResumeAction(formData);
            if (!result.success) {
                setError(result.error || "Upload failed");
            } else {
                // Success - UI will update via revalidatePath, maybe toast here?
            }
        });
    };

    return (
        <form action={handleSubmit} className="grid gap-4">
            <div className="grid w-full items-center gap-1.5">
                <Input
                    id="resume"
                    name="resume"
                    type="file"
                    accept=".pdf,.docx"
                    required
                    disabled={isPending}
                    className="bg-gray-50 border-gray-200 text-gray-900 file:text-blue-600 file:font-medium hover:bg-gray-100 transition-colors"
                />
            </div>
            {error && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">{error}</p>
            )}
            <Button type="submit" disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Analyzing..." : "Upload & Analyze"}
            </Button>
        </form>
    );
}
