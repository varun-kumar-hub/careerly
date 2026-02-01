"use client";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Search, MapPin, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

interface JobsSearchProps {
    defaultQuery: string;
    defaultLocation: string;
    hasProfile: boolean;
}

export function JobsSearch({ defaultQuery, defaultLocation, hasProfile }: JobsSearchProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(defaultQuery);
    const [location, setLocation] = useState(defaultLocation);

    // Sync state if URL changes externally (e.g. back button)
    // Sync state if URL changes externally (e.g. back button)
    useEffect(() => {
        const q = searchParams.get("q") || "";
        const l = searchParams.get("l") || "";
        if (q !== query) setQuery(q);
        if (l !== location) setLocation(l);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();

        const params = new URLSearchParams(searchParams.toString());

        if (query.trim()) {
            params.set("q", query.trim());
        } else {
            params.delete("q");
        }

        if (location.trim()) {
            params.set("l", location.trim());
        } else {
            params.delete("l");
        }

        router.push(`/jobs?${params.toString()}`);
    };

    const clearQuery = () => setQuery("");
    const clearLocation = () => setLocation("");

    return (
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4 w-full">
            {/* Query Input */}
            <div className="relative flex-grow group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <Input
                    name="q"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={hasProfile ? "Search by title (defaults to your skills)..." : "Search by title, skill, or company..."}
                    className="pl-10 pr-8 h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 text-lg text-gray-900 transition-all font-medium placeholder:text-gray-400"
                />
                {query && (
                    <button
                        type="button"
                        onClick={clearQuery}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Location Input */}
            <div className="relative w-full lg:max-w-[300px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                    name="l"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, state, or remote..."
                    className="pl-10 pr-8 h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 text-lg text-gray-900 transition-all font-medium placeholder:text-gray-400"
                />
                {location && (
                    <button
                        type="button"
                        onClick={clearLocation}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Search Button */}
            <Button
                type="submit"
                size="lg"
                className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-all text-base shrink-0"
            >
                Search Jobs
            </Button>
        </form>
    );
}
