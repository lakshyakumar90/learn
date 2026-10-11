import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { load as loadYaml } from 'js-yaml';
import { DemoYaml, type DemoData } from '@/lib/demo';

const ROOT = process.cwd();

/** Read and validate a project's demo.yaml. Throws on any error. */
export function loadDemo(project: string): DemoData {
  const file = join(ROOT, 'content', 'projects', project, 'demo.yaml');
  const parsed = DemoYaml.parse(loadYaml(readFileSync(file, 'utf8')));
  for (const w of parsed.walkthroughs) {
    const section = parsed.sections.find((s) => s.id === w.section);
    if (!section) throw new Error(`demo/${project}: walkthrough "${w.id}" points at unknown section "${w.section}"`);
    if (!section.items[w.index]) {
      throw new Error(`demo/${project}: walkthrough "${w.id}" points at missing item ${w.index}`);
    }
  }
  return parsed;
}
