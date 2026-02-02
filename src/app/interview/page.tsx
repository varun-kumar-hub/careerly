"use client";

import { useState } from "react";
import { BackButton } from "@/components/ui/BackButton";
import { generateInterviewQuestions } from "@/features/interview/actions";
import { MessageSquare } from "lucide-react";
import { JobDescriptionInput } from "@/components/ui/JobDescriptionInput";
import { QuestionsList, InterviewTips } from "@/features/interview/components";

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
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
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
                        <JobDescriptionInput
                            jobDescription={jobDescription}
                            onJobDescriptionChange={setJobDescription}
                            onGenerate={handleGenerate}
                            loading={loading}
                            buttonColor="bg-green-600 hover:bg-green-700"
                            buttonText="Generate Questions"
                        />
                        <InterviewTips />
                    </div>

                    {/* Output Section */}
                    <div className="space-y-4">
                        <QuestionsList questions={questions} error={error} />
                    </div>
                </div>
            </div>
        </div>
    );
}
