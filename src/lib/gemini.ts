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
            // Only fallback on rate limit errors (429), not quota/permission/server errors
            const isRateLimited =
                error.message?.includes("429") ||
                error.toString().includes("429") ||
                error.message?.toLowerCase().includes("rate limit") ||
                error.message?.toLowerCase().includes("resource has been exhausted");

            if (isRateLimited && SYSTEM_KEY && SYSTEM_KEY !== apiKey) {
                console.warn("[Gemini] User API key rate limited. Falling back to system key.");
                // 2. Fallback to System Key
                try {
                    const text = await attemptGenerate(SYSTEM_KEY);
                    return { text, success: true };
                } catch (fallbackError) {
                    console.error("[Gemini] Fallback key also failed:", fallbackError);
                    throw fallbackError;
                }
            }

            // For other errors (quota exceeded, permission denied, etc.), don't fallback
            throw error;
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
    const systemInstruction = `You are an expert career coach and professional cover letter writer with 15+ years of experience. 
Generate a compelling, highly detailed, and personalized cover letter that:
- Is professional, engaging, and persuasive
- Highlights specific relevant skills and quantifiable achievements from the resume
- Directly addresses key requirements from the job description with concrete examples
- Uses a confident, enthusiastic, yet humble tone
- Is comprehensive (500-700 words with 4-5 well-developed paragraphs)
- Follows proper business letter structure
- Includes a compelling opening hook that captures attention
- Contains a strong, actionable closing statement
- Does NOT include placeholder text like [Your Name] - use the provided name or sign off professionally without a name if not provided
- Uses varied sentence structure and powerful action verbs`;

    const prompt = `Generate a professional, detailed cover letter for the following:

JOB DESCRIPTION:
${jobDescription}

CANDIDATE'S BACKGROUND:
${resumeContext}

${userName ? `CANDIDATE NAME: ${userName}` : ""}

STRUCTURE YOUR COVER LETTER AS FOLLOWS:

**OPENING PARAGRAPH (Hook & Introduction):**
- Start with a compelling hook that shows genuine enthusiasm for the role
- Briefly introduce the candidate and their current position/status
- Mention how they learned about the opportunity (if evident from context)
- State clear interest in the specific role and company

**BODY PARAGRAPH 1 (Relevant Experience):**
- Highlight 2-3 most relevant experiences that directly match job requirements
- Use specific examples with quantifiable results (metrics, achievements, impact)
- Draw clear connections between past accomplishments and role expectations

**BODY PARAGRAPH 2 (Skills & Technical Qualifications):**
- Address key technical skills, tools, or methodologies mentioned in the job description
- Provide concrete examples of how these skills were applied successfully
- Mention any relevant certifications, projects, or specialized knowledge

**BODY PARAGRAPH 3 (Value Proposition & Cultural Fit):**
- Explain what unique value the candidate brings to the organization
- Demonstrate understanding of company culture, values, or recent initiatives
- Show how the candidate's work style and values align with the organization

**CLOSING PARAGRAPH (Call to Action):**
- Express strong enthusiasm for the opportunity to contribute
- Reference specific aspects of the role that excite the candidate
- Include a confident call to action (expressing interest in interview/discussion)
- Professional sign-off

Make the letter flow naturally, avoid clichés, and ensure every sentence adds value. Use industry-specific language where appropriate.`;

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
    const systemInstruction = `You are an expert resume coach and ATS (Applicant Tracking System) specialist with deep knowledge of hiring practices across industries. 
Analyze the job description and current resume, then provide highly detailed, actionable, and specific suggestions to optimize the resume for maximum impact and ATS compatibility.`;

    const prompt = `Perform a comprehensive analysis of this job description and resume, then provide detailed tailoring recommendations:

JOB DESCRIPTION:
${jobDescription}

CURRENT RESUME:
${currentResume}

Provide a COMPREHENSIVE ANALYSIS with the following sections:

## 1. ATS Keyword Optimization
- List 15-20 critical keywords and phrases from the job description that should appear in the resume
- Categorize keywords by: Technical Skills, Soft Skills, Industry Terminology, Tools/Technologies
- For each keyword, specify WHERE in the resume it should be incorporated (summary, experience, skills section)
- Mark which keywords are currently MISSING vs. present

## 2. Resume Summary/Objective Enhancement
- Provide 2-3 alternative summary statements (2-3 sentences each) tailored to this specific role
- Include quantifiable achievements and relevant keywords
- Show before/after comparison if current summary exists

## 3. Experience Section Optimization
For each relevant work experience or project:
- **BEFORE:** [Current bullet point if exists]
- **AFTER:** [Improved version with stronger action verbs, quantifiable results, and job-relevant framing]
- **Why this works:** [Brief explanation of improvements]

Provide at least 6-8 optimized bullet point examples that:
- Start with powerful action verbs
- Include specific metrics, percentages, or outcomes
- Align closely with job requirements
- Follow the CAR (Challenge-Action-Result) framework

## 4. Skills Section Restructuring
- Organize skills into relevant categories (e.g., Technical Skills, Programming Languages, Frameworks, Soft Skills)
- Prioritize skills based on job description requirements
- Suggest specific skills to add or emphasize
- Recommend skills to de-emphasize or remove if not relevant

## 5. Impact Quantification Strategy
Suggest ways to add measurable impact to experience statements. For example:
- "Led team" → "Led cross-functional team of 8 engineers"
- "Improved performance" → "Improved application performance by 40%, reducing load time from 5s to 3s"
Provide 4-5 specific examples relevant to this resume

## 6. Missing Elements & Gap Analysis
Identify any critical elements from the job description that aren't adequately addressed in the resume:
- Required qualifications not mentioned
- Preferred skills missing
- Suggested additional sections (e.g., Certifications, Projects, Publications)

## 7. Overall Tailoring Strategy (Priority Action Plan)
Rank the top 5-7 highest-impact changes to make, in order of importance:
1. [Action item with expected impact]
2. [Action item with expected impact]
...

## 8. Industry-Specific Recommendations
Provide 2-3 tips specific to this industry/role type

Format the response in clear Markdown with headers, bullet points, and **bold text** for emphasis. Make every suggestion specific and actionable.`;

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
    const systemInstruction = `You are an expert interviewer, hiring manager, and career coach with extensive experience across multiple industries. 
Generate realistic, thoughtful interview questions that hiring managers would actually ask for this specific role, along with comprehensive preparation guidance.`;

    const prompt = `Generate a comprehensive interview preparation guide for this role:

JOB DESCRIPTION:
${jobDescription}

${candidateBackground ? `CANDIDATE BACKGROUND:\n${candidateBackground}` : ""}

Create a DETAILED INTERVIEW PREPARATION GUIDE with 12-15 questions organized into the following sections:

## 1. Behavioral Questions (STAR Method) [4-5 Questions]
For each question provide:
- **Question:** [The actual question]
- **What they're looking for:** [What the interviewer wants to assess]
- **STAR Framework:**
  - Situation: [What to include]
  - Task: [What to emphasize]
  - Action: [Key points to cover]
  - Result: [Type of results to highlight]
- **Example Answer Structure:** [A sample framework showing how to structure the response]
- **Pro Tips:** [1-2 specific tips for answering this question effectively]

## 2. Technical/Skill-Based Questions [4-5 Questions]
For each question:
- **Question:** [Technical question specific to role requirements]
- **What they're assessing:** [Technical competency being evaluated]
- **Key Points to Cover:** [Bullet list of essential elements in the answer]
- **Example Response:** [Brief example showing depth of knowledge expected]
- **Common Pitfalls to Avoid:** [1-2 things NOT to do]

## 3. Situational/Problem-Solving Questions [2-3 Questions]
For each:
- **Scenario:** [Hypothetical situation]
- **What they're evaluating:** [Problem-solving approach, judgment, etc.]
- **Approach Framework:** [Step-by-step approach to tackle the scenario]
- **Key Considerations:** [Important factors to mention]

## 4. Culture Fit & Motivation Questions [2-3 Questions]
For each:
- **Question:** [About work style, values, motivation]
- **Intent:** [What they want to learn about you]
- **Effective Response Strategy:** [How to align your answer with role/company]
- **Red Flags to Avoid:** [Answers that could raise concerns]

## 5. Questions the Candidate Should Ask
Provide 5-7 insightful questions the candidate should ask the interviewer, organized by:
- Questions about the role and team
- Questions about company culture and growth
- Questions about success metrics and expectations

## 6. Final Interview Tips
- Interview preparation checklist (3-4 items)
- Body language and communication tips (2-3 items)
- Follow-up best practices (2-3 items)

Format the response with clear Markdown headers, bullet points, and **bold text** for emphasis. Make every answer framework detailed enough to actually practice with.`;

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
