"use client";

import { useTransition, useState } from "react";
import { uploadResumeAction } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2 } from "lucide-react";

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
                />
            </div>
            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Analyzing..." : "Upload & Analyze"}
            </Button>
        </form>
    );
}
