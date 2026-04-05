'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  Settings,
  FileText,
  TrendingUp,
} from 'lucide-react'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const commands = [
  { name: 'Analytics', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Tutors', href: '/dashboard/tutors', icon: GraduationCap },
  { name: 'Courses', href: '/dashboard/courses', icon: BookOpen },
  { name: 'Past Questions', href: '/dashboard/past-questions', icon: FileText },
  { name: 'Withdrawals', href: '/dashboard/withdrawals', icon: DollarSign },
  { name: 'Transactions', href: '/dashboard/transactions', icon: TrendingUp },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  const filteredCommands = commands.filter((command) =>
    command.name.toLowerCase().includes(search.toLowerCase())
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={() => onOpenChange(false)}>
      <div
        className="fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-0 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          className="w-full border-b bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
          placeholder="Type a command or search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        <div className="max-h-[300px] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </div>
          ) : (
            filteredCommands.map((command) => (
              <button
                key={command.href}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
                onClick={() => {
                  router.push(command.href)
                  onOpenChange(false)
                  setSearch('')
                }}
              >
                <command.icon className="h-4 w-4" />
                <span>{command.name}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
