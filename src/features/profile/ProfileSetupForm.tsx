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
import { useState } from "react";
import { cn } from "@/utils/cn";

export function ProfileSetupForm() {
    const { updateProfile, profile } = useProfile();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    // Initialize form with default values (could preload from profile if exists)
    // For now simple empty or default.
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: "",
            skillList: [],
            targetRoles: [],
            targetDomains: [],
            preferredLocations: [],
            // defaults...
        }
    });

    const { register, handleSubmit, formState: { errors }, watch, setValue } = form;

    // Simple Multi-Select Helper (Primitive UI for now)
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
            // Map form values to DB schema keys
            const dbPayload = {
                full_name: data.fullName,
                academic_year: data.academicYear,
                skills: data.skillList, // Array
                interests: data.interests,
                job_roles: data.targetRoles,
                domains: data.targetDomains,
                job_type: data.jobType,
                work_mode: data.workMode,
                preferred_locations: data.preferredLocations,
                experience_level: data.experienceLevel
            };

            const { error } = await updateProfile(dbPayload);

            if (error) {
                alert("Failed to save profile: " + error.message);
            } else {
                router.push("/dashboard");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto py-10">

            <div className="space-y-4">
                <div>
                    <h2 className="text-2xl font-bold">Personal Details</h2>
                    <p className="text-muted-foreground">Let's start with the basics.</p>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" {...register("fullName")} placeholder="John Doe" />
                    {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Select id="academicYear" {...register("academicYear")}>
                        <option value="">Select Year</option>
                        {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </Select>
                    {errors.academicYear && <p className="text-red-500 text-sm">{errors.academicYear.message}</p>}
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <h2 className="text-2xl font-bold">Skills & expertise</h2>
                    <p className="text-muted-foreground">What do you bring to the table?</p>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="skills">Skills (Comma separated)</Label>
                    <Input
                        id="skills"
                        placeholder="React, Node.js, Python..."
                        onChange={(e) => {
                            // Manual transform for this simple input to array mapping
                            const val = e.target.value;
                            setValue("skillList", val.split(",").map(s => s.trim()).filter(Boolean));
                        }}
                    />
                    {errors.skillList && <p className="text-red-500 text-sm">{errors.skillList.message}</p>}
                </div>

                <div className="grid gap-2">
                    <Label>Target Roles</Label>
                    <div className="flex flex-wrap gap-2">
                        {jobRoles.map(role => (
                            <button
                                type="button"
                                key={role}
                                onClick={() => handleMultiSelectChange("targetRoles", role, currentRoles)}
                                className={cn(
                                    "px-3 py-1 rounded-full text-sm border transition-colors",
                                    currentRoles.includes(role)
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background hover:bg-muted"
                                )}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                    {errors.targetRoles && <p className="text-red-500 text-sm">{errors.targetRoles.message}</p>}
                </div>

                <div className="grid gap-2">
                    <Label>Domains</Label>
                    <div className="flex flex-wrap gap-2">
                        {domains.map(d => (
                            <button
                                type="button"
                                key={d}
                                onClick={() => handleMultiSelectChange("targetDomains", d, currentDomains)}
                                className={cn(
                                    "px-3 py-1 rounded-full text-sm border transition-colors",
                                    currentDomains.includes(d)
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background hover:bg-muted"
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
                    <h2 className="text-2xl font-bold">Preferences</h2>
                    <p className="text-muted-foreground">Where and how do you want to work?</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="jobType">Job Type</Label>
                        <Select id="jobType" {...register("jobType")}>
                            <option value="">Select...</option>
                            {jobTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </Select>
                        {errors.jobType && <p className="text-red-500 text-sm">{errors.jobType.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="workMode">Work Mode</Label>
                        <Select id="workMode" {...register("workMode")}>
                            <option value="">Select...</option>
                            {workModes.map(m => <option key={m} value={m}>{m}</option>)}
                        </Select>
                        {errors.workMode && <p className="text-red-500 text-sm">{errors.workMode.message}</p>}
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <Select id="experienceLevel" {...register("experienceLevel")}>
                        <option value="">Select...</option>
                        {experienceLevels.map(e => <option key={e} value={e}>{e}</option>)}
                    </Select>
                    {errors.experienceLevel && <p className="text-red-500 text-sm">{errors.experienceLevel.message}</p>}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="locations">Preferred Locations (Comma separated)</Label>
                    <Input id="locations" {...register("preferredLocations")} placeholder="New York, London, Remote..." />
                </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? "Saving Profile..." : "Complete Setup"}
            </Button>
        </form>
    );
}
