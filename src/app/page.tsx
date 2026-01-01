import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Receipt, PieChart, ShieldCheck } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-zinc-950">
      <header className="flex h-16 items-center border-b bg-white px-4 dark:bg-zinc-900 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
          <span className="text-2xl">Fairteiler</span>
        </Link>
      </header>
      
      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  Teile Ausgaben fair auf.
                </h1>
                <p className="mx-auto max-w-[700px] text-zinc-500 md:text-xl dark:text-zinc-400">
                  Schluss mit dem Chaos bei gemeinsamen Ausgaben. Ob WG, Urlaub oder Event – Fairteiler hilft dir, den Überblick zu behalten.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/gruppe/neu">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Neue Gruppe starten
                  </Button>
                </Link>
                <Link href="#funktionen">
                  <Button size="lg" variant="outline">
                    Mehr erfahren
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="funktionen" className="bg-white py-12 dark:bg-zinc-900 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Alles, was du brauchst.
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-emerald-100 bg-emerald-50/30 dark:border-emerald-900/50 dark:bg-emerald-900/10">
                <CardHeader>
                  <Users className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                  <CardTitle className="mt-4">Gruppen</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-600 dark:text-zinc-400">
                    Erstelle Gruppen für verschiedene Anlässe und lade Freunde ein.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="border-emerald-100 bg-emerald-50/30 dark:border-emerald-900/50 dark:bg-emerald-900/10">
                <CardHeader>
                  <Receipt className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                  <CardTitle className="mt-4">Ausgaben</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-600 dark:text-zinc-400">
                    Erfasse schnell, wer was bezahlt hat. Auch in verschiedenen Währungen.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="border-emerald-100 bg-emerald-50/30 dark:border-emerald-900/50 dark:bg-emerald-900/10">
                <CardHeader>
                  <PieChart className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                  <CardTitle className="mt-4">Aufteilung</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-600 dark:text-zinc-400">
                    Teile Kosten gleichmäßig oder individuell auf. Fair und transparent.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="border-emerald-100 bg-emerald-50/30 dark:border-emerald-900/50 dark:bg-emerald-900/10">
                <CardHeader>
                  <ShieldCheck className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                  <CardTitle className="mt-4">Kein Login</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-600 dark:text-zinc-400">
                    Sofort loslegen ohne Account. Einfach Link teilen und gemeinsam abrechnen.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white py-6 dark:bg-zinc-900">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6 mx-auto">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            © 2026 Fairteiler. Made with ❤️ in Germany.
          </p>
          <div className="flex gap-4 text-sm font-medium">
            <Link href="/impressum" className="hover:underline underline-offset-4">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:underline underline-offset-4">
              Datenschutz
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
