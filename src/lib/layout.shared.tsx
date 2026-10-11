import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { siteConfig } from '@/site.config';

/**
 * Shared docs layout options. Pass the current project's repository URL
 * so the sidebar GitHub icon links that project; otherwise it falls back
 * to the personal profile URL.
 */
export function baseOptions(projectRepoUrl?: string): BaseLayoutProps {
  return {
    nav: {
      title: siteConfig.siteName,
      url: '/',
      transparentMode: 'top',
    },
    githubUrl: projectRepoUrl || siteConfig.githubUrl,
  };
}
