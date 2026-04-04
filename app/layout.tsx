import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Video CRM',
  description: 'Customer Relationship Management for Video Production Companies',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
