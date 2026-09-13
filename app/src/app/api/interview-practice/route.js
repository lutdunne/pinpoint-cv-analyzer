import { NextResponse } from "next/server";
import { client } from "@/lib/openai";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { isDeveloperEmail, checkAndIncrementDailyUsage } from "@/lib/serverAuth";
import { DAILY_LIMIT, DEFAULT_MODEL } from "@/lib/constants";

// Security constants
const MAX_RESUME_LENGTH = 100000; // 100KB max

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to access interview practice." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User profile not found." },
        { status: 401 }
      );
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

    const { resumeText } = await req.json();

    // Validate input
    if (!resumeText || typeof resumeText !== 'string') {
      return NextResponse.json({ error: "Invalid resume text" }, { status: 400 });
    }

    // Sanitize and validate length
    const sanitizedText = resumeText
      .replace(/[<>]/g, '')  // Remove potential HTML/XML tags
      .trim();

    if (sanitizedText.length < 50) {
      return NextResponse.json({ error: "Resume text too short" }, { status: 400 });
    }

    if (sanitizedText.length > MAX_RESUME_LENGTH) {
      return NextResponse.json({
        error: `Resume text too long. Maximum ${MAX_RESUME_LENGTH} characters allowed.`
      }, { status: 400 });
    }

    // Hardcoded strong bullet points for preparation and pitfalls
    const commonPitfalls = [
      "Speaking too fast or rambling without structure - take pauses and think before answering",
      "Failing to provide specific examples - always back up claims with concrete achievements from your experience",
      "Not asking clarifying questions - shows engagement and prevents answering the wrong question",
      "Sounding rehearsed or robotic - be authentic and conversational, not like you're reciting a script",
      "Forgetting to tie answers back to the role and company - always show how your skills match their needs"
    ];

    const preparationTips = [
      "Research the company thoroughly - understand their mission, products, recent news, and culture",
      "Practice the STAR method (Situation, Task, Action, Result) for behavioral questions - it structures your answer perfectly",
      "Do mock interviews with a friend or family member - hearing yourself speak out loud is invaluable",
      "Prepare 3-5 specific examples from your experience with measurable outcomes and lessons learned",
      "Have thoughtful questions ready to ask your interviewer - shows genuine interest and critical thinking"
    ];

    // Determine number of questions based on authentication status
    const numQuestions = session ? 6 : 3;
    const maxTokens = session ? 1800 : 1000;

    const stream = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      temperature: 0.8,
      max_completion_tokens: maxTokens,
      stream: true, // Enable streaming
      messages: [
        {
          role: "system",
          content: `Generate ${numQuestions} interview questions based on the résumé. Respond in JSON:
{ 
  "questions": [
    {
      "question": string,
      "type": "behavioral" | "technical" | "situational" | "leadership",
      "difficulty": "entry" | "mid" | "senior",
      "why_asked": string (1 short sentence),
      "tips": [2 brief tips],
      "star_applicable": boolean,
      "key_points_to_cover": [2-3 points]
    }
  ],
  "elevator_pitch_framework": string
}
Mix behavioral, technical, and situational questions.`,
        },
        {
          role: "user",
          content: `Résumé:\n\n${sanitizedText.slice(0, 6000)}`,
        },
      ],
    });

    // Create a streaming response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        let fullContent = '';

        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullContent += content;
              // Send each chunk as it arrives
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: content })}\n\n`));
            }
          }

          // Parse and send final result
          let raw = fullContent.trim();
          if (raw.startsWith("```")) {
            raw = raw.replace(/```(json)?/g, "").trim();
          }
          raw = raw.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ");

          try {
            const feedback = JSON.parse(raw);
            // Add hardcoded pitfalls and preparation tips
            feedback.common_pitfalls = commonPitfalls;
            feedback.preparation_tips = preparationTips;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, data: feedback })}\n\n`));
          } catch (parseError) {
            console.error("[JSON Parse Error]", parseError);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Parse failed", raw: raw.substring(0, 500) })}\n\n`));
          }
        } catch (err) {
          console.error("[Stream Error]", err);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err.message })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    console.error("[ERROR in /api/interview-practice]", err);
    return NextResponse.json(
      { error: "Failed to generate interview practice questions" },
      { status: 500 }
    );
  }
}