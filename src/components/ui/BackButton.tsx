"use client";

import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
    label?: string;
    fallbackUrl?: string; // Where to go if history is empty (optional logic) or just as a hard link preference
}

export function BackButton({ label = "Back", fallbackUrl = "/dashboard" }: BackButtonProps) {
    const router = useRouter();

    const handleBack = () => {
        // Explicitly go to the fallback URL (usually Dashboard) for predictable navigation.
        // relying on router.back() can be flaky with redirects/new tabs.
        router.push(fallbackUrl);
    };

    return (
        <Button
            variant="ghost"
            onClick={handleBack}
            className="gap-2 text-muted-foreground hover:text-foreground mb-4 pl-0 hover:bg-transparent"
        >
            <ArrowLeft className="h-4 w-4" />
            {label}
        </Button>
    );
}
