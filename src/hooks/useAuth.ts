import { useAuth as useAuthContext } from "@/features/auth/AuthProvider";

export const useAuth = () => {
    return useAuthContext();
};
