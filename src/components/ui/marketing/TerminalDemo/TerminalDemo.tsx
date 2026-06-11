import { useEffect, useState, useRef } from 'react';

export type LineType =
  | 'command'
  | 'intro'
  | 'prompt-label'
  | 'prompt-input'
  | 'prompt-hint'
  | 'select-label'
  | 'select-option'
  | 'select-option-active'
  | 'select-hint'
  | 'spinner'
  | 'success'
  | 'note-header'
  | 'note-content'
  | 'outro'
  | 'system-command'
  | 'ok-line'
  | 'result-line'
  | 'info-line'
  | 'metric-line'
  | 'status-line';

export interface ScriptLine {
  text: string;
  delay: number;
  type: LineType;
}

const DEFAULT_RESTART_MS = 6000;

// Replicate the actual CLI experience from create-velocity-astro
const defaultScript: ScriptLine[] = [
  { text: '$ pnpm create velocity-astro@latest', delay: 1200, type: 'command' },
  { text: '', delay: 300, type: 'command' },

  { text: '┌  Create Velocity', delay: 400, type: 'intro' },
  { text: '│', delay: 100, type: 'prompt-label' },

  { text: '◇  What is your project name?', delay: 400, type: 'prompt-label' },
  { text: '│  my-awesome-site', delay: 800, type: 'prompt-input' },
  { text: '│', delay: 200, type: 'prompt-label' },

  { text: '◇  Include demo landing page and sample content?', delay: 400, type: 'select-label' },
  { text: '│  ○ No  · Minimal starter with basic pages', delay: 300, type: 'select-option' },
  { text: '│  ● Yes · Full demo with landing page, blog posts', delay: 600, type: 'select-option-active' },
  { text: '│', delay: 200, type: 'prompt-label' },

  { text: '◇  Include UI component library?', delay: 400, type: 'select-label' },
  { text: '│  ● Yes · Buttons, forms, cards, dialogs, etc.', delay: 500, type: 'select-option-active' },
  { text: '│', delay: 200, type: 'prompt-label' },

  { text: '◇  Add internationalization (i18n)?', delay: 400, type: 'select-label' },
  { text: '│  ● Yes · Locale routing, translations', delay: 500, type: 'select-option-active' },
  { text: '│', delay: 200, type: 'prompt-label' },

  { text: '◇  Which package manager?', delay: 400, type: 'select-label' },
  { text: '│  ● pnpm · recommended', delay: 400, type: 'select-option-active' },
  { text: '│', delay: 300, type: 'prompt-label' },

  { text: '◐  Scaffolding project...', delay: 400, type: 'spinner' },
  { text: '✔  Scaffolding project', delay: 300, type: 'success' },
  { text: '◐  Copying demo content...', delay: 300, type: 'spinner' },
  { text: '✔  Copying demo content', delay: 250, type: 'success' },
  { text: '◐  Setting up components...', delay: 300, type: 'spinner' },
  { text: '✔  Setting up components', delay: 250, type: 'success' },
  { text: '◐  Configuring i18n...', delay: 300, type: 'spinner' },
  { text: '✔  Configuring i18n', delay: 250, type: 'success' },
  { text: '│', delay: 200, type: 'prompt-label' },

  { text: '◇  Next steps ─────────────────────╮', delay: 300, type: 'note-header' },
  { text: '│                                  │', delay: 50, type: 'note-content' },
  { text: '│  cd my-awesome-site              │', delay: 100, type: 'note-content' },
  { text: '│  pnpm dev                        │', delay: 100, type: 'note-content' },
  { text: '│                                  │', delay: 50, type: 'note-content' },
  { text: '├──────────────────────────────────╯', delay: 200, type: 'note-content' },
  { text: '│', delay: 100, type: 'prompt-label' },

  { text: '└  Happy building!', delay: 0, type: 'outro' },
];

function isTypingLineType(type: LineType): boolean {
  return type === 'command' || type === 'prompt-input' || type === 'system-command';
}

export type TerminalDemoProps = {
  script?: ScriptLine[];
  chromeLabel?: string;
  contentClassName?: string;
  restartDelayMs?: number;
};

