"use client";

import { COUNTRIES, Country } from "@/constants/countries";
import {
    Select
} from "@/components/ui/Select";
import { Globe } from "lucide-react";

interface CountrySelectorProps {
    value: string;
    onChange: (value: string) => void;
}

export function CountrySelector({ value, onChange }: CountrySelectorProps) {
    const selected = COUNTRIES.find(c => c.code === value) || COUNTRIES[0];

    return (
        <Select value={value} onChange={(e) => onChange(e.target.value)}>
            {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                    {country.name} ({country.currency})
                </option>
            ))}
        </Select>
    );
}
