import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import { docSchema } from './src/lib/doc-schema';
import { lightTheme, darkTheme } from './src/lib/code/theme';
import { transformerNotationDiff, transformerNotationHighlight, transformerMetaHighlight } from '@shikijs/transformers';

export const projects = defineDocs({
  dir: 'content/projects',
  docs: { schema: docSchema },
});

export const topics = defineDocs({
  dir: 'content/topics',
  // questions.yaml and CREDITS.md are data files, not docs pages.
  docs: { schema: docSchema, files: ['**/*.{md,mdx}', '!**/CREDITS.md'] },
  // Meta is only meta.json: topic.yaml files and questions.yaml are read
  // directly by scripts and server components, never via .source.
  meta: { files: ['**/meta.json'] },
});

export const books = defineDocs({
  dir: 'content/books',
  docs: { schema: docSchema },
});

export default defineConfig({ mdxOptions: { rehypeCodeOptions: {
  themes: { light: lightTheme, dark: darkTheme },
  defaultColor: false,
  transformers: [transformerNotationDiff(), transformerNotationHighlight(), transformerMetaHighlight()],
} } });
