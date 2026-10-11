import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Callout } from 'fumadocs-ui/components/callout';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import type { MDXComponents } from 'mdx/types';
import { DependencyTable } from '@/components/DependencyTable';
import { Diagram } from '@/components/Diagram';
import { FlowPlayer } from '@/components/FlowPlayer';
import { StackMap } from '@/components/StackMap';
import { StackMatrix } from '@/components/StackMatrix';
import { TechStackIndex } from '@/components/TechStackIndex';
import { DemoGallery, DemoHero, DemoMedia } from '@/components/demo/DemoGallery';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    DependencyTable,
    Diagram,
    FlowPlayer,
    StackMap,
    StackMatrix,
    TechStackIndex,
    DemoGallery,
    DemoHero,
    DemoMedia,
    Callout,
    Step,
    Steps,
    Tab,
    Tabs,
    ...components,
  };
}
