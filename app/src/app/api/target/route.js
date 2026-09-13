import { NextResponse } from "next/server";
import { client } from "@/lib/openai";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { isDeveloperEmail, checkAndIncrementDailyUsage } from "@/lib/serverAuth";
import { DAILY_LIMIT, DEFAULT_MODEL } from "@/lib/constants";

export async function POST(req) {
  try {
    // Check OpenAI client is initialized
    if (!client) {
      console.error("[ERROR] OpenAI client is not initialized. Check OPENAI_API_KEY.");
      return NextResponse.json(
        { error: "AI service not configured. Please contact support." },
        { status: 500 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isDeveloper = isDeveloperEmail(session.user.email);
    if (!isDeveloper) {
      const usageResult = await checkAndIncrementDailyUsage(user.id);
      if (!usageResult.allowed) {
        return NextResponse.json(
          {
            error: `Daily limit reached. You've used all ${DAILY_LIMIT} AI requests today. Try again tomorrow!`,
            limitReached: true,
            used: usageResult.currentCount,
            limit: DAILY_LIMIT
          },
          { status: 429 }
        );
      }
    }

    const { resumeText, jobDesc } = await req.json();

    // Validate and sanitize inputs
    if (!resumeText || typeof resumeText !== 'string' || !jobDesc || typeof jobDesc !== 'string') {
      return NextResponse.json({
        error: "Resume text and job description are required and must be strings"
      }, { status: 400 });
    }

    const sanitizedResumeText = resumeText.replace(/[<>]/g, '').trim().slice(0, 100000);
    const sanitizedJobDesc = jobDesc.replace(/[<>]/g, '').trim().slice(0, 50000);

    if (sanitizedResumeText.length < 50 || sanitizedJobDesc.length < 20) {
      return NextResponse.json({
        error: "Resume text and job description are too short"
      }, { status: 400 });
    }

    console.log("[DEBUG] Received resumeText length:", sanitizedResumeText.length);
    console.log("[DEBUG] Received jobDesc length:", sanitizedJobDesc.length);
    console.log("[DEBUG] OpenAI client exists:", !!client);
    console.log("[DEBUG] OpenAI API key configured:", !!process.env.OPENAI_API_KEY);

    // Combined single API call - extracts company/position AND performs analysis in one request
    const response = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an elite senior technical recruiter and career coach.
Your task is to comprehensively analyze how well a candidate's résumé aligns with a specific job description, and provide EXCELLENT, highly actionable, and precise feedback. Do not give generic advice. Be highly specific about the candidate's existing experience and exactly how to reframe it for the job.

FIRST, extract the company name and job position. THEN provide the full analysis.

CRITICAL: IGNORE missing spaces or run-on words (e.g., "ProficientinJava"). This is an artifact of the PDF parsing process, NOT the user's formatting. Do not dock points or suggest fixes for missing spaces between words.

FREQUENCY ANALYSIS RULE: When identifying missing skills, analyze the job description to see how many times a skill is mentioned. If a skill is mentioned 2+ times, or explicitly listed under "Requirements" / "Must Haves", flag its priority as "critical".

SKILLS TAXONOMY RULE: When extracting keywords and skills, ONLY extract proper noun technical skills (e.g., "Python", "AWS"), standardized frameworks (e.g., "React", "Spring Boot"), or recognized industry methodologies (e.g., "Agile", "Scrum"). Do NOT extract generic adjectives or vague soft skills (e.g., "teamwork", "fast-paced environment", "leadership") as keywords.

You must respond with valid JSON matching this structure exactly:
{ 
  "companyName": "string (extracted from job description)",
  "position": "string (extracted from job description)",
  "match_score": number (0-100),
  "match_summary": string (2-3 sentences explaining the overall fit),
  "missing_skills": [
    {
      "skill": "string",
      "priority": "critical | important | nice-to-have (Use frequency analysis to determine this)",
      "learning_resources": "string (brief suggestion)"
    }
  ],
  "matching_skills": [list of skills/experiences that align well],
  "transferable_skills": [skills that could apply but aren't explicitly stated],
  "keyword_optimization": {
    "missing_keywords": [keywords from job description absent in resume],
    "keywords_to_emphasize": [keywords present but could be more prominent]
  },
  "resume_tailoring": [
    {
      "section": string (which resume section),
      "suggestion": string (specific change to make),
      "example": string (example of improved wording)
    }
  ],
  "experience_gaps": [areas where experience doesn't match requirements],
  "overqualifications": [areas where candidate exceeds requirements],
  "cover_letter_focus": [3-4 key points to emphasize],
  "interview_preparation": [3-4 topics to research],
  "competitive_positioning": string (how to position vs other candidates),
  "application_priority": "high" | "medium" | "low",
  "red_flags": [potential concerns],
  "suggestions": string (comprehensive strategy)
}`,
        },
        {
          role: "user",
          content: `Compare this résumé to the job description and provide detailed analysis.

Résumé:
${resumeText}

Job Description:
${jobDesc}`,
        },
      ],
    });

    let extractedData = { companyName: "Unknown", position: "Unknown" };

    let raw = response.choices[0].message.content.trim();

    // Clean up potential markdown formatting
    if (raw.startsWith("```")) {
      raw = raw.replace(/```(json)?/g, "").trim();
    }

    // Clean up any control characters that might break JSON parsing
    raw = raw.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ");

    console.log("[DEBUG] Raw AI response before parsing:", raw.substring(0, 500));

    let feedback;
    try {
      feedback = JSON.parse(raw);
      // Extract company and position from the response
      if (feedback.companyName) extractedData.companyName = feedback.companyName;
      if (feedback.position) extractedData.position = feedback.position;
    } catch (parseErr) {
      console.error("[ERROR] JSON Parse failed:", parseErr.message);
      console.error("[ERROR] Attempted to parse:", raw.substring(0, 1000));
      throw new Error(`Failed to parse AI response: ${parseErr.message}`);
    }

    console.log("[AI Feedback Parsed]", feedback);

    // Save to database
    const jobAnalysis = await prisma.jobAnalysis.create({
      data: {
        userId: user.id,
        companyName: extractedData.companyName,
        position: extractedData.position,
        jobDescription: jobDesc,
        matchScore: feedback.match_score,
        analysis: JSON.stringify(feedback)
      }
    });

    return NextResponse.json({
      ...feedback,
      jobAnalysisId: jobAnalysis.id,
      companyName: extractedData.companyName,
      position: extractedData.position
    });
  } catch (err) {
    console.error("[ERROR in /api/target]", err);
    return NextResponse.json(
      { error: "Failed to process job analysis" },
      { status: 500 }
    );
  }
}