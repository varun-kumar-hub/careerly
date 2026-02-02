"use client";

interface UserSkillsDisplayProps {
    skills: string[] | undefined;
    loading: boolean;
}

export function UserSkillsDisplay({ skills, loading }: UserSkillsDisplayProps) {
    if (loading) {
        return null;
    }

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Your Skills</h3>
            {skills && skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                        <span
                            key={idx}
                            className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-yellow-400 text-sm">
                    No skills found. Please update your profile to use this feature.
                </p>
            )}
        </div>
    );
}
