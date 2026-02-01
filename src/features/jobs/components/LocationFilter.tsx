"use client";

import { Input } from "@/components/ui/Input";
import { MapPin, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function LocationFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentLoc = searchParams.get("l") || "";

    const [location, setLocation] = useState(currentLoc);

    useEffect(() => {
        setLocation(currentLoc);
    }, [currentLoc]);

    const handleSearch = (loc: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (loc) {
            params.set("l", loc);
        } else {
            params.delete("l");
        }
        router.push(`/jobs?${params.toString()}`);
    };

    const clearLocation = () => {
        setLocation("");
        handleSearch("");
    };

    return (
        <div className="relative w-full max-w-sm">
            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
                placeholder="City, state, or remote..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(location)}
                className="pl-9 pr-8 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 text-gray-900 placeholder:text-gray-400"
            />
            {location && (
                <button
                    onClick={clearLocation}
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
