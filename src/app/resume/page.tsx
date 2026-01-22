import { createClient } from "@/utils/supabase/server";
import { ResumeUploadForm } from "@/features/resume/ResumeUploadForm";
import { Card } from "@/components/ui/Card"; // Need to create Card component
import { Badge } from "@/components/ui/Badge"; // Need to create Badge component
import { AlertCircle, CheckCircle, FileText } from "lucide-react";

export default async function ResumePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch latest resume analysis
    const { data: analysis } = await supabase
        .from("resume_analysis")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">My Resume</h1>
            </div>

            {/* Upload Section */}
            <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
                <div className="space-y-4">
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                        <h3 className="font-semibold mb-4">Upload New Resume</h3>
                        <ResumeUploadForm />
                    </div>
                    {analysis && (
                        <div className="rounded-lg border bg-muted/50 p-4 text-sm">
                            <p className="font-medium">Current File:</p>
                            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                <span className="truncate">{analysis.file_name}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Analysis Results */}
                <div className="space-y-6">
                    {!analysis && (
                        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed bg-muted/20">
                            <p className="text-muted-foreground">Upload a resume to see analysis.</p>
                        </div>
                    )}

                    {analysis && (
                        <>
                            {/* Structural Check */}
                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                                <h3 className="text-lg font-semibold mb-4">Structure Check</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(analysis.detected_sections).map(([section, detected]) => (
                                        <div key={section} className="flex items-center gap-2">
                                            {detected ? (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                            )}
                                            <span className="capitalize">{section}</span>
                                        </div>
                                    ))}
                                </div>

                                {analysis.structural_issues && (analysis.structural_issues as string[]).length > 0 && (
                                    <div className="mt-6 pt-4 border-t">
                                        <p className="font-medium text-amber-600 mb-2">Issues Detected:</p>
                                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                            {(analysis.structural_issues as string[]).map((issue: string, i: number) => (
                                                <li key={i}>{issue}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Skills */}
                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                                <h3 className="text-lg font-semibold mb-4">Extracted Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {(analysis.extracted_skills as string[])?.map((skill: string) => (
                                        <span key={skill} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                                            {skill}
                                        </span>
                                    ))}
                                    {(!analysis.extracted_skills || (analysis.extracted_skills as string[]).length === 0) && (
                                        <p className="text-sm text-muted-foreground">No specific skills detected from dictionary.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
