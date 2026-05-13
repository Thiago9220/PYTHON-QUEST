import React from "react";

interface Props {
  concept: string;
  text: string;
  themeColor?: string;
}

type Block =
  | { type: "paragraph"; text: string }
  | { type: "list"; intro?: string; items: string[] };

const SENTENCE_SPLIT = /(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ(])/;

function parseExplanation(raw: string): Block[] {
  const blocks: Block[] = [];
  const sentences = raw
    .split(SENTENCE_SPLIT)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const sentence of sentences) {
    const numberedMatches = sentence.match(/\(\d+\)/g);

    if (numberedMatches && numberedMatches.length >= 2) {
      const firstMatch = sentence.match(/\(\d+\)/);
      const introEnd = firstMatch ? firstMatch.index ?? 0 : 0;
      let intro = sentence.slice(0, introEnd).trim();
      intro = intro.replace(/[:,—–\-]\s*$/u, "").trim();

      const rest = sentence.slice(introEnd);
      const items = rest
        .split(/\(\d+\)/)
        .map((item) => item.trim().replace(/[;.,]\s*$/, "").trim())
        .filter((item) => item.length > 0);

      blocks.push({
        type: "list",
        intro: intro || undefined,
        items,
      });
      continue;
    }

    blocks.push({ type: "paragraph", text: sentence });
  }

  return blocks;
}

const INLINE_REGEX =
  /([A-ZÁÉÍÓÚÂÊÔÃÕÇ]{2,}[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9\-_]*)|(?<![a-zA-Záéíóúâêôãõç])'([^'\n]+?)'(?![a-zA-Záéíóúâêôãõç])|`([^`\n]+)`/g;

function renderInline(text: string, themeColor: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = INLINE_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      result.push(
        <strong
          key={`c${key++}`}
          className="font-bold"
          style={{ color: themeColor }}
        >
          {match[1]}
        </strong>
      );
    } else if (match[2] !== undefined) {
      result.push(
        <code
          key={`q${key++}`}
          className="text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[12.5px] font-mono"
        >
          {match[2]}
        </code>
      );
    } else if (match[3] !== undefined) {
      result.push(
        <code
          key={`q${key++}`}
          className="text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[12.5px] font-mono"
        >
          {match[3]}
        </code>
      );
    }
    lastIndex = INLINE_REGEX.lastIndex;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}

export function ConceptExplanation({
  concept,
  text,
  themeColor = "#38BDF8",
}: Props) {
  const blocks = parseExplanation(text);

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-sky-500/20 shadow-lg">
      <div
        className="inline-flex items-center gap-2 px-3 py-1 font-bold uppercase tracking-wider text-[10px] rounded-full mb-5"
        style={{
          backgroundColor: `${themeColor}22`,
          color: themeColor,
          border: `1px solid ${themeColor}40`,
        }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full animate-pulse"
          style={{ backgroundColor: themeColor }}
        />
        Conceito: {concept}
      </div>

      <div className="space-y-4 text-slate-300 text-[14.5px]">
        {blocks.map((block, i) => {
          if (block.type === "paragraph") {
            return (
              <p key={i} className="leading-[1.75]">
                {renderInline(block.text, themeColor)}
              </p>
            );
          }

          return (
            <div key={i} className="space-y-2.5">
              {block.intro && (
                <p className="leading-[1.75] font-semibold text-slate-200">
                  {renderInline(block.intro, themeColor)}
                  <span className="text-slate-500">:</span>
                </p>
              )}
              <ol className="space-y-2 ml-0.5">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3 items-start">
                    <span
                      className="flex shrink-0 h-5 w-5 items-center justify-center text-[10px] font-black rounded-md mt-0.5"
                      style={{
                        backgroundColor: `${themeColor}22`,
                        color: themeColor,
                        border: `1px solid ${themeColor}30`,
                      }}
                    >
                      {j + 1}
                    </span>
                    <span className="leading-[1.7] flex-1">
                      {renderInline(item, themeColor)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
    </div>
  );
}
