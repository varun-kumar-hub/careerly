/**
 * Service to fetch public GitHub data.
 */

export interface GitHubRepo {
    id: number;
    name: string;
    description: string;
    html_url: string;
    stargazers_count: number;
    language: string;
    updated_at: string;
}

export interface GitHubProfile {
    login: string;
    avatar_url: string;
    public_repos: number;
    followers: number;
}

export async function fetchGitHubProfile(username: string): Promise<GitHubProfile | null> {
    if (!username) return null;
    try {
        const res = await fetch(`https://api.github.com/users/${username}`);
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error("GitHub Profile Fetch Error:", error);
        return null;
    }
}

export async function fetchTopRepos(username: string): Promise<GitHubRepo[]> {
    if (!username) return [];
    try {
        // Fetch repos sorted by updated desc
        const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`);
        if (!res.ok) return [];
        return await res.json();
    } catch (error) {
        console.error("GitHub Repos Fetch Error:", error);
        return [];
    }
}
