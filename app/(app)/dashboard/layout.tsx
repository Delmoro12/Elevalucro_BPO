// Layout autenticado com navbar e sidebar
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar será importado de components/layout */}
      <aside className="w-64 border-r">
        {/* <Sidebar /> */}
      </aside>
      <div className="flex-1 flex flex-col">
        {/* Navbar será importado de components/layout */}
        <header className="h-16 border-b">
          {/* <Navbar /> */}
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}