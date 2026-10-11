import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import { docSchema } from './src/lib/doc-schema';

export const projects = defineDocs({
  dir: 'content/projects',
  docs: { schema: docSchema },
});

export const topics = defineDocs({
  dir: 'content/topics',
  docs: { schema: docSchema },
});

export const books = defineDocs({
  dir: 'content/books',
  docs: { schema: docSchema },
});

export default defineConfig();
