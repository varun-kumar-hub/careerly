"use client";

import { COUNTRIES, Country } from "@/constants/countries";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/Select";
import { Globe } from "lucide-react";

interface CountrySelectorProps {
    value: string;
    onChange: (value: string) => void;
}

export function CountrySelector({ value, onChange }: CountrySelectorProps) {
    const selected = COUNTRIES.find(c => c.code === value) || COUNTRIES[0];

    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-[180px] h-12 bg-white border-gray-300 focus:ring-blue-500/20 gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <SelectValue>{selected.name}</SelectValue>
            </SelectTrigger>
            <SelectContent>
                {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                        <span className="flex items-center gap-2">
                            <span>{country.name}</span>
                            <span className="text-gray-400 text-xs">({country.currency})</span>
                        </span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
