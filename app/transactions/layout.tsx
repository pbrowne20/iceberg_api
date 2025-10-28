export default function QueryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {children}
    </div>
  )
}
