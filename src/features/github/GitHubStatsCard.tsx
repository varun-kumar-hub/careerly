"use client";

import { useEffect, useState } from "react";
import { fetchGitHubProfile, fetchTopRepos, GitHubProfile, GitHubRepo } from "./githubService";
import { Card } from "@/components/ui/Card";
import { Github, Star, GitFork, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface GitHubStatsCardProps {
    username: string;
}

export function GitHubStatsCard({ username }: GitHubStatsCardProps) {
    const [profile, setProfile] = useState<GitHubProfile | null>(null);
    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!username) return;

        const loadData = async () => {
            setLoading(true);
            const [p, r] = await Promise.all([
                fetchGitHubProfile(username),
                fetchTopRepos(username)
            ]);
            setProfile(p);
            setRepos(r);
            setLoading(false);
        };

        loadData();
    }, [username]);

    if (!username) return null;

    if (loading) {
        return (
            <Card className="p-6 bg-gray-900 border-gray-800 animate-pulse">
                <div className="h-6 w-32 bg-gray-800 rounded mb-4"></div>
                <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-800 rounded"></div>
                    <div className="h-4 w-2/3 bg-gray-800 rounded"></div>
                </div>
            </Card>
        );
    }

    if (!profile) {
        return (
            <Card className="p-6 bg-gray-900 border-gray-800">
                <div className="flex items-center gap-2 text-red-400">
                    <Github className="h-5 w-5" />
                    <span className="font-medium">GitHub User Not Found</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">Could not fetch data for "{username}".</p>
            </Card>
        );
    }

    return (
        <Card className="p-6 bg-gray-900 border-gray-800 text-white shadow-xl bg-gradient-to-br from-gray-900 to-gray-800/50">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <img src={profile.avatar_url} alt={profile.login} className="w-12 h-12 rounded-full border-2 border-gray-700" />
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            {profile.login}
                            <Github className="h-4 w-4 text-gray-400" />
                        </h3>
                        <div className="flex gap-4 text-sm text-gray-400">
                            <span>{profile.public_repos} Repos</span>
                            <span>{profile.followers} Followers</span>
                        </div>
                    </div>
                </div>
                <Button asChild variant="outline" size="sm" className="gap-2">
                    <a href={`https://github.com/${username}`} target="_blank" rel="noopener noreferrer">
                        View Profile
                        <ExternalLink className="h-3 w-3" />
                    </a>
                </Button>
            </div>

            <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Top Repositories</h4>
            <div className="space-y-3">
                {repos.map(repo => (
                    <div key={repo.id} className="p-3 rounded-lg bg-gray-950/50 border border-gray-800 hover:border-gray-700 transition-colors">
                        <div className="flex justify-between items-start">
                            <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-400 hover:underline truncate pr-4">
                                {repo.name}
                            </a>
                            <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                                {repo.language && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span>{repo.language}</span>}
                                <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {repo.stargazers_count}</span>
                            </div>
                        </div>
                        {repo.description && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{repo.description}</p>
                        )}
                    </div>
                ))}
                {repos.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No public repositories found.</p>
                )}
            </div>
        </Card>
    );
}
