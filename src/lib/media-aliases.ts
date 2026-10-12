/* Preserve catalog metadata while replacing retired artwork at render time. */
const aliases: Record<string, string> = {
  '/media/javascript/cover.jpg': '/topics/javascript/img/cover.webp',
};
export function resolveMedia(src: string) { return aliases[src] ?? src; }
