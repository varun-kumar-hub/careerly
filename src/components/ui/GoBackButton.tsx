"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { cn } from "@/utils/cn";

interface GoBackButtonProps {
    className?: string;
    label?: string;
    fallbackUrl?: string;
}

export function GoBackButton({ className, label = "Go Back", fallbackUrl }: GoBackButtonProps) {
    const router = useRouter();

    const handleBack = () => {
        if (window.history.length > 2) {
            router.back();
        } else if (fallbackUrl) {
            router.push(fallbackUrl);
        } else {
            router.back();
        }
    };

    return (
        <Button
            variant="ghost"
            onClick={handleBack}
            className={cn("gap-2 pl-0 hover:bg-transparent hover:text-blue-600 text-gray-500", className)}
        >
            <ChevronLeft className="h-4 w-4" />
            {label}
        </Button>
    );
}
