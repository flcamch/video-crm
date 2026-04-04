import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { verifyJWT } from '@/lib/auth'

async function LogoutButton() {
  async function handleLogout() {
    'use server'
    const cookieStore = await cookies()
    cookieStore.delete('crm_token')
    redirect('/login')
  }

  return (
    <form action={handleLogout} className="mt-auto pt-4">
      <button
        type="submit"
        className="btn-secondary w-full text-center"
      >
        Abmelden
      </button>
    </form>
  )
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('crm_token')?.value

  if (!token) {
    redirect('/login')
  }

  const payload = await verifyJWT(token)
  if (!payload) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg">
              <span className="text-white font-bold">V</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Video CRM</h1>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/dashboard"
            className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span className="text-lg mr-2">📊</span>
            Dashboard
          </Link>
          <Link
            href="/dashboard/contacts"
            className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span className="text-lg mr-2">👥</span>
            Kontakte
          </Link>
          <Link
            href="/dashboard/pipeline"
            className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span className="text-lg mr-2">📈</span>
            Pipeline
          </Link>
          <Link
            href="/dashboard/templates"
            className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span className="text-lg mr-2">📝</span>
            Vorlagen
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
            <p className="text-gray-600">Angemeldet als</p>
            <p className="font-medium text-gray-900">{payload.email}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
