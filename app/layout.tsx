import type { Metadata } from 'next';
import './globals.css';
import { SidebarWrapper } from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'StockSense Pro — Inventory Dashboard',
  description: 'Professional inventory management dashboard with Excel import, live search, and analytics.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%23fb6f18'/><text y='22' x='7' font-size='18' fill='white'>📦</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-surface-950 text-surface-100 antialiased">
        <SidebarWrapper>
          {children}
        </SidebarWrapper>
      </body>
    </html>
  );
}
