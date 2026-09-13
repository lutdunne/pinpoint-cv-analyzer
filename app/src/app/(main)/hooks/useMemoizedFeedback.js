import { useMemo } from 'react';

/**
 * Memoizes expensive ATS keyword computation
 */
export function useMemoizedATSKeywords(feedback) {
    return useMemo(() => {
        if (!feedback) return { foundKeywords: [], keywordScore: 0, isGood: false };

        const text = JSON.stringify(feedback).toLowerCase();
        const industryKeywords = [
            'leadership', 'management', 'project', 'team', 'strategy',
            'analysis', 'development', 'implementation', 'optimization',
            'collaboration', 'communication', 'innovation', 'data',
            'technical', 'customer', 'business', 'agile', 'scrum'
        ];

        const foundKeywords = industryKeywords.filter(keyword =>
            text.includes(keyword)
        );

        const keywordScore = Math.round((foundKeywords.length / industryKeywords.length) * 100);
        const isGood = keywordScore >= 40;

        return { foundKeywords, keywordScore, isGood };
    }, [feedback]);
}

/**
 * Memoizes essential sections detection
 */
export function useMemoizedSections(feedback) {
    return useMemo(() => {
        if (!feedback) return { present: [], missing: [], hasMissing: true };

        const sections = {
            "Contact Information": feedback?.contactInfo?.email || feedback?.contactInfo?.phone,
            "Professional Summary": feedback?.summary && feedback.summary.length > 50,
            "Work Experience": feedback?.strengths?.some(s => s.toLowerCase().includes('experience')) ||
                feedback?.improvements?.some(i => i.toLowerCase().includes('experience')),
            "Education": true, // Most CVs have this
            "Skills": feedback?.strengths?.some(s => s.toLowerCase().includes('skill')) ||
                feedback?.actionPlan?.some(a => a.toLowerCase().includes('skill'))
        };

        const present = Object.entries(sections).filter(([_, exists]) => exists);
        const missing = Object.entries(sections).filter(([_, exists]) => !exists);
        const hasMissing = missing.length > 0;

        return { present, missing, hasMissing };
    }, [feedback]);
}

/**
 * Memoizes spell check computation
 */
export function useMemoizedSpellCheck(feedback) {
    return useMemo(() => {
        if (!feedback) return { foundErrors: [], hasGrammarIssues: false, hasIssues: false };

        const text = JSON.stringify(feedback).toLowerCase();
        const commonErrors = [
            { word: 'teh', correct: 'the' },
            { word: 'recieve', correct: 'receive' },
            { word: 'occured', correct: 'occurred' },
            { word: 'seperate', correct: 'separate' },
            { word: 'definately', correct: 'definitely' },
            { word: 'managment', correct: 'management' },
            { word: 'experiance', correct: 'experience' },
            { word: 'responsability', correct: 'responsibility' }
        ];

        const foundErrors = commonErrors.filter(err =>
            text.includes(err.word)
        );

        // Check for grammar hints in feedback
        const hasGrammarIssues = feedback?.improvements?.some(imp => {
            const text = typeof imp === 'string' ? imp : (imp?.description || imp?.text || '');
            return text.toLowerCase().includes('grammar') ||
                text.toLowerCase().includes('spelling') ||
                text.toLowerCase().includes('typo');
        });

        const hasIssues = foundErrors.length > 0 || hasGrammarIssues;

        return { foundErrors, hasGrammarIssues, hasIssues };
    }, [feedback]);
}
