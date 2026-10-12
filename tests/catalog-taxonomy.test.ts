/**
 * Taxonomy validation failures: bad category/tag/level/summary shapes
 * must throw, so build-catalog can fail the build with a clear message.
 */
import { describe, expect, it } from 'vitest';
import { validateTaxonomy } from '../content/taxonomy';
import { catalogItemSchema, topicYamlSchema } from '../src/lib/catalog/types';

describe('validateTaxonomy', () => {
  it('accepts the shipped taxonomy', () => {
    expect(() => validateTaxonomy()).not.toThrow();
  });

  it('rejects duplicate category ids', () => {
    const tax = validateTaxonomy();
    expect(() =>
      validateTaxonomy({
        ...tax,
        topics: {
          ...tax.topics,
          categories: [tax.topics.categories[0], tax.topics.categories[0]],
        },
      }),
    ).toThrow();
  });

  it('rejects unknown icon keys', () => {
    const tax = validateTaxonomy();
    expect(() =>
      validateTaxonomy({
        ...tax,
        topics: {
          ...tax.topics,
          categories: [{ ...tax.topics.categories[0], icon: 'rocket' }],
        },
      }),
    ).toThrow();
  });
});

const goodTopic = {
  id: 'x',
  title: 'X',
  summary: 'Short summary.',
  category: 'languages',
  tags: ['Language'],
  level: 'beginner',
  status: 'live',
  order: 1,
};

describe('topicYamlSchema', () => {
  it('accepts a minimal valid topic', () => {
    expect(() => topicYamlSchema.parse(goodTopic)).not.toThrow();
  });

  it('rejects a missing summary', () => {
    expect(() => topicYamlSchema.parse({ ...goodTopic, summary: undefined })).toThrow();
  });

  it('rejects a summary over 160 chars', () => {
    expect(() => topicYamlSchema.parse({ ...goodTopic, summary: 's'.repeat(161) })).toThrow();
  });

  it('rejects an unknown level', () => {
    expect(() => topicYamlSchema.parse({ ...goodTopic, level: 'expert' })).toThrow();
  });
});

describe('catalogItemSchema', () => {
  it('rejects an unknown collection', () => {
    expect(() =>
      catalogItemSchema.parse({
        id: 'x',
        collection: 'videos',
        title: 'X',
        summary: 'S',
        categories: [],
        primaryCategory: null,
        tags: [],
        status: 'live',
        href: '/x',
        keywords: [],
      }),
    ).toThrow();
  });
});
