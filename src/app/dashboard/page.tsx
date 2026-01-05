import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ModeToggle } from '@/components/mode-toggle'
import { UserMenu } from '@/components/UserMenu'
import { Plus, Users, ArrowRight } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  const [createdGroups, claimedMembers] = await Promise.all([
    prisma.gruppe.findMany({
      where: { erstellerId: session.user.id },
      include: {
        mitglieder: true,
        _count: { select: { ausgaben: true } }
      },
      orderBy: { erstelltAm: 'desc' }
    }),
    prisma.mitglied.findMany({
      where: { userId: session.user.id },
      include: {
        gruppe: {
          include: {
            mitglieder: true,
            _count: { select: { ausgaben: true } }
          }
        }
      }
    })
  ])

  const claimedGroups = claimedMembers
    .map(m => ({ ...m.gruppe, claimedAs: m.name }))
    .filter(g => !createdGroups.some(cg => cg.id === g.id))

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-background/80 backdrop-blur-md px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary">
          <span className="text-xl tracking-tighter">Fairteiler</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </header>

      <main className="container max-w-2xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black text-foreground">Meine Gruppen</h1>
          <Link href="/gruppe/neu">
            <Button className="gap-2 bg-primary hover:bg-primary/90 font-bold rounded-2xl">
              <Plus className="h-4 w-4" />
              Neue Gruppe
            </Button>
          </Link>
        </div>

        {createdGroups.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 px-1">
              Von mir erstellt
            </h2>
            <div className="grid gap-3">
              {createdGroups.map(gruppe => (
                <Link key={gruppe.id} href={`/gruppe/${gruppe.einladecode}`}>
                  <Card className="border-none bg-card shadow-md hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer group active:scale-[0.98]">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex flex-col">
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{gruppe.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px] h-5 bg-primary/10 text-primary border-primary/20">
                            {gruppe.waehrung}
                          </Badge>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">
                            {gruppe.mitglieder.length} Mitglieder
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">
                            • {gruppe._count.ausgaben} Ausgaben
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {claimedGroups.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 px-1">
              Beigetreten
            </h2>
            <div className="grid gap-3">
              {claimedGroups.map(gruppe => (
                <Link key={gruppe.id} href={`/gruppe/${gruppe.einladecode}`}>
                  <Card className="border-none bg-muted/30 shadow-sm hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer group active:scale-[0.98]">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex flex-col">
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{gruppe.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px] h-5 bg-primary/10 text-primary border-primary/20">
                            {gruppe.waehrung}
                          </Badge>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">
                            als &quot;{gruppe.claimedAs}&quot;
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {createdGroups.length === 0 && claimedGroups.length === 0 && (
          <Card className="border-dashed bg-transparent shadow-none border-muted">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-16 w-16 text-muted/30 mb-4" />
              <p className="text-muted-foreground font-bold mb-4">Noch keine Gruppen.</p>
              <Link href="/gruppe/neu">
                <Button className="gap-2 bg-primary hover:bg-primary/90 font-bold rounded-2xl">
                  <Plus className="h-4 w-4" />
                  Erste Gruppe erstellen
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
