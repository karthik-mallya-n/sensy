"use client";

import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";

export default function ResponseFormat({ content }: { content: string }) {
  const [displayedContent, setDisplayedContent] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isHoveringCopy, setIsHoveringCopy] = useState(false);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!content) return;

    setDisplayedContent("");
    setIsTyping(true);

    let index = 0;
    const typingSpeed = 10;
    const chunk = 3;

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
    <div className="prose prose-invert max-w-none rounded-lg bg-transparent p-6 px-8 text-white relative">

      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="mb-4 text-3xl font-bold leading-tight" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="mb-4 text-2xl font-bold leading-snug" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="mb-3 text-xl font-semibold leading-snug" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="mb-3 text-lg font-semibold leading-snug" {...props} />
          ),

          p: ({ node, ...props }) => (
            <p className="mb-3 leading-relaxed text-base" {...props} />
          ),

          ul: ({ node, ...props }) => (
            <ul
              className="ml-6 list-disc space-y-1 mb-4 text-base"
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="ml-6 list-decimal space-y-1 mb-4 text-base"
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li className="mb-1" {...props} />
          ),

          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-gray-500 pl-5 italic my-4 text-sm text-gray-300"
              {...props}
            />
          ),

          a: ({ node, ...props }) => (
            <a
              className="text-blue-400 hover:text-blue-300 underline"
              {...props}
            />
          ),

          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");

            if (!inline && match) {
              return (
                <div className="relative mb-6 rounded-md">
                  <div className="flex items-center justify-between rounded-t-md bg-gray-800 px-4 py-2 text-xs text-gray-200">
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
                    language={match[1]}
                    style={atomDark}
                    PreTag="div"
                    wrapLines={true}
                    showLineNumbers={true}
                    className="text-sm rounded-b-md overflow-x-auto scrollbar-thin scrollbar-thumb-[#47585e] scrollbar-track-[#1f2626] px-4 py-3"
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              );
            } else {
              return (
                <code
                  className="mx-0.5 rounded w-full bg-gray-700 px-1.5 py-0.5 text-gray-100 font-mono text-xs"
                  {...props}
                >
                  {children}
                </code>
              );
            }
          },

          table: ({ node, ...props }) => (
            <div className="overflow-x-auto mb-6">
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
            <th className="px-4 text-left font-medium" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-1" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-6 border-gray-700" {...props} />
          ),
        }}
      >
        {displayedContent}
      </ReactMarkdown>

      {!isTyping && (
<div className="mt-4 flex justify-start">
  <button
    onClick={async () => {
      await navigator.clipboard.writeText(content);
      setCopiedCode("full-message");
      setTimeout(() => setCopiedCode(null), 2000);
    }}
    onMouseEnter={() => setIsHoveringCopy(true)}
    onMouseLeave={() => setIsHoveringCopy(false)}
    className="relative flex items-center gap-2 rounded-md bg-transparent px-1 text-sm text-gray-300 hover:bg-transparent transition"
  >
    {copiedCode === "full-message" ? (
      <>
        <CheckIcon className="h-4 w-4 text-white" />
      </>
    ) : (
      <>
        {isHoveringCopy ? (
          <CheckIcon className="h-4 w-4 text-gray-400" />
        ) : (
          <ClipboardIcon className="h-4 w-4" />
        )}
      </>
    )}

    {/* Tooltip below */}
    {isHoveringCopy && copiedCode !== "full-message" && (
      <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-700 px-2 py-1 text-xs text-white shadow-lg select-none pointer-events-none">
        Copy
      </div>
    )}
  </button>
</div>

      )}
    </div>
  );
}
