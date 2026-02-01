import { GoogleGenerativeAI } from "@google/generative-ai";

// Use Gemini 2.5 Flash as specified by user
const MODEL_NAME = "gemini-2.5-flash-preview-05-20";

export interface GeminiResponse {
    text: string;
    success: boolean;
    error?: string;
}

/**
 * Generate text using Gemini 2.5 Flash
 */
export async function generateWithGemini(
    apiKey: string,
    prompt: string,
    systemInstruction?: string
): Promise<GeminiResponse> {
    const SYSTEM_KEY = process.env.GEMINI_API_KEY;

    // Helper to attempt generation
    const attemptGenerate = async (key: string): Promise<string> => {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            systemInstruction: systemInstruction,
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    };

    try {
        if (!apiKey) {
            return {
                text: "",
                success: false,
                error: "Gemini API key is missing. Please add it in your profile settings.",
            };
        }

        // 1. Try with User Key
        try {
            const text = await attemptGenerate(apiKey);
            return { text, success: true };
        } catch (error: any) {
            // Check for recoverable errors (Rate Limit, Quota, Server Error)
            const isRecoverable =
                error.message?.includes("429") || // Rate limit
                error.toString().includes("429") ||
                error.message?.includes("403") || // Quota or Permission
                error.message?.includes("503") || // Overloaded
                error.message?.includes("quota");

            if (isRecoverable && SYSTEM_KEY && SYSTEM_KEY !== apiKey) {
                console.warn("[Gemini] User key rate limited or failed. Falling back to system key.");
                // 2. Fallback to System Key
                const text = await attemptGenerate(SYSTEM_KEY);
                return { text, success: true };
            }

            throw error; // Re-throw if not recoverable or no system key
        }
    } catch (error) {
        console.error("[Gemini Error]", error);
        return {
            text: "",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Generate cover letter using Gemini
 */
export async function generateCoverLetterWithGemini(
    apiKey: string,
    jobDescription: string,
    resumeContext: string,
    userName?: string
): Promise<GeminiResponse> {
    const systemInstruction = `You are an expert career coach and professional cover letter writer. 
Generate a compelling, personalized cover letter that:
- Is professional yet engaging
- Highlights relevant skills and experience from the resume
- Addresses specific requirements from the job description
- Uses a confident but not arrogant tone
- Is concise (about 300-400 words)
- Does NOT include placeholder text like [Your Name] - use the provided name or "the applicant"`;

    const prompt = `Generate a professional cover letter for the following:

JOB DESCRIPTION:
${jobDescription}

CANDIDATE'S BACKGROUND:
${resumeContext}

${userName ? `CANDIDATE NAME: ${userName}` : ""}

Write a compelling cover letter that connects the candidate's experience to the job requirements.`;

    return generateWithGemini(apiKey, prompt, systemInstruction);
}

/**
 * Generate tailored resume suggestions using Gemini
 */
export async function generateResumeTailoringWithGemini(
    apiKey: string,
    jobDescription: string,
    currentResume: string
): Promise<GeminiResponse> {
    const systemInstruction = `You are an expert resume coach. Analyze the job description and current resume, then provide specific, actionable suggestions to tailor the resume for better alignment with the job requirements.`;

    const prompt = `Analyze this job description and resume, then provide tailored suggestions:

JOB DESCRIPTION:
${jobDescription}

CURRENT RESUME:
${currentResume}

Provide:
1. Key skills/keywords to add or emphasize
2. Bullet points that could be reworded to better match the job
3. Any missing sections or experiences that could be highlighted
4. Overall tailoring strategy`;

    return generateWithGemini(apiKey, prompt, systemInstruction);
}

/**
 * Generate interview questions using Gemini
 */
export async function generateInterviewQuestionsWithGemini(
    apiKey: string,
    jobDescription: string,
    candidateBackground?: string
): Promise<GeminiResponse> {
    const systemInstruction = `You are an expert interviewer and career coach. Generate realistic interview questions that a hiring manager would ask for this role.`;

    const prompt = `Generate 8-10 interview questions for this role:

JOB DESCRIPTION:
${jobDescription}

${candidateBackground ? `CANDIDATE BACKGROUND:\n${candidateBackground}` : ""}

Include a mix of:
- Behavioral questions (STAR format scenarios)
- Technical/skill-based questions
- Situational questions
- Culture fit questions

For each question, provide a brief tip on how to answer effectively.`;

    return generateWithGemini(apiKey, prompt, systemInstruction);
}

/**
 * Analyze skill gaps using Gemini
 */
export async function analyzeSkillGapWithGemini(
    apiKey: string,
    jobDescription: string,
    userSkills: string[]
): Promise<GeminiResponse> {
    const systemInstruction = `You are a career development expert. Analyze the gap between a candidate's current skills and job requirements. Be encouraging but honest.`;

    const prompt = `Analyze the skill gap for this job:

JOB REQUIREMENTS:
${jobDescription}

CANDIDATE'S CURRENT SKILLS:
${userSkills.join(", ")}

Provide:
1. MATCHED SKILLS: Skills the candidate already has that match requirements
2. SKILL GAPS: Required skills the candidate appears to be missing
3. LEARNING RECOMMENDATIONS: Specific resources, courses, or projects to close the gap
4. MATCH PERCENTAGE: An estimated match score (0-100%)
5. QUICK WINS: Skills that could be acquired quickly to improve the match

Format the response as JSON with keys: matchedSkills, skillGaps, recommendations, matchPercentage, quickWins`;

    return generateWithGemini(apiKey, prompt, systemInstruction);
}
