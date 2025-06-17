"use client";

import { SessionProvider } from "next-auth/react";

export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}