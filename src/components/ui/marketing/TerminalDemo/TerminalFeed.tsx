import { useEffect, useRef } from 'react';

import type { LineType } from './TerminalDemo';

export type FeedLine = {
  text: string;
  type: LineType;
};

function getLineClass(type: LineType): string {
  switch (type) {
    case 'ok-line':
    case 'success':
    case 'metric-line':
      return 'text-green-600 dark:text-green-400';
    case 'spinner':
      return 'text-cyan-400 animate-pulse';
    case 'outro':
      return 'text-green-400 font-bold';
    case 'result-line':
      return 'text-foreground-muted dark:text-gray-400';
    case 'prompt-label':
    case 'select-label':
      return 'text-gray-300';
    default:
      return 'text-foreground dark:text-on-invert';
  }
}

type TerminalFeedProps = {
  lines: FeedLine[];
  chromeLabel?: string;
  className?: string;
  idleHint?: string;
};

export function TerminalFeed({
  lines,
  chromeLabel = 'pipeline',
  className,
  idleHint,
}: TerminalFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div
      className={`w-full min-w-0 overflow-hidden rounded-md border border-border bg-background shadow-xl dark:border-border-invert dark:bg-surface-invert ${className ?? ''}`}
    >
      <div className="flex items-center gap-2 border-b border-border bg-background-secondary px-4 py-3 dark:border-border-invert dark:bg-surface-invert-secondary">
        <div className="h-3 w-3 rounded-full bg-error" />
        <div className="h-3 w-3 rounded-full bg-warning" />
        <div className="h-3 w-3 rounded-full bg-success" />
        <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-foreground-muted">
          {chromeLabel}
        </span>
      </div>
      <div
        ref={scrollRef}
        className="h-[320px] overflow-y-auto overflow-x-auto p-4 font-mono text-[11px] leading-5 sm:text-xs"
      >
        {lines.length === 0 ? (
          <div className="text-foreground-muted">{idleHint ?? '—'}</div>
        ) : (
          lines.map((line, idx) => (
            <div key={idx} className={getLineClass(line.type)}>
              {line.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TerminalFeed;
