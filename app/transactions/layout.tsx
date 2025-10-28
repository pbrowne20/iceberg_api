import { Analytics } from '@vercel/analytics/react'

export default function QueryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 p-6">
        {children}
        <Analytics /> {/* ✅ Enables Vercel Web Analytics */}
      </body>
    </html>
  )
}
