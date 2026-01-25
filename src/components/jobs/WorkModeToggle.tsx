"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/utils/cn";

export function WorkModeToggle() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentMode = searchParams.get("mode") || "all";

    const modes = [
        { value: "all", label: "All" },
        { value: "remote", label: "Remote" },
        { value: "onsite", label: "Onsite" },
        { value: "hybrid", label: "Hybrid" },
    ];

    const handleModeChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (val && val !== "all") {
            params.set("mode", val);
        } else {
            params.delete("mode");
        }
        router.push(`/jobs?${params.toString()}`);
    };

    return (
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            {modes.map((m) => (
                <button
                    key={m.value}
                    onClick={() => handleModeChange(m.value)}
                    className={cn(
                        "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                        (currentMode === m.value || (m.value === "all" && !currentMode))
                            ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                    )}
                >
                    {m.label}
                </button>
            ))}
        </div>
    );
}
