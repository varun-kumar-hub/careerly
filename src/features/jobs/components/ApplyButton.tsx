"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { JobListing } from "@/features/jobs/jobService";
import { handleApplyClick } from "@/features/applications/applyHandler";
import { ExternalLink, CheckCircle } from "lucide-react";

interface ApplyButtonProps {
    job: JobListing;
}

// Re-import the modal
import { ApplyConfirmModal } from "./ApplyConfirmModal";
import { handleUnapplyClick } from "@/features/applications/unapplyHandler";
import { X } from "lucide-react";

export function ApplyButton({ job }: ApplyButtonProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [hasApplied, setHasApplied] = useState(false);

    // Initial click -> Show confirmation modal
    const handleApplyInit = () => {
        setOpen(true);
    };

    // Confirmed in Modal -> Go to URL & Track
    const handleConfirm = () => {
        window.open(job.url, "_blank");
        setHasApplied(true);
        setOpen(false);
        startTransition(async () => {
            await handleApplyClick(job);
        });
    };

    // Undo Application -> Untrack
    const handleUndo = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent standard clicks
        if (confirm("Mark this job as NOT applied?")) {
            setHasApplied(false);
            startTransition(async () => {
                await handleUnapplyClick(job.id);
            });
        }
    };

    if (!job.url) {
        return <Button disabled variant="outline" size="sm">Application Unavailable</Button>;
    }

    if (hasApplied) {
        return (
            <Button
                variant="secondary"
                size="sm"
                className="gap-2 text-green-600 bg-green-50 hover:bg-red-50 hover:text-red-600 transition-colors group relative"
                onClick={handleUndo}
                title="Click to unmark as applied"
            >
                <div className="flex items-center gap-2 group-hover:hidden">
                    <CheckCircle className="h-4 w-4" />
                    Applied
                </div>
                <div className="hidden group-hover:flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Unmark
                </div>
            </Button>
        );
    }

    return (
        <>
            <Button onClick={handleApplyInit} size="sm" className="gap-2">
                Apply Now
                <ExternalLink className="h-4 w-4" />
            </Button>

            <ApplyConfirmModal
                open={open}
                onOpenChange={setOpen}
                onConfirm={handleConfirm}
                job={job}
                isPending={isPending}
            />
        </>
    );
}
