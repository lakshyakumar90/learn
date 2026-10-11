import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { StaticSearchDialog } from '@/components/StaticSearchDialog';
import { siteConfig } from '@/site.config';
import { PROJECTS } from '@/projects.config';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.siteName} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.siteName}`,
  },
  description: siteConfig.tagline,
};

const searchLinks: Array<[string, string]> = PROJECTS.filter((p) => p.status === 'live').flatMap((p) => [
  [`${p.title} project`, `/projects/${p.id}`],
]);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col"
        suppressHydrationWarning
      >
        <RootProvider
          search={{
            SearchDialog: StaticSearchDialog,
            links: searchLinks,
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
