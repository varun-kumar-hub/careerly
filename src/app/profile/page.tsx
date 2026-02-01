"use client";

import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Edit, User, MapPin, Briefcase, GraduationCap, Github } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";
import { Badge } from "@/components/ui/Badge";

export default function ProfilePage() {
    const { profile, loading } = useProfile();
    const router = useRouter();

    // ... loading logic ...

    // ... return logic ...
    <Button
        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        onClick={() => router.push("/onboarding?mode=edit")}
    >
        <Edit className="h-4 w-4" />
        Edit Profile
    </Button>

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">
                Loading...
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center justify-center p-4">
                <p className="mb-4 text-gray-600">Profile not found.</p>
                <Button asChild>
                    <Link href="/onboarding">Create Profile</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <BackButton fallbackUrl="/dashboard" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                            <p className="text-gray-500">Manage your personal information and preferences.</p>
                        </div>
                    </div>
                    <Button
                        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        onClick={() => router.push("/onboarding?mode=edit")}
                    >
                        <Edit className="h-4 w-4" />
                        Edit Profile
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Column: Personal Info Card */}
                    <Card className="md:col-span-1 p-6 bg-white border-gray-200 shadow-sm rounded-xl space-y-6 h-fit">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-3xl font-bold border border-blue-100 mb-4">
                                {profile.full_name?.charAt(0).toUpperCase() || <User className="h-10 w-10" />}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">{profile.full_name}</h2>
                            <p className="text-sm text-gray-500 mt-1">{profile.academic_year || "Student"}</p>

                            {profile.github_username && (
                                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                                    <Github className="h-4 w-4" />
                                    <span>{profile.github_username}</span>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-100 pt-6 space-y-4">
                            <div className="flex items-start gap-3">
                                <GraduationCap className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Academic Year</p>
                                    <p className="text-sm text-gray-600">{profile.academic_year || "Not specified"}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Experience</p>
                                    <p className="text-sm text-gray-600">{profile.experience_level || "Not specified"}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Right Column: Details & Preferences */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Skills & Domains */}
                        <Card className="p-6 bg-white border-gray-200 shadow-sm rounded-xl">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Skills & Expertise</h3>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Top Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.skills && profile.skills.length > 0 ? (
                                            profile.skills.map((skill, i) => (
                                                <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 px-3 py-1">
                                                    {skill}
                                                </Badge>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-sm italic">No skills listed yet.</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Target Domains</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.domains && profile.domains.length > 0 ? (
                                            profile.domains.map((domain, i) => (
                                                <Badge key={i} variant="outline" className="border-gray-200 text-gray-700 bg-gray-50 px-3 py-1">
                                                    {domain}
                                                </Badge>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-sm italic">No domains selected.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Job Preferences */}
                        <Card className="p-6 bg-white border-gray-200 shadow-sm rounded-xl">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Job Preferences</h3>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Target Roles</h4>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {profile.job_roles && profile.job_roles.length > 0 ? (
                                            profile.job_roles.map((role, i) => (
                                                <span key={i} className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                                                    {role}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-sm">Not specified</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Preferred Locations</h4>
                                    <div className="flex items-start gap-2 mt-2">
                                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                                        <p className="text-sm text-gray-700 leading-snug">
                                            {profile.preferred_locations && profile.preferred_locations.length > 0
                                                ? profile.preferred_locations.join(", ")
                                                : "Open to anywhere"
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Work Mode</h4>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none px-3 py-1 capitalize">
                                            {profile.work_mode || "Flexible"}
                                        </Badge>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Job Type</h4>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none px-3 py-1 capitalize">
                                            {profile.job_type || "Any"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
