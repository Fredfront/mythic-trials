import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ThemeProvider } from './components/theme-provider'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Nerdelandslaget - Mythic Trials',
  description: 'Nerdelandslaget - Mythic Trials ',

  icons: {
    icon: 'Logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={cn(`min-h-screen bg-[#011624] antialiased font-DMSans`)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children} <Analytics /> <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  )
}
