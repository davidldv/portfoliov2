import "server-only";
import type { ComponentProps, ReactNode } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import Link from "next/link";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeShiki from "@shikijs/rehype";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { toString as hastToString } from "hast-util-to-string";
import { visit } from "unist-util-visit";
import type { Element, ElementContent, Root } from "hast";
import { CodeBlock } from "@/components/writeups/CodeBlock";

import type { TocItem } from "@/components/writeups/TableOfContents";
export type { TocItem };

/** Old-site paths that have no page here, mapped to where they should go now. */
const LINK_REWRITES: Record<string, string> = {
  "/authzscan": "https://github.com/davidldv/authzscan",
};

/** Collects h2/h3 for the table of contents. Runs after rehype-slug so ids exist. */
function rehypeToc(toc: TocItem[]) {
  return () => (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if ((node.tagName === "h2" || node.tagName === "h3") && typeof node.properties.id === "string") {
        toc.push({ id: node.properties.id, text: hastToString(node), depth: node.tagName === "h2" ? 2 : 3 });
      }
    });
  };
}

/** Wraps the leading "TL;DR" heading and its content in a <section class="tldr"> so it can render as a summary card. */
function rehypeTldr() {
  return (tree: Root) => {
    const kids = tree.children;
    const start = kids.findIndex((n) => n.type === "element" && n.tagName === "h2" && /^tl;?dr$/i.test(hastToString(n).trim()));
    if (start === -1) return;
    let end = start + 1;
    while (end < kids.length && !(kids[end].type === "element" && (kids[end] as Element).tagName === "h2")) end++;
    const section: Element = {
      type: "element",
      tagName: "section",
      properties: { className: ["tldr"] },
      children: kids.slice(start, end) as ElementContent[],
    };
    kids.splice(start, end - start, section);
  };
}

/** Rewrites legacy links and tags external ones so the renderer can add rel/target safely. */
function rehypeLinks() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "a" || typeof node.properties.href !== "string") return;
      let href = node.properties.href;
      const bare = href.replace(/\/$/, "");
      if (LINK_REWRITES[bare]) href = LINK_REWRITES[bare];
      node.properties.href = href;
    });
  };
}

function Heading({ as: Tag, id, children }: { as: "h2" | "h3"; id?: string; children?: ReactNode }) {
  return (
    <Tag id={id} className="group/heading">
      {children}
      {id && (
        <a href={`#${id}`} className="heading-anchor" aria-label="Link to this section">
          #
        </a>
      )}
    </Tag>
  );
}

function Anchor({ href = "", children, ...rest }: ComponentProps<"a">) {
  const external = /^https?:\/\//.test(href);
  if (href.startsWith("/")) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  // Only same-page anchors and mailto survive; anything else (javascript:, data:) is rendered as plain text.
  if (href.startsWith("#") || href.startsWith("mailto:")) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }
  return <span>{children}</span>;
}

/**
 * Markdown → React elements. Raw HTML in the source is dropped by remark-rehype
 * (no `allowDangerousHtml`), and the tree is turned into React elements rather
 * than an HTML string, so nothing is ever injected with dangerouslySetInnerHTML.
 */
export async function renderMarkdown(source: string): Promise<{ content: ReactNode; toc: TocItem[] }> {
  const toc: TocItem[] = [];
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeToc(toc))
    .use(rehypeTldr)
    .use(rehypeLinks)
    .use(rehypeShiki, {
      themes: { light: "vitesse-light", dark: "vitesse-dark" },
      defaultColor: false,
      fallbackLanguage: "text",
      transformers: [
        {
          pre(node) {
            node.properties["data-language"] = this.options.lang;
          },
        },
      ],
    });

  const tree = (await processor.run(processor.parse(source))) as Root;

  const content = toJsxRuntime(tree, {
    Fragment,
    jsx,
    jsxs,
    components: {
      h2: (props) => <Heading as="h2" {...props} />,
      h3: (props) => <Heading as="h3" {...props} />,
      a: Anchor,
      pre: (props) => <CodeBlock {...props} />,
      table: (props) => (
        <div className="table-wrap">
          <table {...props} />
        </div>
      ),
    },
  });

  return { content, toc };
}
