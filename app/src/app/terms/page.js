import { readFileSync } from 'fs';
import { join } from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SimplePage from '@/components/SimplePage';

export default function TermsPage() {
  // Read the markdown file
  const markdownPath = join(process.cwd(), 'TERMS_OF_SERVICE.md');
  const markdownContent = readFileSync(markdownPath, 'utf-8');

  return (
    <SimplePage>
      <div className="p-8 pb-20 max-w-4xl mx-auto">
      <article className="markdown-content">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({node, ...props}) => <h1 className="text-4xl font-bold mb-4 text-foreground" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground" {...props} />,
            p: ({node, ...props}) => <p className="text-foreground-secondary leading-7 mb-4" {...props} />,
            strong: ({node, ...props}) => <strong className="text-foreground font-semibold" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc ml-6 my-4 space-y-2" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal ml-6 my-4 space-y-2" {...props} />,
            li: ({node, ...props}) => <li className="text-foreground-secondary leading-7" {...props} />,
            a: ({node, ...props}) => <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props} />,
            hr: ({node, ...props}) => <hr className="my-8 border-gray-200 dark:border-gray-800" {...props} />,
          }}
        >
          {markdownContent}
        </ReactMarkdown>
      </article>
      </div>
    </SimplePage>
  );
}
