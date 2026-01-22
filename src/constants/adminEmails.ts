export const ADMIN_EMAILS = [
    "cvarunkumar455@gmail.com",
    "cvkvarun7@gmail.com"
];

export const isAdminEmail = (email: string | null | undefined): boolean => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email);
};
