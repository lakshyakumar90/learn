import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { StaticSearchDialog } from '@/components/StaticSearchDialog';
import { siteConfig } from '@/site.config';
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <RootProvider
          search={{
            SearchDialog: StaticSearchDialog,
            links: [
              ['Excalidraw project', '/projects/excalidraw'],
              ['End-to-end flow', '/projects/excalidraw/end-to-end'],
              ['High-level architecture', '/projects/excalidraw/high-level'],
            ],
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
