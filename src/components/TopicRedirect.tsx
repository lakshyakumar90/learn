"use client";
import { useEffect } from "react";
export function TopicRedirect({ href }: { href: string }) {
  useEffect(() => { window.location.replace(href + window.location.search + window.location.hash); }, [href]);
  return <main className="p-8"><p>This lesson has moved to <a href={href}>the consolidated page</a>.</p><noscript><meta httpEquiv="refresh" content={`0;url=${href}`} /></noscript></main>;
}