export function TerminalDemo({
  script: scriptProp,
  chromeLabel = 'terminal',
  contentClassName,
  restartDelayMs,
}: TerminalDemoProps) {
  const activeScript = scriptProp ?? defaultScript;
  const loopPauseMs = restartDelayMs ?? DEFAULT_RESTART_MS;

  const [lines, setLines] = useState<{ text: string; type: LineType }[]>([]);
  const [_currentIndex, setCurrentIndex] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scriptFingerprint = JSON.stringify(
    activeScript.map(l => `${l.text}\0${l.delay}\0${l.type}`)
  );

  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const timeoutIds: ReturnType<typeof setTimeout>[] = [];

    if (reduceMotion) {
      setLines(activeScript.map(l => ({ text: l.text, type: l.type })));
      setTypingText('');
      setIsTyping(false);
      return () => timeoutIds.forEach(clearTimeout);
    }

    const processLine = (index: number) => {
      if (index >= activeScript.length) {
        timeoutIds.push(
          setTimeout(() => {
            setLines([]);
            setCurrentIndex(0);
            setTypingText('');
            processLine(0);
          }, loopPauseMs)
        );
        return;
      }

      const line = activeScript[index];

      if (isTypingLineType(line.type)) {
        setIsTyping(true);
        let charIdx = 0;

        const typeChar = () => {
          if (charIdx <= line.text.length) {
            setTypingText(line.text.slice(0, charIdx));
            charIdx++;
            timeoutIds.push(setTimeout(typeChar, 35));
          } else {
            setIsTyping(false);
            setLines(prev => [...prev, { text: line.text, type: line.type }]);
            setTypingText('');
            setCurrentIndex(index + 1);
            timeoutIds.push(setTimeout(() => processLine(index + 1), line.delay));
          }
        };
        typeChar();
      } else if (line.type === 'spinner') {
        setLines(prev => [...prev, { text: line.text, type: line.type }]);
        setCurrentIndex(index + 1);
        timeoutIds.push(
          setTimeout(() => {
            setLines(prev => prev.slice(0, -1));
            processLine(index + 1);
          }, line.delay)
        );
      } else {
        setLines(prev => [...prev, { text: line.text, type: line.type }]);
        setCurrentIndex(index + 1);
        timeoutIds.push(setTimeout(() => processLine(index + 1), line.delay));
      }
    };

    processLine(0);

    return () => {
      timeoutIds.forEach(clearTimeout);
    };
  }, [scriptFingerprint, loopPauseMs]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, typingText]);

  const getLineClass = (type: LineType): string => {
    switch (type) {
      case 'command':
        return 'text-foreground dark:text-on-invert';
      case 'system-command':
        return 'text-blue-600 dark:text-blue-300';
      case 'ok-line':
        return 'text-green-600 dark:text-green-400';
      case 'result-line':
        return 'text-foreground-muted dark:text-gray-400';
      case 'info-line':
        return 'text-foreground dark:text-on-invert';
      case 'metric-line':
        return 'text-green-600 dark:text-green-300 font-medium';
      case 'status-line':
        return 'text-green-600 dark:text-green-400 font-semibold';
      case 'intro':
        return 'text-cyan-400 font-bold';
      case 'prompt-label':
        return 'text-gray-300';
      case 'prompt-input':
        return 'text-foreground dark:text-on-invert';
      case 'prompt-hint':
        return 'text-gray-300';
      case 'select-label':
        return 'text-gray-300';
      case 'select-option':
        return 'text-gray-300';
      case 'select-option-active':
        return 'text-cyan-400';
      case 'select-hint':
        return 'text-gray-300';
      case 'spinner':
        return 'text-cyan-400 animate-pulse';
      case 'success':
        return 'text-green-400';
      case 'note-header':
        return 'text-gray-300';
      case 'note-content':
        return 'text-gray-300';
      case 'outro':
        return 'text-green-400 font-bold';
      default:
        return 'text-foreground dark:text-on-invert';
    }
  };

  const contentClasses =
    contentClassName ?? 'h-[380px] overflow-y-auto p-4 font-mono text-xs leading-5';

  const currentTypingLineType =
    lines.length < activeScript.length ? activeScript[lines.length]?.type : undefined;
  const typingRowClass =
    currentTypingLineType && isTypingLineType(currentTypingLineType)
      ? getLineClass(currentTypingLineType)
      : 'text-foreground dark:text-on-invert';

  return (
    <div className="w-full max-w-lg min-w-0 overflow-hidden rounded-md border border-border bg-background shadow-xl mx-auto lg:mx-0 dark:border-border-invert dark:bg-surface-invert">
      <div className="flex items-center gap-2 border-b border-border bg-background-secondary px-4 py-3 dark:border-border-invert dark:bg-surface-invert-secondary">
        <div className="h-3 w-3 rounded-full bg-error" />
        <div className="h-3 w-3 rounded-full bg-warning" />
        <div className="h-3 w-3 rounded-full bg-success" />
      </div>

      <div
        ref={scrollRef}
        className={`${contentClasses} overflow-x-auto break-words whitespace-pre-wrap text-[11px] sm:text-xs leading-5`}
      >
        {lines.map((line, idx) => (
          <div key={idx} className={getLineClass(line.type)}>
            {line.text}
          </div>
        ))}
        {isTyping && (
          <div className={typingRowClass}>
            {typingText}
            <span className="inline-block h-4 w-2 bg-on-invert animate-pulse align-middle ml-0.5" />
          </div>
        )}
      </div>
    </div>
  );
}

export default TerminalDemo;
