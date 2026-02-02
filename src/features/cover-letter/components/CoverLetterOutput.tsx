"use client";

import { Button } from "@/components/ui/Button";
import { Copy, Sparkles, AlertCircle } from "lucide-react";

interface CoverLetterOutputProps {
    letter: string;
    onLetterChange: (value: string) => void;
    isAI: boolean;
    error: string | null;
    onCopy: () => void;
}

export function CoverLetterOutput({
    letter,
    onLetterChange,
    isAI,
    error,
    onCopy
}: CoverLetterOutputProps) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 h-full flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                    Your Cover Letter
                </label>
                {letter && (
                    <span className={`text-xs px-2 py-1 rounded-full ${isAI
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                        {isAI ? "✨ AI Generated" : "📝 Template"}
                    </span>
                )}
            </div>

            {error && (
                <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2 text-yellow-400 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}

            {letter ? (
                <>
                    <textarea
                        className="w-full flex-grow bg-gray-50 border border-gray-200 rounded-lg p-6 text-gray-800 font-serif leading-relaxed text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 min-h-[300px]"
                        value={letter}
                        onChange={(e) => onLetterChange(e.target.value)}
                    />
                    <div className="mt-4 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCopy}
                            className="border-gray-700 hover:bg-gray-800 text-gray-300"
                        >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Text
                        </Button>
                    </div>
                </>
            ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg bg-white min-h-[300px]">
                    <Sparkles className="h-12 w-12 mb-4 opacity-20 text-purple-500" />
                    <p className="text-sm">AI-generated letter will appear here</p>
                    <p className="text-xs text-gray-400 mt-2">Powered by Gemini 2.5 Flash</p>
                </div>
            )}
        </div>
    );
}
