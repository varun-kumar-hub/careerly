"use client";

import { useAuth } from "@/hooks/useAuth";
import { Github, ExternalLink, Link2, Unlink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

interface GitHubIdentity {
    identity_id: string;
    provider: string;
    user_id: string;
    identity_data: {
        avatar_url?: string;
        email?: string;
        full_name?: string;
        preferred_username?: string;
        user_name?: string;
    };
}

export function GitHubConnect({ compact = false }: { compact?: boolean }) {
    const { user, signInWithGithub } = useAuth();

    // Find GitHub identity from user's identities
    const githubIdentity = user?.identities?.find(
        (identity: { provider: string } & Partial<GitHubIdentity>) => identity.provider === "github"
    );

    // Also check user_metadata for GitHub data (set when signed up via GitHub)
    const githubUsername =
        githubIdentity?.identity_data?.user_name ||
        githubIdentity?.identity_data?.preferred_username ||
        user?.user_metadata?.user_name ||
        user?.user_metadata?.preferred_username;

    const githubAvatarUrl =
        githubIdentity?.identity_data?.avatar_url ||
        user?.user_metadata?.avatar_url;

    const isConnected = !!githubUsername;

    if (compact) {
        // Compact version for sidebar
        return (
            <div className="px-2">
                {isConnected ? (
                    <a
                        href={`https://github.com/${githubUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        title={`GitHub: ${githubUsername}`}
                    >
                        {githubAvatarUrl ? (
                            <img
                                src={githubAvatarUrl}
                                alt={githubUsername}
                                className="h-5 w-5 rounded-full shrink-0"
                            />
                        ) : (
                            <Github className="h-5 w-5 shrink-0 text-gray-500" />
                        )}
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 flex items-center gap-1">
                            {githubUsername}
                            <ExternalLink className="h-3 w-3" />
                        </span>
                    </a>
                ) : (
                    <button
                        onClick={() => signInWithGithub()}
                        className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full"
                        title="Connect GitHub"
                    >
                        <Link2 className="h-5 w-5 shrink-0 text-gray-400" />
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                            Connect GitHub
                        </span>
                    </button>
                )}
            </div>
        );
    }

    // Full version for settings/profile page
    return (
        <div className="rounded-lg border border-gray-200 p-4 bg-white">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center",
                        isConnected ? "bg-gray-900" : "bg-gray-100"
                    )}>
                        {isConnected && githubAvatarUrl ? (
                            <img
                                src={githubAvatarUrl}
                                alt={githubUsername}
                                className="h-10 w-10 rounded-full"
                            />
                        ) : (
                            <Github className={cn("h-5 w-5", isConnected ? "text-white" : "text-gray-400")} />
                        )}
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900">GitHub</h3>
                        {isConnected ? (
                            <a
                                href={`https://github.com/${githubUsername}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                            >
                                @{githubUsername}
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        ) : (
                            <p className="text-sm text-gray-500">Not connected</p>
                        )}
                    </div>
                </div>

                {!isConnected && (
                    <Button
                        onClick={() => signInWithGithub()}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                    >
                        <Github className="h-4 w-4" />
                        Connect
                    </Button>
                )}
            </div>
        </div>
    );
}
