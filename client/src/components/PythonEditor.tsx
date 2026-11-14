import { useRef, useState, useMemo } from "react";

interface Props {
  code: string;
  onChange: (code: string) => void;
  onRun: () => void;
  isRunning: boolean;
  pythonReady: boolean;
  placeholder?: string;
}

const PYTHON_KEYWORDS = new Set([
  "def", "return", "if", "elif", "else", "for", "while", "break", "continue",
  "pass", "import", "from", "as", "class", "try", "except", "finally", "raise",
  "with", "lambda", "yield", "global", "nonlocal", "assert", "del", "in", "is",
  "and", "or", "not", "async", "await"
]);

const PYTHON_CONSTANTS = new Set(["True", "False", "None", "self"]);

const PYTHON_BUILTINS = new Set([
  "print", "input", "len", "range", "int", "float", "str", "bool", "list",
  "dict", "set", "tuple", "type", "isinstance", "sum", "min", "max", "abs",
  "round", "sorted", "enumerate", "zip", "map", "filter", "open", "super",
  "any", "all"
]);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlightPythonLine(line: string): string {
  if (!line) return "\n";

  // Tokenize a line into strings, comments, numbers, identifiers, operators, or whitespace
  const tokenRegex =
    /(#.*$)|("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|\b(\d+(?:\.\d+)?)\b|\b([A-Za-z_][A-Za-z0-9_]*)\b|([+\-*/%=<>!&|^~]+|[()[\]{}:.,])/g;

  let result = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      result += escapeHtml(line.slice(lastIndex, match.index));
    }

    const [full, comment, strLiteral, numberLiteral, identifier, punct] = match;

    if (comment !== undefined) {
      result += `<span class="text-slate-500 italic">${escapeHtml(comment)}</span>`;
    } else if (strLiteral !== undefined) {
      result += `<span class="text-emerald-300">${escapeHtml(strLiteral)}</span>`;
    } else if (numberLiteral !== undefined) {
      result += `<span class="text-amber-300">${escapeHtml(numberLiteral)}</span>`;
    } else if (identifier !== undefined) {
      if (PYTHON_KEYWORDS.has(identifier)) {
        result += `<span class="text-fuchsia-400 font-semibold">${escapeHtml(identifier)}</span>`;
      } else if (PYTHON_CONSTANTS.has(identifier)) {
        result += `<span class="text-orange-400 font-semibold">${escapeHtml(identifier)}</span>`;
      } else if (PYTHON_BUILTINS.has(identifier)) {
        result += `<span class="text-sky-300">${escapeHtml(identifier)}</span>`;
      } else {
        result += `<span class="text-slate-100">${escapeHtml(identifier)}</span>`;
      }
    } else if (punct !== undefined) {
      result += `<span class="text-cyan-400/80">${escapeHtml(punct)}</span>`;
    } else {
      result += escapeHtml(full);
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < line.length) {
    result += escapeHtml(line.slice(lastIndex));
  }

  return result;
}

