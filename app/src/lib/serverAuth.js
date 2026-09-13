import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { FREE_PREVIEW_LIMIT, DAILY_LIMIT } from "@/lib/constants";

export function isDeveloperEmail(email) {
    if (!email) return false;
    const developerEmails = process.env.DEVELOPER_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) || [];
    return developerEmails.includes(email.toLowerCase());
}

/**
 * Return a free-tier preview of AI feedback (score + first N items per section).
 */
export function filterFeedbackForPreview(feedback) {
    if (!feedback) return feedback;

    const filtered = { ...feedback };

    if (Array.isArray(filtered.strengths)) {
        filtered.strengths = filtered.strengths.slice(0, FREE_PREVIEW_LIMIT);
    }
    if (Array.isArray(filtered.improvements)) {
        filtered.improvements = filtered.improvements.slice(0, FREE_PREVIEW_LIMIT);
    }
    if (Array.isArray(filtered.action_plan)) {
        filtered.action_plan = filtered.action_plan.slice(0, FREE_PREVIEW_LIMIT);
    }

    filtered.ats_tips = [];
    if (filtered.keyword_analysis) {
        filtered.keyword_analysis = {
            strong_keywords: (filtered.keyword_analysis.strong_keywords || []).slice(0, 3),
            missing_keywords: [],
        };
    }
    filtered.formatting_issues = [];
    filtered.impact_opportunities = [];
    filtered.suggested_sections = [];
    filtered.isPreview = true;

    return filtered;
}

/**
 * Check if user has premium access (paid or developer)
 * @param {string} email - User email
 * @param {string} [resumeId] - Optional resume ID to check if specific resume is paid
 * @returns {Promise<{isPremium: boolean, isDeveloper: boolean, isPaid: boolean}>}
 */
export async function checkPremiumAccess(email, resumeId = null) {
    if (!email) {
        return { isPremium: false, isDeveloper: false, isPaid: false };
    }

    const isDeveloper = isDeveloperEmail(email);

    if (isDeveloper) {
        return { isPremium: true, isDeveloper: true, isPaid: true };
    }

    // Check if specific resume is paid
    if (resumeId) {
        const resume = await prisma.resume.findFirst({
            where: {
                id: resumeId,
                user: {
                    email: email
                }
            },
            select: {
                isPaid: true
            }
        });

        const isPaid = resume?.isPaid || false;
        return { isPremium: isPaid, isDeveloper: false, isPaid };
    }

    return { isPremium: false, isDeveloper: false, isPaid: false };
}

/**
 * Get authenticated user session
 * @returns {Promise<{session: any, user: any}>}
 */
export async function getAuthenticatedUser() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return { session: null, user: null };
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    return { session, user };
}

/**
 * Sanitize user input to prevent injection attacks
 * @param {string} input - User input string
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} - Sanitized string
 */
export function sanitizeInput(input, maxLength = 100000) {
    if (!input || typeof input !== 'string') {
        return '';
    }

    return input
        .replace(/[<>]/g, '')  // Remove potential HTML/XML tags
        .replace(/[\x00-\x1F\x7F]/g, '')  // Remove control characters
        .trim()
        .slice(0, maxLength);
}

/**
 * Validate text length
 * @param {string} text - Text to validate
 * @param {number} minLength - Minimum required length
 * @param {number} maxLength - Maximum allowed length
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateTextLength(text, minLength = 0, maxLength = Infinity) {
    if (!text || typeof text !== 'string') {
        return { valid: false, error: 'Input must be a string' };
    }

    const length = text.trim().length;

    if (length < minLength) {
        return { valid: false, error: `Input too short. Minimum ${minLength} characters required.` };
    }

    if (length > maxLength) {
        return { valid: false, error: `Input too long. Maximum ${maxLength} characters allowed.` };
    }

    return { valid: true, error: null };
}

/**
 * Get current daily usage for a user.
 */
export async function getDailyUsage(userId) {
    if (!userId) return { count: 0, remaining: DAILY_LIMIT, limit: DAILY_LIMIT };
    const today = new Date().toISOString().split('T')[0];
    const usage = await prisma.dailyUsage.findUnique({
        where: {
            userId_date: {
                userId,
                date: today,
            },
        },
    });
    const count = usage?.count || 0;
    return {
        count,
        remaining: Math.max(0, DAILY_LIMIT - count),
        limit: DAILY_LIMIT,
    };
}

/**
 * Check and increment daily usage count for a user.
 * Returns { allowed: boolean, currentCount: number, remaining: number, limit: number }
 */
export async function checkAndIncrementDailyUsage(userId) {
    if (!userId) {
        return { allowed: false, currentCount: 0, remaining: 0, limit: DAILY_LIMIT };
    }

    const today = new Date().toISOString().split('T')[0];

    const usage = await prisma.dailyUsage.findUnique({
        where: {
            userId_date: {
                userId,
                date: today,
            },
        },
    });

    const currentCount = usage?.count || 0;
    if (currentCount >= DAILY_LIMIT) {
        return {
            allowed: false,
            currentCount,
            remaining: 0,
            limit: DAILY_LIMIT,
        };
    }

    const updatedUsage = await prisma.dailyUsage.upsert({
        where: {
            userId_date: {
                userId,
                date: today,
            },
        },
        update: {
            count: {
                increment: 1,
            },
        },
        create: {
            userId,
            date: today,
            count: 1,
        },
    });

    const newCount = updatedUsage.count;
    return {
        allowed: true,
        currentCount: newCount,
        remaining: Math.max(0, DAILY_LIMIT - newCount),
        limit: DAILY_LIMIT,
    };
}

