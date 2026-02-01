"use client";

import { JobListing } from "@/features/jobs/jobService";
import { Button } from "@/components/ui/Button";

interface ApplyConfirmModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    job: JobListing;
    isPending: boolean;
}

export function ApplyConfirmModal({ open, onOpenChange, onConfirm, job, isPending }: ApplyConfirmModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card w-full max-w-md rounded-lg border shadow-lg p-6 space-y-4">
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold">Apply to {job.company}?</h2>
                    <p className="text-sm text-muted-foreground">
                        You will be redirected to the employer's website to complete your application.
                        Careerly will track this as "Applied" in your dashboard.
                    </p>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button onClick={() => onConfirm()} disabled={isPending}>
                        {isPending ? "Redirecting..." : "Continue to Application"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
