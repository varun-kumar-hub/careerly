"use client";

import { Lightbulb } from "lucide-react";

export function InterviewTips() {
    return (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <h3 className="text-green-400 font-medium mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Interview Tips
            </h3>
            <ul className="text-sm text-gray-400 space-y-1">
                <li>• Use the STAR method for behavioral questions</li>
                <li>• Practice answers out loud, not just in your head</li>
                <li>• Prepare 2-3 questions to ask the interviewer</li>
                <li>• Research the company culture beforehand</li>
            </ul>
        </div>
    );
}
