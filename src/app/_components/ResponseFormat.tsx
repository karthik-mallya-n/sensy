"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { twilight } from "react-syntax-highlighter/dist/cjs/styles/prism";

export default function ResponseFormat({ content }: { content: string }) {
  const [displayedContent, setDisplayedContent] = useState<string>("");

  useEffect(() => {
    if (!content) return;

    setDisplayedContent(""); // Reset content if new message

    let index = 0;

    const interval = setInterval(() => {
      setDisplayedContent((prev) => prev + content[index]);
      index++;

      if (index >= content.length) {
        clearInterval(interval);
      }
    }, 1); // Adjust speed: 30ms per character for smooth typing

    return () => clearInterval(interval);
  }, [content]);

  return (
    <div className="prose prose-invert prose-lg max-w-none rounded-lg bg-gray-900 p-10 whitespace-pre-wrap text-white">
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="mb-4 text-4xl font-bold" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="mb-3 text-3xl font-bold" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="mb-2 text-2xl font-semibold" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="mb-1 text-xl font-semibold" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="ml-4 list-inside list-disc" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="ml-4 list-inside list-decimal" {...props} />
          ),
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={twilight}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code
                className="mx-1 rounded bg-gray-200 px-1 py-0.5 text-gray-900"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {displayedContent}
      </ReactMarkdown>
    </div>
  );
}
