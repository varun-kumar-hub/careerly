"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useProfile } from "@/hooks/useProfile";
import { Loader2, Check, Key } from "lucide-react";

// Simple schema just for the API key
const aiConfigSchema = z.object({
    geminiApiKey: z.string().min(1, "API Key is required").optional().or(z.literal("")),
});

type AIConfigValues = z.infer<typeof aiConfigSchema>;

export function AIConfigForm() {
    const { profile, updateProfile, loading } = useProfile();
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Using a fresh form for the "Update" action
    const form = useForm<AIConfigValues>({
        resolver: zodResolver(aiConfigSchema),
        defaultValues: {
            geminiApiKey: "",
        },
    });

    const { register, handleSubmit, reset, formState: { errors } } = form;
    const hasKey = !!profile?.gemini_api_key;

    // We no longer auto-fill the form with the existing key to avoid accidental edits.
    // The existing key is shown in the "Status" section.

    const onSubmit = async (data: AIConfigValues) => {
        setSubmitting(true);
        setSuccess(false);
        try {
            const { error } = await updateProfile({
                gemini_api_key: data.geminiApiKey || null,
            });

            if (error) {
                alert("Failed to save API Key");
                console.error(error);
            } else {
                setSuccess(true);
                reset({ geminiApiKey: "" }); // Clear input after successful update
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveKey = async () => {
        if (confirm("Are you sure you want to remove your API Key? AI features will stop working.")) {
            setSubmitting(true);
            try {
                const { error } = await updateProfile({
                    gemini_api_key: null,
                });
                if (!error) {
                    reset({ geminiApiKey: "" });
                    alert("API Key removed successfully.");
                }
            } finally {
                setSubmitting(false);
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-purple-600" /></div>;
    }

    return (
        <div className="space-y-8">
            {/* Section 1: Current Status (Only if key exists) */}
            {hasKey && (
                <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Check className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Current Status</h2>
                            <p className="text-sm text-gray-500">Your API key is configured and active</p>
                        </div>
                        <div className="ml-auto">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                            </span>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex items-center justify-between">
                        <code className="text-sm text-gray-600 font-mono">
                            {isVisible ? profile?.gemini_api_key : "AIza********************************"}
                        </code>
                        <button
                            type="button"
                            onClick={() => setIsVisible(!isVisible)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title={isVisible ? "Hide Key" : "Show Key"}
                        >
                            {isVisible ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Section 2: Modify / Setup (Always visible, acts as Update if key exists) */}
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Key className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {hasKey ? "Update Configuration" : "Setup API Key"}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {hasKey ? "Enter a new key to replace the current one" : "Configure your Gemini API key to enable AI features"}
                        </p>
                    </div>
                    {!hasKey && (
                        <div className="ml-auto">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Not Configured
                            </span>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="geminiApiKey" className="text-gray-700 font-medium">
                            {hasKey ? "New Gemini API Key" : "Gemini API Key"}
                        </Label>
                        <div className="relative">
                            <Input
                                id="geminiApiKey"
                                type="password"
                                placeholder={hasKey ? "Enter new API Key to update..." : "Enter your Gemini API Key (begins with AIza...)"}
                                className="bg-gray-50 border-gray-300 pr-10 font-mono text-sm"
                                {...register("geminiApiKey")}
                            />
                        </div>
                        {errors.geminiApiKey && <p className="text-red-500 text-sm">{errors.geminiApiKey.message}</p>}
                        <p className="text-xs text-gray-500 leading-relaxed">
                            This key is used to power features like <strong>Resume Tailoring</strong>, <strong>Cover Letter Generation</strong>, and <strong>Interview Prep</strong>.
                            <br />
                            You can get a free key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-purple-600 hover:underline">Google AI Studio</a>.
                        </p>
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white min-w-[150px]"
                        >
                            {submitting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {hasKey ? "Updating..." : "Saving..."}</>
                            ) : success ? (
                                <><Check className="mr-2 h-4 w-4" /> {hasKey ? "Updated Successfully" : "Saved Successfully"}</>
                            ) : (
                                hasKey ? "Update API Key" : "Save Configuration"
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Section 3: Danger Zone */}
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-red-100">
                <h3 className="text-lg font-bold text-red-600 mb-2">Remove API Key</h3>
                <p className="text-sm text-gray-500 mb-4">
                    Deleting your API key will disable all AI-powered features until a new key is added.
                </p>
                <Button
                    onClick={handleRemoveKey}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    disabled={!hasKey || submitting}
                >
                    Delete API Key
                </Button>
            </div>
        </div>
    );
}
