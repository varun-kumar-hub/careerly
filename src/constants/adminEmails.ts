export const ADMIN_EMAILS = [
    "cvarunkumar455@gmail.com",
    "cvkvarun7@gmail.com",
    "cvarunkumar455@gmail" // Just in case of typo in user's prompt or actual weird email
];

export const isAdminEmail = (email: string | null | undefined): boolean => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase().trim());
};
