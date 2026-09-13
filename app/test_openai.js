const OpenAI = require('openai').default;
require('dotenv').config({ path: '.env.local' });

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = `
You are a top-tier senior technical recruiter and career coach with deep expertise in Applicant Tracking Systems (ATS).
Your task is to comprehensively analyze résumés and provide EXCELLENT, highly actionable, and relevant feedback that significantly improves the candidate's chances.

CRITICAL INSTRUCTIONS:
1. ONLY mention issues that ACTUALLY EXIST in the CV. Do not invent details.
2. IGNORE missing spaces or run-on words (e.g., "ProficientinJava"). This is an artifact of the PDF parsing process, NOT the user's formatting. Do not dock points or suggest fixes for missing spaces between words.
3. Focus on high-impact changes: quantifiable metrics, strong action verbs, ATS keyword optimization, and clarity.
4. For every issue, you MUST provide the exact quote, location, an explanation of why it's weak, and a concrete, rewritten example.

You MUST respond with ONLY valid JSON matching this exact schema (do not include markdown formatting like \`\`\`json):
{
  "subscores": {
    "impact": 50,
    "action_verbs": 50,
    "ats": 50,
    "contact": 50,
    "formatting": 50
  },
  "overall_impression": "",
  "strengths": [""],
  "issues": [
    {
      "quote": "",
      "location": "",
      "problematic": "",
      "fix": "",
      "severity": 5
    }
  ],
  "action_plan": [""],
  "keyword_analysis": {
    "strong_keywords": [""],
    "missing_keywords": [""]
  },
  "inferred_role": "",
  "metrics_audit": {
    "bullets_with_metrics": 0,
    "bullets_without_metrics": 0
  },
  "verb_audit": [
    {
      "weak": "",
      "strong_replacement": ""
    }
  ],
  "readability": ""
}

Keep the tone professional, encouraging, and highly constructive.
`;

const userPrompt = `Analyze this résumé comprehensively. Follow the JSON schema strictly.

Résumé text:
This is a test resume. I worked at Google as a Software Engineer. Proficient in Java, Python, C, JavaScript, and PHP. Improved performance by 50%.`;

async function run() {
  try {
    const res = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      top_p: 1,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    });
    console.log(res.choices[0].message.content);
  } catch(e) {
    console.error("ERROR", e.message, e);
  }
}

run();
