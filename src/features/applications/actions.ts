"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface ApplicationData {
    job_title: string;
    company_name: string;
    job_url?: string;
    location?: string;
    status?: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected';
    notes?: string;
}

export async function addApplicationAction(data: ApplicationData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const { error } = await supabase
        .from("applications")
        .insert({
            user_id: user.id,
            ...data
        });

    if (error) {
        console.error("Add Application Error:", error);
        return { error: error.message };
    }

    revalidatePath("/applications");
    revalidatePath("/dashboard");
    return { success: true };
}

export async function deleteApplicationAction(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const { error } = await supabase
        .from("applications")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/applications");
    return { success: true };
}
