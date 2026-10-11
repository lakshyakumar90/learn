import { books, projects, topics } from '@/.source/server';
import { loader } from 'fumadocs-core/source';

export const projectsSource = loader({
  baseUrl: '/projects',
  source: projects.toFumadocsSource(),
});

export const topicsSource = loader({
  baseUrl: '/topics',
  source: topics.toFumadocsSource(),
});

export const booksSource = loader({
  baseUrl: '/books',
  source: books.toFumadocsSource(),
});
