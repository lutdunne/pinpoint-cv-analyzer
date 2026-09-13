import SimplePage from '@/components/SimplePage';
import { Zap, Target, DollarSign, Lock } from 'lucide-react';

export default function AboutPage() {
  return (
    <SimplePage>
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About CV Analyzer</h1>

        <div className="space-y-6 text-foreground-secondary">
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-foreground">Our Mission</h2>
            <p className="text-lg leading-relaxed">
              We built CV Analyzer to help job seekers create outstanding resumes that get noticed by
              both hiring managers and applicant tracking systems (ATS). Our AI-powered platform provides
              instant, actionable feedback to improve your CV&apos;s impact and increase your chances of landing interviews.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-foreground">What We Do</h2>
            <p className="mb-4">
              CV Analyzer uses advanced AI technology to analyze your resume across multiple dimensions:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>ATS Optimization:</strong> Ensure your CV passes automated screening systems</li>
              <li><strong>Content Analysis:</strong> Evaluate the strength of your accomplishments and experience</li>
              <li><strong>Keyword Matching:</strong> Identify missing industry-specific skills and terms</li>
              <li><strong>Formatting Review:</strong> Check for professional structure and readability</li>
              <li><strong>Scoring System:</strong> Get a quantified assessment (0-100) of your CV&apos;s effectiveness</li>
              <li><strong>Priority Fixes:</strong> Receive severity-rated recommendations (1-10 scale)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-foreground">How It Works</h2>
            <ol className="list-decimal list-inside space-y-3 ml-4">
              <li>
                <strong>Upload Your CV:</strong> Simply upload your resume in PDF or DOCX format
              </li>
              <li>
                <strong>AI Analysis:</strong> Our system analyzes your CV using OpenAI&apos;s advanced language models
              </li>
              <li>
                <strong>Instant Feedback:</strong> Receive comprehensive feedback within seconds
              </li>
              <li>
                <strong>Actionable Improvements:</strong> Get specific, prioritized recommendations
              </li>
              <li>
                <strong>Apply Changes:</strong> Implement suggestions and re-analyze to track improvement
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-foreground">Our Approach</h2>
            <p>
              We believe in transparency and user control. That&apos;s why we offer:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li><strong>No Subscriptions:</strong> Pay only for what you need with our £7.99 per-report model</li>
              <li><strong>Free Trial:</strong> 3 free analyses per day to test our service</li>
              <li><strong>Privacy First:</strong> Your CV is deleted immediately after analysis</li>
              <li><strong>Flexible Authentication:</strong> Sign in with Google, GitHub, or email</li>
              <li><strong>No Lock-In:</strong> Download your feedback and delete your account anytime</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-foreground">The Technology</h2>
            <p>
              Our platform is built with cutting-edge technology to provide fast, accurate, and secure CV analysis:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li>AI-powered analysis using OpenAI&apos;s GPT models</li>
              <li>Secure authentication via NextAuth.js</li>
              <li>Industry-standard encryption for data protection</li>
              <li>Stripe-powered payment processing</li>
              <li>Modern, responsive web interface built with Next.js</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-foreground">Why Choose Us?</h2>
            <div className="grid md:grid-cols-2 gap-4 mt-3">
              <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2"><Zap className="w-4 h-4" /> Instant Results</h3>
                <p className="text-sm">Get comprehensive feedback in seconds, not days</p>
              </div>
              <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2"><Target className="w-4 h-4" /> Actionable Advice</h3>
                <p className="text-sm">Specific, prioritized recommendations you can implement immediately</p>
              </div>
              <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Affordable Pricing</h3>
                <p className="text-sm">No expensive subscriptions—pay per report at £7.99</p>
              </div>
              <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2"><Lock className="w-4 h-4" /> Privacy Protected</h3>
                <p className="text-sm">Your CV is automatically deleted after analysis</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-foreground">Get Started Today</h2>
            <p>
              Ready to improve your CV? Sign up for free and get 3 analyses per day. When you&apos;re ready
              for the full experience, unlock premium features for just £7.99 per report.
            </p>
            <div className="mt-4">
              <a
                href="/dashboard"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Start Analyzing Your CV
              </a>
            </div>
          </section>

          <section className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-8">
            <h2 className="text-2xl font-semibold mb-3 text-foreground">Contact Us</h2>
            <p className="mb-3">
              Have questions or feedback? We&apos;d love to hear from you:
            </p>
            <ul className="space-y-2">
              <li><strong>General Inquiries:</strong> <a href="mailto:support@cvanalyzer.com" className="text-blue-600 dark:text-blue-400 hover:underline">support@cvanalyzer.com</a></li>
              <li><strong>Technical Support:</strong> <a href="mailto:support@cvanalyzer.com" className="text-blue-600 dark:text-blue-400 hover:underline">support@cvanalyzer.com</a></li>
              <li><strong>Privacy Concerns:</strong> <a href="mailto:privacy@cvanalyzer.com" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@cvanalyzer.com</a></li>
            </ul>
          </section>
        </div>
      </div>
    </SimplePage>
  );
}
