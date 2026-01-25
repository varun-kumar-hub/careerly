"use client";

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Github } from "lucide-react";

interface GitHubConnectProps {
    value?: string;
    onChange: (val: string) => void;
}

export function GitHubConnect({ value, onChange }: GitHubConnectProps) {
    return (
        <div className="space-y-2">
            <Label className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                GitHub Username
            </Label>
            <Input
                placeholder="e.g. vercel"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                className="bg-gray-800 border-gray-700"
            />
            <p className="text-xs text-muted-foreground">
                Enter your public GitHub username to display your repositories on your dashboard.
            </p>
        </div>
    );
}
