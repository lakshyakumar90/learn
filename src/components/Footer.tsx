import { AtSign, Briefcase, GitFork, Globe, Mail, Video } from 'lucide-react';
import { siteConfig } from '@/site.config';

interface ConnectLink {
  label: string;
  href: string;
  Icon: typeof Mail;
  external: boolean;
}

/** All connect links, read only from site.config.ts. Landing page only. */
export function connectLinks(): ConnectLink[] {
  return [
    { label: 'Email', href: `mailto:${siteConfig.email}`, Icon: Mail, external: false },
    { label: 'Book a call', href: siteConfig.calUrl, Icon: Video, external: true },
    { label: 'GitHub', href: siteConfig.githubUrl, Icon: GitFork, external: true },
    { label: 'LinkedIn', href: siteConfig.linkedinUrl, Icon: Briefcase, external: true },
    { label: 'Twitter / X', href: siteConfig.twitterUrl, Icon: AtSign, external: true },
    { label: 'Portfolio', href: siteConfig.portfolioUrl, Icon: Globe, external: true },
  ];
}

function ConnectList() {
  return (
    <ul aria-label="Connect" className="flex flex-col gap-2">
      {connectLinks().map(({ label, href, Icon, external }) => (
        <li key={label}>
          <a
            href={href}
            aria-label={label}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="inline-flex items-center gap-2 text-sm opacity-70 transition-opacity hover:opacity-100"
          >
            <Icon size={16} aria-hidden />
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Full footer for the landing page. */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-12 md:grid-cols-2">
        <div>
          <p className="text-lg font-semibold tracking-tight">{siteConfig.siteName}</p>
          <p className="mt-2 max-w-sm text-sm opacity-70">{siteConfig.description}</p>
        </div>
        <nav aria-label="Connect" className="md:justify-self-end">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider opacity-50">Connect</p>
          <ConnectList />
        </nav>
      </div>
      <div className="border-t">
        <p className="mx-auto w-full max-w-6xl px-6 py-5 text-sm opacity-60">
          © {year} {siteConfig.siteName}
        </p>
      </div>
    </footer>
  );
}
