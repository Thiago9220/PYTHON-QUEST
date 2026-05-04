/**
 * SQL Quest — Editor SQL com Syntax Highlighting
 * Design: Dark Academia / Terminal Moderno
 * Editor simples com highlight de palavras-chave SQL
 */

import { useRef, useEffect, useState, useCallback } from "react";

const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "IN", "LIKE", "BETWEEN",
  "ORDER", "BY", "GROUP", "HAVING", "LIMIT", "OFFSET", "JOIN", "INNER",
  "LEFT", "RIGHT", "OUTER", "ON", "AS", "DISTINCT", "COUNT", "SUM", "AVG",
  "MIN", "MAX", "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE",
  "CREATE", "TABLE", "DROP", "ALTER", "PRIMARY", "KEY", "FOREIGN", "NULL",
  "IS", "ASC", "DESC", "CASE", "WHEN", "THEN", "ELSE", "END", "EXISTS",
  "UNION", "ALL", "INTERSECT", "EXCEPT", "WITH", "RECURSIVE",
];

function highlightSQL(code: string): string {
  // Escapar HTML
  let escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Strings
  escaped = escaped.replace(/'([^']*)'/g, '<span class="sql-string">\'$1\'</span>');

  // Números
  escaped = escaped.replace(/\b(\d+\.?\d*)\b/g, '<span class="sql-number">$1</span>');

  // Comentários
  escaped = escaped.replace(/(--[^\n]*)/g, '<span class="sql-comment">$1</span>');

  // Palavras-chave (case-insensitive)
  const kwRegex = new RegExp(`\\b(${SQL_KEYWORDS.join("|")})\\b`, "gi");
  escaped = escaped.replace(kwRegex, '<span class="sql-keyword">$1</span>');

  // Asterisco
  escaped = escaped.replace(/\*/g, '<span class="sql-operator">*</span>');

  return escaped;
}

type Props = {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export default function SqlEditor({ value, onChange, disabled, placeholder }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  const syncScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current && lineNumbersRef.current) {
      const { scrollTop, scrollLeft } = textareaRef.current;
      highlightRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollLeft = scrollLeft;
      lineNumbersRef.current.scrollTop = scrollTop;
    }
  }, []);

  useEffect(() => {
    syncScroll();
  }, [value, syncScroll]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2;
          textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const lines = value.split("\n");

  return (
    <div
      className={`relative rounded-xl overflow-hidden border transition-all duration-200 ${
        focused
          ? "border-amber-600/60 shadow-[0_0_20px_rgba(251,191,36,0.1)]"
          : "border-amber-900/30"
      } ${disabled ? "opacity-60" : ""}`}
      style={{ background: "#0f0d0a" }}
    >
      <div className="flex relative h-[300px]">
        {/* Linha de números - agora com scroll sincronizado */}
        <div
          ref={lineNumbersRef}
          className="flex-shrink-0 w-12 pt-4 pb-4 text-right pr-3 select-none overflow-hidden"
          style={{
            background: "#0a0806",
            borderRight: "1px solid rgba(120,80,20,0.2)",
          }}
        >
          {lines.map((_, i) => (
            <div
              key={i}
              className="text-amber-800/40 font-mono text-[12px]"
              style={{ height: "24px", lineHeight: "24px" }}
            >
              {i + 1}
            </div>
          ))}
          {/* Espaço extra para bater com o scroll do textarea */}
          <div style={{ height: "100px" }} />
        </div>

        {/* Editor area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Highlight layer */}
          <div
            ref={highlightRef}
            aria-hidden
            className="absolute inset-0 p-4 font-mono text-[14px] overflow-hidden pointer-events-none whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{ __html: highlightSQL(value) + (value.endsWith('\n') ? ' ' : '') }}
            style={{ 
              color: "#d4b896", 
              lineHeight: "24px",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
            }}
          />

          {/* Textarea real */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={syncScroll}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            placeholder={placeholder}
            spellCheck={false}
            wrap="soft"
            className="relative w-full h-full p-4 font-mono text-[14px] bg-transparent text-transparent caret-amber-500 resize-none outline-none whitespace-pre-wrap break-words placeholder:text-amber-800/30"
            style={{ 
              lineHeight: "24px",
              caretColor: "#f59e0b",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
            }}
          />
        </div>
      </div>

      {/* Estilos de highlight injetados */}
      <style>{`
        .sql-keyword { color: #f59e0b; font-weight: 600; }
        .sql-string  { color: #86efac; }
        .sql-number  { color: #93c5fd; }
        .sql-comment { color: #6b7280; font-style: italic; }
        .sql-operator { color: #f59e0b; }
      `}</style>
    </div>
  );
}
