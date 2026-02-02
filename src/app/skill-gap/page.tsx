"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { BackButton } from "@/components/ui/BackButton";
import { analyzeSkillGap } from "@/features/skill-gap/actions";
import { useProfile } from "@/hooks/useProfile";
import { BarChart3, Loader2, FileText, Sparkles, AlertCircle } from "lucide-react";
import {
    SkillComparisonGrid,
    MatchScoreCard,
    AnalysisResults,
    UserSkillsDisplay
} from "@/features/skill-gap/components";

export default function SkillGapPage() {
    const { profile, loading: profileLoading } = useProfile();
    const [jobDescription, setJobDescription] = useState("");
    const [analysis, setAnalysis] = useState("");
    const [matchedSkills, setMatchedSkills] = useState<string[]>([]);
    const [skillGaps, setSkillGaps] = useState<string[]>([]);
    const [matchPercentage, setMatchPercentage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!jobDescription || jobDescription.length < 50) return;
        if (!profile?.skills || profile.skills.length === 0) {
            setError("Please add skills to your profile first");
            return;
        }

        setLoading(true);
        setError(null);
        setAnalysis("");

        try {
            const result = await analyzeSkillGap(jobDescription, profile.skills);
            if (result.success) {
                setAnalysis(result.analysis);
                setMatchedSkills(result.matchedSkills);
                setSkillGaps(result.skillGaps);
                setMatchPercentage(result.matchPercentage);
            } else {
                setError(result.error || "Failed to analyze skills");
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
                            <BarChart3 className="h-8 w-8 text-orange-500" />
                            Skill Gap Analysis
                        </h1>
                        <p className="text-gray-400">
                            Compare your skills against job requirements with AI
                        </p>
                    </div>
                </div>

                {/* User Skills */}
                <UserSkillsDisplay skills={profile?.skills} loading={profileLoading} />

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-4">
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                <FileText className="inline h-4 w-4 mr-2" />
                                Job Description
                            </label>
                            <textarea
                                className="w-full h-64 bg-gray-950 border border-gray-800 rounded-lg p-4 text-gray-300 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none resize-none"
                                placeholder="Paste the job description to analyze skill gaps..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-xs text-gray-500">
                                    {jobDescription.length}/50 minimum characters
                                </p>
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={loading || jobDescription.length < 50 || !profile?.skills?.length}
                                    className="bg-orange-600 hover:bg-orange-700 text-white"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Analyze Skills
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Output Section */}
                    <div className="space-y-4">
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <MatchScoreCard matchPercentage={matchPercentage} />
                        <SkillComparisonGrid matchedSkills={matchedSkills} skillGaps={skillGaps} />
                        {!error && <AnalysisResults analysis={analysis} />}
                    </div>
                </div>
            </div>
        </div>
    );
}
