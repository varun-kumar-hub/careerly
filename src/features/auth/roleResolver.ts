import { isAdminEmail } from "@/constants/adminEmails";
import { User } from "@supabase/supabase-js";

export type UserRole = "admin" | "applicant";

export function getRoleForUser(user: User | null): UserRole {
    if (!user || !user.email) return "applicant";

    // 3.3 Role Detection Logic: Server-side check
    if (isAdminEmail(user.email)) {
        return "admin";
    }

    return "applicant";
}
