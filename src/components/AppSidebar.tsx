'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useRecentGroups } from '@/hooks/use-recent-groups'
import { Button } from '@/components/ui/button'
import { Plus, Users, LayoutDashboard, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SidebarContent() {
  const params = useParams()
  const currentCode = params.code as string
  const { groups } = useRecentGroups()

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-6 border-b">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary">
          <span className="text-xl tracking-tighter">Fairteiler</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        <div className="space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Aktionen</h2>
          <Link href="/gruppe/neu">
            <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl font-bold text-sm h-11 hover:bg-primary/10 hover:text-primary transition-all">
              <Plus className="h-4 w-4" />
              Neue Gruppe
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Deine Gruppen</h2>
          <div className="space-y-1">
            {groups.length === 0 ? (
              <p className="px-3 py-4 text-xs text-muted-foreground italic bg-muted/30 rounded-2xl border border-dashed border-border">
                Noch keine Gruppen gespeichert.
              </p>
            ) : (
              groups.map((group) => (
                <Link key={group.id} href={`/gruppe/${group.code}`}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between gap-3 rounded-xl font-bold text-sm h-11 transition-all px-3",
                      currentCode === group.code 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary hover:text-primary-foreground" 
                        : "hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Users className={cn("h-4 w-4 shrink-0", currentCode === group.code ? "text-primary-foreground" : "text-primary")} />
                      <span className="truncate">{group.name}</span>
                    </div>
                    {currentCode === group.code && <ChevronRight className="h-3 w-3" />}
                  </Button>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t">
        <p className="text-[10px] font-bold text-center text-muted-foreground/50 uppercase tracking-widest">
          © 2026 Fairteiler
        </p>
      </div>
    </div>
  )
}

export function AppSidebar() {
  return (
    <div className="w-64 border-r bg-card h-screen sticky top-0 hidden md:block">
      <SidebarContent />
    </div>
  )
}
