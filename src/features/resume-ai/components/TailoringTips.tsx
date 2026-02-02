"use client";

import { CheckCircle } from "lucide-react";

export function TailoringTips() {
    return (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <h3 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Tips for Best Results
            </h3>
            <ul className="text-sm text-gray-400 space-y-1">
                <li>• Include the complete job description</li>
                <li>• Make sure you&apos;ve uploaded your resume first</li>
                <li>• The more details, the better the suggestions</li>
            </ul>
        </div>
    );
}
