"use client";
import dynamic from "next/dynamic";
export const IllustrationClient = dynamic(() =>
  import("./IllustrationClient").then((m) => m.IllustrationClient),
) as typeof import("./IllustrationClient").IllustrationClient;
export const StoryboardClient = dynamic(() =>
  import("./IllustrationClient").then((m) => m.StoryboardClient),
) as typeof import("./IllustrationClient").StoryboardClient;
export const AnnotatedImageClient = dynamic(() =>
  import("./IllustrationClient").then((m) => m.AnnotatedImageClient),
) as typeof import("./IllustrationClient").AnnotatedImageClient;
