import { z } from "zod";

export const academicYears = ["1st year", "2nd year", "3rd year", "4th year", "Graduate"] as const;
export const jobRoles = ["Software Developer", "Frontend Developer", "Backend Developer", "Data Analyst", "Data Scientist", "AI / ML", "DevOps"] as const;
export const domains = ["Web Development", "Mobile Development", "Data", "AI", "Cloud"] as const;
export const experienceLevels = ["Fresher", "0–1 years", "1–2 years"] as const;
export const jobTypes = ["job", "internship", "both"] as const;
export const workModes = ["remote", "onsite", "hybrid"] as const;

export const profileSchema = z.object({
    fullName: z.string().min(3, "Full name must be at least 3 characters"),
    academicYear: z.enum(academicYears),
    // Removed conflicting 'skills' string transform. We use 'skillList' for the actual array data.
    // If we need a string input field validation, we can handle it in the UI component logic or use a separate schema for that field if strictly needed.

    skillList: z.array(z.string()).min(1, "Add at least one skill"),

    interests: z.string().optional(),

    targetRoles: z.array(z.enum(jobRoles)).min(1, "Select at least one target role"),
    targetDomains: z.array(z.enum(domains)).min(1, "Select at least one domain"),

    jobType: z.enum(jobTypes),
    workMode: z.enum(workModes),
    preferredLocations: z.string().optional(),

    experienceLevel: z.enum(experienceLevels),
    github_username: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
