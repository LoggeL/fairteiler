import Link from 'next/link'
import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { Users, Receipt, PieChart, ShieldCheck } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 items-center border-b bg-card px-4 md:px-6 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary">
          <span className="text-xl tracking-tight">Fairteiler</span>
        </Link>
        <div className="ml-auto">
          <ModeToggle />
        </div>
      </header>
      
      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-8 text-center">
              <div className="space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground">
                  Ausgaben teilen, <br className="hidden sm:inline" /><span className="text-primary">einfach & fair.</span>
                </h1>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-lg">
                  Die minimalistische App für WG, Urlaub oder Events. Behalte den Überblick ohne nervigen Login.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/gruppe/neu">
                  <Button size="lg" className="px-8 h-12 rounded-full shadow-lg text-base">
                    Jetzt Gruppe erstellen
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="funktionen" className="py-16 bg-card border-y">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-accent p-3 rounded-2xl">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground">Gruppen</h3>
                <p className="text-sm text-muted-foreground">Erstelle Gruppen für jeden Anlass und lade Freunde ein.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-accent p-3 rounded-2xl">
                  <Receipt className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground">Ausgaben</h3>
                <p className="text-sm text-muted-foreground">Erfasse schnell, wer was bezahlt hat. Auch in Fremdwährungen.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-accent p-3 rounded-2xl">
                  <PieChart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground">Aufteilung</h3>
                <p className="text-sm text-muted-foreground">Teile Kosten gleichmäßig oder nach Anteilen auf.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-accent p-3 rounded-2xl">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground">Kein Login</h3>
                <p className="text-sm text-muted-foreground">Sofort loslegen. Einfach Link teilen und gemeinsam abrechnen.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-muted py-12 border-t">
        <div className="container flex flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-6 mx-auto">
          <p className="text-sm text-muted-foreground">
            © 2026 Fairteiler.
          </p>
          <div className="flex gap-8 text-sm font-semibold text-muted-foreground">
            <Link href="/impressum" className="hover:text-primary transition-colors">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:text-primary transition-colors">
              Datenschutz
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
