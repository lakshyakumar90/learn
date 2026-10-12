"use client";
import { useState } from "react";
import { demos, type DemoId } from "@/lib/live-demos";
import { buildSrcdoc, BUTTON } from "./CodeRunner";
export function LiveDemo({ demo }: { demo: DemoId }) {
  const data = demos[demo]; const [version, setVersion] = useState(0);
  return <figure data-live-demo={demo} className="my-6 min-w-0"><figcaption className="mb-3 flex items-center justify-between gap-3 font-medium">{data.title}<button className={BUTTON} onClick={() => setVersion(v => v + 1)}>Reset demo</button></figcaption><iframe key={version} title={data.title} sandbox="allow-scripts" srcDoc={buildSrcdoc(data.js, data.html, data.css)} className="h-80 w-full rounded-xl border bg-white" /></figure>;
}