export default function PythonEditor({
  code,
  onChange,
  onRun,
  isRunning,
  pythonReady,
  placeholder = "# Invoque seus comandos aqui...",
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const [activeLine, setActiveLine] = useState(0);

  const lines = useMemo(() => (code || "").split("\n"), [code]);
  const highlightedHtml = useMemo(
    () => lines.map((l) => highlightPythonLine(l)).join("\n") + (code.endsWith("\n") ? " " : ""),
    [lines, code]
  );

  const updateActiveLine = (el: HTMLTextAreaElement) => {
    const pos = el.selectionStart ?? 0;
    const lineIdx = el.value.slice(0, pos).split("\n").length - 1;
    setActiveLine(lineIdx);
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = scrollTop;
    }
  };

  const updateCodeAndCursor = (newCode: string, cursorStart: number, cursorEnd = cursorStart) => {
    onChange(newCode);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) {
        el.selectionStart = cursorStart;
        el.selectionEnd = cursorEnd;
        updateActiveLine(el);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    // Ctrl+Enter / Cmd+Enter to execute
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onRun();
      return;
    }

    // Tab / Shift+Tab indentation
    if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) {
        const lineStart = code.lastIndexOf("\n", start - 1) + 1;
        const currentLinePrefix = code.slice(lineStart, start);
        const spacesToRemove = currentLinePrefix.startsWith("    ")
          ? 4
          : currentLinePrefix.startsWith("  ")
            ? 2
            : currentLinePrefix.startsWith("\t")
              ? 1
              : 0;
        if (spacesToRemove > 0) {
          const newCode = code.slice(0, lineStart) + code.slice(lineStart + spacesToRemove);
          updateCodeAndCursor(newCode, Math.max(lineStart, start - spacesToRemove));
        }
      } else {
        const newCode = code.substring(0, start) + "    " + code.substring(end);
        updateCodeAndCursor(newCode, start + 4);
      }
      return;
    }

    // Enter with smart auto-indentation after ':'
    if (e.key === "Enter") {
      e.preventDefault();
      const lineStart = code.lastIndexOf("\n", start - 1) + 1;
      const currentLineBeforeCursor = code.slice(lineStart, start);
      const currentIndentMatch = currentLineBeforeCursor.match(/^[ \t]*/);
      const baseIndent = currentIndentMatch ? currentIndentMatch[0] : "";
      const trimmedBefore = currentLineBeforeCursor.trimEnd();
      const extraIndent = trimmedBefore.endsWith(":") ? "    " : "";
      const insertion = "\n" + baseIndent + extraIndent;
      const newCode = code.slice(0, start) + insertion + code.slice(end);
      updateCodeAndCursor(newCode, start + insertion.length);
      return;
    }

    // Backspace smart unindent (4 spaces at once on empty indent)
    if (e.key === "Backspace" && start === end && start > 0) {
      const lineStart = code.lastIndexOf("\n", start - 1) + 1;
      const beforeCursorInLine = code.slice(lineStart, start);
      if (beforeCursorInLine.length > 0 && /^ +$/.test(beforeCursorInLine) && beforeCursorInLine.length % 4 === 0) {
        e.preventDefault();
        const newCode = code.slice(0, start - 4) + code.slice(end);
        updateCodeAndCursor(newCode, start - 4);
        return;
      }
    }

    // Auto-close brackets and quotes
    const pairs: Record<string, string> = {
      "(": ")",
      "[": "]",
      "{": "}",
      '"': '"',
      "'": "'",
    };

    if (pairs[e.key] && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const closing = pairs[e.key];
      const nextChar = code[end];
      // If user types closing quote when already right before it, skip over
      if ((e.key === '"' || e.key === "'") && nextChar === e.key && start === end) {
        e.preventDefault();
        updateCodeAndCursor(code, start + 1);
        return;
      }
      if (start !== end) {
        e.preventDefault();
        const selected = code.slice(start, end);
        const newCode = code.slice(0, start) + e.key + selected + closing + code.slice(end);
        updateCodeAndCursor(newCode, start + 1, end + 1);
        return;
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/70 border-t border-white/5 overflow-hidden transition-all focus-within:border-sky-500/30">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div
            className={`h-1.5 w-1.5 rounded-full ${
              pythonReady ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-ping"
            }`}
          />
          <span className="text-[10px] font-mono text-sky-200/60 uppercase tracking-[0.2em]">
            {pythonReady ? "Python 3.11 • Pyodide Worker Ready" : "Inicializando Motor Python..."}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-[10px] font-mono text-slate-500">
            Ctrl + Enter para executar
          </span>
          <div className="flex gap-1.5 opacity-60">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
          </div>
        </div>
      </div>

      <div className="relative flex-1 flex min-h-[260px] overflow-hidden font-mono text-sm leading-6">
        {/* Line Numbers Gutter */}
        <div
          ref={gutterRef}
          aria-hidden="true"
          className="select-none py-5 px-3 bg-slate-950/60 border-r border-white/5 text-right text-xs font-mono overflow-hidden shrink-0 min-w-[3rem]"
        >
          {lines.map((_, idx) => (
            <div
              key={idx}
              className={`leading-6 transition-colors ${
                idx === activeLine ? "text-sky-400 font-bold" : "text-slate-600"
              }`}
            >
              {idx + 1}
            </div>
          ))}
        </div>

        {/* Code Highlight Layer + Transparent Textarea */}
        <div className="relative flex-1 overflow-hidden">
          <pre
            ref={preRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 m-0 py-5 px-5 font-mono text-sm leading-6 whitespace-pre overflow-hidden"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />

          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => {
              onChange(e.target.value);
              updateActiveLine(e.target);
            }}
            onClick={(e) => updateActiveLine(e.currentTarget)}
            onKeyUp={(e) => updateActiveLine(e.currentTarget)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            wrap="off"
            placeholder={placeholder}
            disabled={!pythonReady || isRunning}
            className="relative z-10 w-full h-full py-5 px-5 bg-transparent text-transparent caret-sky-400 font-mono text-sm leading-6 resize-none focus:outline-none selection:bg-sky-500/30 placeholder:text-slate-600 overflow-auto"
          />

          {/* Subtle decorative glow */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-sky-500/[0.03] to-transparent" />
        </div>
      </div>
    </div>
  );
}
