import Link from 'next/link'
import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { Users, Receipt, PieChart, ShieldCheck } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 items-center border-b bg-background/80 backdrop-blur-md px-4 md:px-6 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary">
          <span className="text-xl tracking-tighter">Fairteiler</span>
        </Link>
        <div className="ml-auto">
          <ModeToggle />
        </div>
      </header>
      
      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-12 text-center">
              <div className="space-y-6">
                <h1 className="text-5xl font-black tracking-tight sm:text-7xl text-foreground">
                  Ausgaben teilen, <br className="hidden sm:inline" /><span className="text-primary italic">einfach & fair.</span>
                </h1>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl font-medium">
                  Die minimalistische App für WG, Urlaub oder Events. Behalte den Überblick ohne nervigen Login.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link href="/gruppe/neu">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 h-14 rounded-3xl shadow-2xl shadow-primary/20 text-lg font-bold transition-all hover:scale-105 active:scale-95">
                    Gruppe erstellen
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="funktionen" className="py-24 bg-card border-y border-border">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-16 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-primary/10 p-4 rounded-3xl">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-black text-foreground uppercase tracking-widest text-xs">Gruppen</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">Erstelle Gruppen für jeden Anlass und lade Freunde ein.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-primary/10 p-4 rounded-3xl">
                  <Receipt className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-black text-foreground uppercase tracking-widest text-xs">Ausgaben</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">Erfasse schnell, wer was bezahlt hat. Auch in Fremdwährungen.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-primary/10 p-4 rounded-3xl">
                  <PieChart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-black text-foreground uppercase tracking-widest text-xs">Aufteilung</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">Teile Kosten gleichmäßig oder nach Anteilen auf.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-primary/10 p-4 rounded-3xl">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-black text-foreground uppercase tracking-widest text-xs">Kein Login</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">Sofort loslegen. Einfach Link teilen und gemeinsam abrechnen.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background py-16">
        <div className="container flex flex-col items-center justify-between gap-8 px-4 md:flex-row md:px-6 mx-auto">
          <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">
            © 2026 Fairteiler.
          </p>
          <div className="flex gap-10 text-xs font-black uppercase tracking-widest text-muted-foreground">
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
