import { createClient } from "@/utils/supabase/server";
import { ResumeUploadForm } from "@/features/resume/ResumeUploadForm";
import { Card } from "@/components/ui/Card"; // Need to create Card component
import { Badge } from "@/components/ui/Badge"; // Need to create Badge component
import { AlertCircle, CheckCircle, FileText } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";

export default async function ResumePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch latest resume analysis
    // Fetch ALL resume analyses for history
    const { data: analyses } = await supabase
        .from("resume_analysis")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

    // The most recent one is the current active resume
    const currentResume = analyses && analyses.length > 0 ? analyses[0] : null;

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
                <div className="flex items-center gap-4 mb-2">
                    <BackButton fallbackUrl="/dashboard" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Resume</h1>
                        <p className="text-gray-500">Upload your resume to extract skills and match jobs.</p>
                    </div>
                </div>

                {/* Upload Section */}
                <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
                    <div className="space-y-4">
                        <div className="rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm p-6">
                            <h3 className="font-semibold mb-4 text-gray-900">Upload New Resume</h3>
                            <ResumeUploadForm />
                        </div>
                        {currentResume && (
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
                                <p className="font-medium text-gray-900">Current File:</p>
                                <div className="flex items-center gap-2 mt-1 text-gray-500">
                                    <FileText className="h-4 w-4" />
                                    <span className="truncate">{currentResume.file_name}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Analysis Results */}
                    <div className="space-y-6">
                        {!currentResume && (
                            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50">
                                <p className="text-gray-500">Upload a resume to see analysis.</p>
                            </div>
                        )}

                        {currentResume && (
                            <>
                                {/* Structural Check */}
                                <div className="rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm p-6">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Structure Check</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(currentResume.detected_sections).map(([section, detected]) => (
                                            <div key={section} className="flex items-center gap-2">
                                                {detected ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                                )}
                                                <span className="capitalize text-gray-700">{section}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {currentResume.structural_issues && (currentResume.structural_issues as string[]).length > 0 && (
                                        <div className="mt-6 pt-4 border-t border-gray-100">
                                            <p className="font-medium text-amber-600 mb-2">Issues Detected:</p>
                                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                                {(currentResume.structural_issues as string[]).map((issue: string, i: number) => (
                                                    <li key={i}>{issue}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* Skills */}
                                <div className="rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm p-6">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Extracted Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {(currentResume.extracted_skills as string[])?.map((skill: string) => (
                                            <span key={skill} className="inline-flex items-center rounded-full border border-blue-200 px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700">
                                                {skill}
                                            </span>
                                        ))}
                                        {(!currentResume.extracted_skills || (currentResume.extracted_skills as string[]).length === 0) && (
                                            <p className="text-sm text-gray-500">No specific skills detected from dictionary.</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Resume History */}
                        {analyses && analyses.length > 0 && (
                            <div className="rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm p-6 mt-8">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900">Upload History</h3>
                                <div className="space-y-3">
                                    {analyses.map((item, index) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-gray-900 text-sm">{item.file_name || "Unknown Filename"}</p>
                                                        {index === 0 && (
                                                            <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded-full font-medium">Current</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
