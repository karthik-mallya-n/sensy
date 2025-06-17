"use client";

import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { twilight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";

export default function ResponseFormat({ content }: { content: string }) {
  const [displayedContent, setDisplayedContent] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!content) return;

    setDisplayedContent(""); // Reset content
    setIsTyping(true);

    let index = 0;
    const typingSpeed = 10; // Faster typing in milliseconds
    const chunk = 3; // Characters per update for smoother appearance

    // Clear any existing interval
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    typingIntervalRef.current = setInterval(() => {
      const nextChunk = content.slice(index, index + chunk);
      setDisplayedContent((prev) => prev + nextChunk);
      index += chunk;

      if (index >= content.length) {
        clearInterval(typingIntervalRef.current!);
        setIsTyping(false);
      }
    }, typingSpeed);

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [content]);

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="prose prose-invert max-w-none rounded-lg bg-gray-900 p-6 whitespace-pre-wrap text-white relative">
      {isTyping && (
        <div className="absolute top-2 right-2">
          <div className="inline-block h-3 w-3 animate-pulse rounded-full bg-green-400"></div>
        </div>
      )}
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="mb-1 text-3xl font-bold" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="mb-1 text-2xl font-bold" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="mb-1 text-xl font-semibold" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="mb-1 text-lg font-semibold" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-1 leading-relaxed text-base" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="ml-1 list-inside list-disc space-y-0.5 mb-3 text-base" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="ml-1 list-inside list-decimal space-y-0.5 mb-1 text-base" {...props} />
          ),
          li: ({ node, ...props }) => <li className="mb-0.5" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-gray-500 pl-3 italic my-3 text-sm" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-blue-400 hover:text-blue-300 underline" {...props} />
          ),
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");

            if (!inline && match) {
              return (
                <div className="relative mb-4 rounded-md">
                  <div className="flex items-center justify-between rounded-t-md bg-gray-800 px-3 py-1.5 text-xs text-gray-200">
                    <span>{match[1]}</span>
                    <button
                      onClick={() => handleCopyCode(codeString)}
                      className="flex items-center text-gray-400 hover:text-white transition-colors"
                    >
                      {copiedCode === codeString ? (
                        <>
                          <CheckIcon className="h-3 w-3 mr-1" /> Copied
                        </>
                      ) : (
                        <>
                          <ClipboardIcon className="h-3 w-3 mr-1" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <SyntaxHighlighter
                    style={twilight}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-b-md text-sm"
                    wrapLines={true}
                    showLineNumbers={true}
                    customStyle={{ margin: 0, padding: '0.75rem' }}
                    {...props}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              );
            } else {
              return (
                <code
                  className="mx-0.5 rounded bg-gray-700 px-1 py-0.5 text-gray-100 font-mono text-xs"
                  {...props}
                >
                  {children}
                </code>
              );
            }
          },
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full text-sm" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-800 text-xs" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="border-b border-gray-700" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-3 py-2 text-left font-medium" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3 py-2" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-3 border-gray-700" {...props} />
          ),
        }}
      >
        {displayedContent}
      </ReactMarkdown>
    </div>
  );
}
