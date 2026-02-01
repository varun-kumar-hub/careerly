"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { BackButton } from "@/components/ui/BackButton";
import { generateInterviewQuestions } from "@/features/interview/actions";
import { MessageSquare, Loader2, FileText, Sparkles, AlertCircle, Lightbulb } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function InterviewPrepPage() {
    const [jobDescription, setJobDescription] = useState("");
    const [questions, setQuestions] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!jobDescription || jobDescription.length < 50) return;
        setLoading(true);
        setError(null);
        setQuestions("");

        try {
            const result = await generateInterviewQuestions(jobDescription);
            if (result.success) {
                setQuestions(result.questions);
            } else {
                setError(result.error || "Failed to generate questions");
            }
        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <BackButton fallbackUrl="/dashboard" />
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <MessageSquare className="h-8 w-8 text-green-500" />
                            Interview Prep
                        </h1>
                        <p className="text-gray-400">
                            Practice with AI-generated interview questions tailored to the job
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-4">
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                <FileText className="inline h-4 w-4 mr-2" />
                                Job Description
                            </label>
                            <textarea
                                className="w-full h-72 bg-gray-950 border border-gray-800 rounded-lg p-4 text-gray-300 focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none resize-none"
                                placeholder="Paste the job description to get relevant interview questions...

The AI will generate:
• Behavioral questions (STAR format)
• Technical/skill-based questions
• Situational questions
• Culture fit questions"
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-xs text-gray-500">
                                    {jobDescription.length}/50 minimum characters
                                </p>
                                <Button
                                    type="button"
                                    onClick={handleGenerate}
                                    disabled={loading || jobDescription.length < 50}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Generate Questions
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Tips */}
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
                    </div>

                    {/* Output Section */}
                    <div className="space-y-4">
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 min-h-[500px] flex flex-col">
                            <label className="block text-sm font-medium text-gray-300 mb-4">
                                <MessageSquare className="inline h-4 w-4 mr-2 text-green-500" />
                                Practice Questions
                            </label>

                            {error && (
                                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400">
                                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            {questions ? (
                                <div className="flex-grow overflow-auto bg-gray-950 border border-gray-800 rounded-lg p-6">
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <ReactMarkdown>{questions}</ReactMarkdown>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-grow flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-gray-800 rounded-lg bg-gray-950/50">
                                    <MessageSquare className="h-16 w-16 mb-4 opacity-20 text-green-500" />
                                    <p className="text-sm text-center">
                                        Paste a job description to generate <br />
                                        tailored interview questions
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Powered by Gemini 2.5 Flash
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
