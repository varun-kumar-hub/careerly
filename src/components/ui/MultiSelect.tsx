"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { Badge } from "@/components/ui/Badge";

// Re-evaluating: I will implement a `MultiSelect` component from scratch using standard React/Tailwind.

interface MultiSelectProps {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    className?: string;
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select items...",
    className,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelect = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter((item) => item !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    const handleRemove = (option: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(selected.filter((item) => item !== option));
    };

    return (
        <div className={cn("relative", className)} ref={containerRef}>
            <div
                className={cn(
                    "flex min-h-[42px] w-full items-center justify-between rounded-md border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
                    className
                )}
                onClick={() => setOpen(!open)}
            >
                <div className="flex flex-wrap gap-1">
                    {selected.length > 0 ? (
                        selected.map((item) => (
                            <Badge
                                key={item}
                                className="mr-1 mb-1 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-2 py-0.5"
                                onClick={(e) => handleRemove(item, e)}
                            >
                                {item}
                                <div
                                    role="button"
                                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleRemove(item, e as any);
                                        }
                                    }}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onClick={(e) => handleRemove(item, e)}
                                >
                                    <X className="h-3 w-3 text-blue-500 hover:text-blue-700" />
                                </div>
                            </Badge>
                        ))
                    ) : (
                        <span className="text-gray-500">{placeholder}</span>
                    )}
                </div>
                <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
            </div>

            {open && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {options.map((option) => (
                        <div
                            key={option}
                            className={cn(
                                "relative flex cursor-default select-none items-center py-2 pl-3 pr-9 hover:bg-blue-50 text-gray-900 cursor-pointer",
                                selected.includes(option) ? "bg-blue-50 text-blue-900" : ""
                            )}
                            onClick={() => handleSelect(option)}
                        >
                            <span
                                className={cn(
                                    "block truncate",
                                    selected.includes(option) ? "font-semibold" : "font-normal"
                                )}
                            >
                                {option}
                            </span>
                            {selected.includes(option) && (
                                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                                    <Check className="h-4 w-4" />
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
