"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    return (
        <Card className="w-full max-w-md p-8 bg-gray-900 border-gray-800 text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Authentication Error</h1>
            <p className="text-gray-300 mb-6">
                {error || "An unknown error occurred during authentication."}
            </p>
            <div className="space-y-4">
                <Link href="/auth/login">
                    <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                        Back to Login
                    </Button>
                </Link>
            </div>
        </Card>
    );
}

export default function AuthCodeErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
            <Suspense fallback={<div className="text-white">Loading error details...</div>}>
                <AuthErrorContent />
            </Suspense>
        </div>
    );
}
