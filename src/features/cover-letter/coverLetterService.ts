export async function generateCoverLetter(jobDescription: string, resumeContext: string, apiKey?: string): Promise<string> {

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (!apiKey) {
        console.warn("No API Key provided. Using Mock Generation.");
        return mockCoverLetter(jobDescription, resumeContext);
    }

    // TODO: Implement actual OpenAI/Gemini call here
    // const response = await fetch('https://api.openai.com/v1/chat/completions', ...);

    return mockCoverLetter(jobDescription, resumeContext);
}

function mockCoverLetter(jobDescription: string, resumeContext: string): string {
    const today = new Date().toLocaleDateString();

    // Simple verification extraction (very basic)
    const companyMatch = jobDescription.match(/at\s+([A-Z][a-z0-9\s]+)/) || ["", "the company"];
    const company = companyMatch[1] || "the Hiring Team";

    return `Subject: Application for Open Role

Date: ${today}

Dear Hiring Manager,

I am writing to express my strong interest in the open position at ${company}. With my background in ${resumeContext.slice(0, 50)}... (and similar skills inferred from your resume), I am confident in my ability to contribute effectively to your team.

I was particularly drawn to this role because of the requirements listed in the job description:
"${jobDescription.slice(0, 100)}..."

In my previous experience, I have demonstrated...

[This is a generated placeholder. To enable full AI generation, please configure an OpenAI/Gemini API key in your environment variables.]

Sincerely,
[Your Name]
`;
}
