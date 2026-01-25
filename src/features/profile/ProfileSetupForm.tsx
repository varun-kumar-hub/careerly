"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, ProfileFormValues, academicYears, jobRoles, domains, experienceLevels, jobTypes, workModes } from "./profileValidator";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/utils/cn";
import { Github } from "lucide-react";

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
            experienceLevel: undefined,
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
                experienceLevel: (profile.experience_level as any) || "",
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
                work_mode: data.workMode,
                preferred_locations: data.preferredLocations ? data.preferredLocations.split(',').map(s => s.trim()).filter(Boolean) : [],
                experience_level: data.experienceLevel,
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

                <div className="grid gap-2">
                    <Label htmlFor="github" className="text-gray-700">GitHub Username (Optional)</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            <Github className="h-4 w-4" />
                        </span>
                        <Input
                            id="github"
                            {...register("github_username")}
                            placeholder="username"
                            className="bg-gray-50 border-gray-300 pl-10"
                        />
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
                    <div className="flex flex-wrap gap-2">
                        {jobRoles.map(role => (
                            <button
                                type="button"
                                key={role}
                                onClick={() => handleMultiSelectChange("targetRoles", role, currentRoles)}
                                className={cn(
                                    "px-3 py-1 rounded-full text-sm border transition-colors duration-200",
                                    currentRoles.includes(role)
                                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                )}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                    {errors.targetRoles && <p className="text-red-500 text-sm">{errors.targetRoles.message}</p>}
                </div>

                <div className="grid gap-2">
                    <Label className="text-gray-700">Domains</Label>
                    <div className="flex flex-wrap gap-2">
                        {domains.map(d => (
                            <button
                                type="button"
                                key={d}
                                onClick={() => handleMultiSelectChange("targetDomains", d, currentDomains)}
                                className={cn(
                                    "px-3 py-1 rounded-full text-sm border transition-colors duration-200",
                                    currentDomains.includes(d)
                                        ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                )}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                    {errors.targetDomains && <p className="text-red-500 text-sm">{errors.targetDomains.message}</p>}
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 mt-8">Preferences</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="jobType" className="text-gray-700">Job Type</Label>
                        <Select id="jobType" {...register("jobType")} className="bg-gray-50 border-gray-300">
                            <option value="">Select...</option>
                            {jobTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </Select>
                        {errors.jobType && <p className="text-red-500 text-sm">{errors.jobType.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="workMode" className="text-gray-700">Work Mode</Label>
                        <Select id="workMode" {...register("workMode")} className="bg-gray-50 border-gray-300">
                            <option value="">Select...</option>
                            {workModes.map(m => <option key={m} value={m}>{m}</option>)}
                        </Select>
                        {errors.workMode && <p className="text-red-500 text-sm">{errors.workMode.message}</p>}
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="experienceLevel" className="text-gray-700">Experience Level</Label>
                    <Select id="experienceLevel" {...register("experienceLevel")} className="bg-gray-50 border-gray-300">
                        <option value="">Select...</option>
                        {experienceLevels.map(e => <option key={e} value={e}>{e}</option>)}
                    </Select>
                    {errors.experienceLevel && <p className="text-red-500 text-sm">{errors.experienceLevel.message}</p>}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="locations" className="text-gray-700">Preferred Locations</Label>
                    <Input id="locations" {...register("preferredLocations")} placeholder="New York, London, Remote..." className="bg-gray-50 border-gray-300" />
                </div>
            </div>

            <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-8" disabled={submitting}>
                {submitting ? "Saving Profile..." : "Save Profile"}
            </Button>
        </form>
    );
}
