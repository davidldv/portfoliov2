"use client";

import { useRef, useState, type ComponentProps } from "react";
import { Check, Copy } from "lucide-react";

const LANG_LABEL: Record<string, string> = { ts: "TypeScript", tsx: "TSX", js: "JavaScript", bash: "Bash", sh: "Shell", json: "JSON", text: "Text", py: "Python" };

/** Shiki-highlighted <pre> with a header bar: language label and a copy button. */
export function CodeBlock({ children, ...props }: ComponentProps<"pre"> & { "data-language"?: string }) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const lang = props["data-language"] ?? "text";

  const copy = async () => {
    const text = ref.current?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked (permissions, insecure context); the code is still selectable.
    }
  };

  return (
    <figure className="code-block">
      <figcaption className="code-block__bar">
        <span className="code-block__lang">{LANG_LABEL[lang] ?? lang}</span>
        <button type="button" onClick={copy} className="code-block__copy" aria-label={copied ? "Copied" : "Copy code"}>
          {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </figcaption>
      <pre ref={ref} {...props}>
        {children}
      </pre>
    </figure>
  );
}
