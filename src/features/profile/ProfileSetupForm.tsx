"use client";

import { MultiSelect } from "@/components/ui/MultiSelect";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, ProfileFormValues, academicYears, jobRoles, domains, jobTypes } from "./profileValidator";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/utils/cn";

export function ProfileSetupForm() {
    const { updateProfile, profile } = useProfile();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: "",
            skillList: [],
            targetRoles: [],
            targetDomains: [],
            preferredLocations: "",
            academicYear: undefined,
            interests: "",
            jobType: undefined,
            workMode: undefined,
            isFresher: true,
            yearsOfExperience: undefined,
            previousCompany: "",
            previousRole: "",
            changeReason: "",
            github_username: "",
        }
    });

    const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = form;

    // Load existing profile data into form
    useEffect(() => {
        if (profile) {
            reset({
                fullName: profile.full_name || "",
                academicYear: (profile.academic_year as any) || "",
                skillList: profile.skills || [],
                interests: profile.interests || "",
                targetRoles: (profile.job_roles as any) || [],
                targetDomains: (profile.domains as any) || [],
                jobType: (profile.job_type as any) || "",
                workMode: (profile.work_mode as any) || "",
                preferredLocations: (profile.preferred_locations || []).join(", "),
                isFresher: profile.experience_level === "Fresher" || !profile.experience_level,
                yearsOfExperience: profile.experience_level && profile.experience_level !== "Fresher"
                    ? parseInt(profile.experience_level) || undefined
                    : undefined,
                previousCompany: profile.previous_company || "",
                previousRole: profile.previous_role || "",
                changeReason: profile.change_reason || "",
                github_username: profile.github_username || "",
            });
        }
    }, [profile, reset]);

    const handleMultiSelectChange = (
        field: keyof ProfileFormValues,
        value: string,
        currentValues: string[] | undefined
    ) => {
        const safeCurrent = currentValues || [];
        if (safeCurrent.includes(value)) {
            setValue(field, safeCurrent.filter(v => v !== value) as any);
        } else {
            setValue(field, [...safeCurrent, value] as any);
        }
    };

    const currentRoles = watch("targetRoles") || [];
    const currentDomains = watch("targetDomains") || [];
    const isFresherValue = watch("isFresher");

    const onSubmit = async (data: ProfileFormValues) => {
        setSubmitting(true);
        try {
            const dbPayload = {
                full_name: data.fullName,
                academic_year: data.academicYear,
                skills: data.skillList,
                interests: data.interests,
                job_roles: data.targetRoles,
                domains: data.targetDomains,
                job_type: data.jobType,
                work_mode: data.workMode || "remote",
                preferred_locations: data.preferredLocations ? data.preferredLocations.split(',').map(s => s.trim()).filter(Boolean) : [],
                experience_level: data.isFresher ? "Fresher" : `${data.yearsOfExperience || 0} years`,
                previous_company: data.isFresher ? null : (data.previousCompany || null),
                previous_role: data.isFresher ? null : (data.previousRole || null),
                change_reason: data.isFresher ? null : (data.changeReason || null),
                // gemini_api_key removed from this payload to prevent overwriting with null/empty if field is missing
                github_username: data.github_username
            };

            const { error } = await updateProfile(dbPayload);

            if (error) {
                const msg = typeof error === 'string' ? error : error.message;
                alert("Failed to save profile: " + msg);
            } else {
                router.push("/profile"); // Redirect back to profile page instead of dashboard
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto">

            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Personal Details</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="fullName" className="text-gray-700">Full Name</Label>
                        <Input id="fullName" {...register("fullName")} placeholder="John Doe" className="bg-gray-50 border-gray-300" />
                        {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="academicYear" className="text-gray-700">Academic Year</Label>
                        <Select id="academicYear" {...register("academicYear")} className="bg-gray-50 border-gray-300">
                            <option value="">Select Year</option>
                            {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </Select>
                        {errors.academicYear && <p className="text-red-500 text-sm">{errors.academicYear.message}</p>}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 mt-8">Skills & Expertise</h2>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="skills" className="text-gray-700">Skills (Comma separated)</Label>
                    <Input
                        id="skills"
                        placeholder="React, Node.js, Python..."
                        className="bg-gray-50 border-gray-300"
                        defaultValue={watch("skillList")?.join(", ")} // Ensure default value shows correctly on edit
                        onChange={(e) => {
                            const val = e.target.value;
                            setValue("skillList", val.split(",").map(s => s.trim()).filter(Boolean));
                        }}
                    />
                    {errors.skillList && <p className="text-red-500 text-sm">{errors.skillList.message}</p>}
                </div>

                <div className="grid gap-2">
                    <Label className="text-gray-700">Target Roles</Label>
                    <MultiSelect
                        options={[...jobRoles]}
                        selected={currentRoles}
                        onChange={(selected) => setValue("targetRoles", selected as any)}
                        placeholder="Select roles..."
                    />
                    {errors.targetRoles && <p className="text-red-500 text-sm">{errors.targetRoles.message}</p>}
                </div>

                <div className="grid gap-2">
                    <Label className="text-gray-700">Domains</Label>
                    <MultiSelect
                        options={[...domains]}
                        selected={currentDomains}
                        onChange={(selected) => setValue("targetDomains", selected as any)}
                        placeholder="Select domains..."
                    />
                    {errors.targetDomains && <p className="text-red-500 text-sm">{errors.targetDomains.message}</p>}
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 mt-8">Preferences</h2>
                </div>

                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="jobType" className="text-gray-700">Job Type</Label>
                        <Select id="jobType" {...register("jobType")} className="bg-gray-50 border-gray-300">
                            <option value="">Select...</option>
                            {jobTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                        </Select>
                        {errors.jobType && <p className="text-red-500 text-sm">{errors.jobType.message}</p>}
                    </div>
                </div>

                <div className="grid gap-4">
                    <Label className="text-gray-700">Experience</Label>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                {...register("isFresher")}
                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-700 font-medium">I am a Fresher</span>
                        </label>
                    </div>

                    {!isFresherValue && (
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="yearsOfExperience" className="text-gray-700">Years of Experience</Label>
                                <Input
                                    id="yearsOfExperience"
                                    type="number"
                                    min="0"
                                    max="50"
                                    placeholder="Enter years of experience"
                                    className="bg-gray-50 border-gray-300 max-w-xs"
                                    {...register("yearsOfExperience", { valueAsNumber: true })}
                                />
                                {errors.yearsOfExperience && <p className="text-red-500 text-sm">{errors.yearsOfExperience.message}</p>}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="previousCompany" className="text-gray-700">Previous Company</Label>
                                    <Input
                                        id="previousCompany"
                                        placeholder="Company Name"
                                        className="bg-gray-50 border-gray-300"
                                        {...register("previousCompany")}
                                    />
                                    {errors.previousCompany && <p className="text-red-500 text-sm">{errors.previousCompany.message}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="previousRole" className="text-gray-700">Previous Role</Label>
                                    <Input
                                        id="previousRole"
                                        placeholder="Job Title"
                                        className="bg-gray-50 border-gray-300"
                                        {...register("previousRole")}
                                    />
                                    {errors.previousRole && <p className="text-red-500 text-sm">{errors.previousRole.message}</p>}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="changeReason" className="text-gray-700">Reason for Changing Company</Label>
                                <Input
                                    id="changeReason"
                                    placeholder="e.g. Seeking better growth opportunities..."
                                    className="bg-gray-50 border-gray-300"
                                    {...register("changeReason")}
                                />
                                {errors.changeReason && <p className="text-red-500 text-sm">{errors.changeReason.message}</p>}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Show validation errors if any */}
            {Object.keys(errors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-600 font-medium mb-2">Please fix the following errors:</p>
                    <ul className="text-red-500 text-sm list-disc list-inside">
                        {Object.entries(errors).map(([field, error]) => (
                            <li key={field}>{field}: {(error as any)?.message || 'Invalid'}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex gap-4 mt-8">
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => router.push('/profile')}
                >
                    Cancel
                </Button>
                <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={submitting}>
                    {submitting ? "Saving Profile..." : "Save Profile"}
                </Button>
            </div>
        </form>
    );
}
