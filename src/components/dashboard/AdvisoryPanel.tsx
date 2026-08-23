import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sprout } from 'lucide-react';

interface AdvisoryPanelProps {
  advisory: string;
  loading: boolean;
}

export default function AdvisoryPanel({ advisory, loading }: AdvisoryPanelProps) {
  return (
    <div className="w-full h-full flex flex-col pt-4">
      <h3 className="font-serif text-sm text-ink/50 uppercase tracking-widest mb-6 flex items-center gap-2">
        <Sprout className="w-4 h-4 text-moss" />
        Next Right Move
      </h3>
      
      <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col gap-4 animate-pulse">
            <div className="h-6 bg-moss/10 rounded w-3/4"></div>
            <div className="h-4 bg-moss/5 rounded w-full"></div>
            <div className="h-4 bg-moss/5 rounded w-5/6"></div>
            <div className="h-4 bg-moss/5 rounded w-4/5 mt-4"></div>
          </div>
        ) : (
          <div className="prose prose-sm md:prose-base max-w-none 
            prose-headings:font-serif prose-headings:text-deep-forest prose-headings:font-normal
            prose-p:font-sans prose-p:text-ink/80 prose-p:leading-relaxed
            prose-strong:text-deep-forest prose-strong:font-medium
            prose-li:text-ink/80 prose-li:marker:text-moss">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {advisory || "Select a field on the map to generate a location-specific advisory."}
            </ReactMarkdown>
          </div>
        )}
      </div>
      
      {!loading && advisory && (
        <div className="mt-6 pt-4 border-t border-soft-line">
          <button className="bg-terracotta text-paper-ivory px-6 py-2 rounded-full text-sm font-medium hover:bg-[#b05c33] transition-colors shadow-sm">
            Log Action Completed
          </button>
        </div>
      )}
    </div>
  );
}
