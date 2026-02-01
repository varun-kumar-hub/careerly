import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PostgrestError } from "@supabase/supabase-js";

export interface ProfileData {
    id?: string;
    full_name?: string;
    academic_year?: string;
    skills?: string[];
    interests?: string;
    job_roles?: string[];
    domains?: string[];
    job_type?: string;
    work_mode?: string;
    preferred_locations?: string[];
    github_username?: string;
    experience_level?: string | null;
    previous_company?: string | null;
    previous_role?: string | null;
    change_reason?: string | null;
    gemini_api_key?: string | null;
    avatar_url?: string;
}

export function useProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<PostgrestError | null>(null);
    const supabase = createClient();

    const fetchProfile = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (error) {
            setError(error);
        } else {
            setProfile(data);
        }
        setLoading(false);
    }, [user, supabase]);

    const updateProfile = async (updates: Partial<ProfileData>) => {
        if (!user) return { error: "No user" };

        const { error } = await supabase
            .from("profiles")
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);

        if (!error) {
            await fetchProfile(); // Refresh
        }
        return { error };
    };

    useEffect(() => {
        fetchProfile();
    }, [user]);

    return { profile, loading, error, updateProfile, refetch: fetchProfile };
}
