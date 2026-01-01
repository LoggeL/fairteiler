'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AddExpenseDialog } from '@/components/AddExpenseDialog'
import { berechneSalden, berechneAusgleichszahlungen } from '@/lib/balance-calc'
import { exportToPDF } from '@/lib/export'
import { Receipt, Users, Calculator, Share2, Loader2, ArrowRight, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function GruppeDetail() {
  const { code } = useParams()
  const [gruppe, setGruppe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [salden, setSalden] = useState<Map<string, number>>(new Map())
  const [ausgleich, setAusgleich] = useState<any[]>([])

  const fetchGruppe = useCallback(async () => {
    try {
      const response = await fetch(`/api/gruppen/${code}`)
      if (!response.ok) throw new Error('Gruppe nicht gefunden')
      const data = await response.json()
      setGruppe(data)
      
      const s = berechneSalden(data.mitglieder, data.ausgaben, data.zahlungen)
      setSalden(s)
      setAusgleich(berechneAusgleichszahlungen(s))
    } catch (error) {
      console.error(error)
      toast.error('Fehler beim Laden der Gruppe')
    } finally {
      setLoading(false)
    }
  }, [code])

  useEffect(() => {
    fetchGruppe()
  }, [fetchGruppe])

  const copyInviteLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast.success('Link kopiert!')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!gruppe) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold">Gruppe nicht gefunden</h1>
        <p className="text-zinc-500 mt-2">Der Link scheint ungültig zu sein.</p>
        <Button className="mt-4" onClick={() => window.location.href = '/'}>Zur Startseite</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20">
      <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-white px-4 dark:bg-zinc-900 md:px-6">
        <div className="flex flex-1 items-center gap-4">
          <h1 className="text-lg font-bold">{gruppe.name}</h1>
          <Badge variant="outline" className="text-emerald-600 border-emerald-200">
            {gruppe.waehrung}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" onClick={copyInviteLink}>
          <Share2 className="h-5 w-5" />
        </Button>
      </header>

      <main className="container max-w-2xl mx-auto p-4 md:p-6">
        <Tabs defaultValue="ausgaben" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="ausgaben" className="gap-2">
              <Receipt className="h-4 w-4" /> Ausgaben
            </TabsTrigger>
            <TabsTrigger value="salden" className="gap-2">
              <Users className="h-4 w-4" /> Salden
            </TabsTrigger>
            <TabsTrigger value="abrechnung" className="gap-2">
              <Calculator className="h-4 w-4" /> Abrechnung
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ausgaben" className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Letzte Ausgaben</h2>
              <AddExpenseDialog 
                gruppeId={gruppe.id} 
                mitglieder={gruppe.mitglieder} 
                waehrung={gruppe.waehrung} 
                onSuccess={fetchGruppe} 
              />
            </div>
            {gruppe.ausgaben.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                  <Receipt className="h-10 w-10 text-zinc-300 mb-2" />
                  <p className="text-zinc-500">Noch keine Ausgaben erfasst.</p>
                </CardContent>
              </Card>
            ) : (
              gruppe.ausgaben.map((ausgabe: any) => (
                <Card key={ausgabe.id} className="overflow-hidden">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{ausgabe.titel}</h3>
                      <p className="text-xs text-zinc-500">
                        Bezahlt von {ausgabe.zahler.name} • {new Date(ausgabe.datum).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{Number(ausgabe.betrag).toLocaleString('de-DE', { style: 'currency', currency: gruppe.waehrung })}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="salden" className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-2">Aktuelle Bilanz</h2>
            {gruppe.mitglieder.map((mitglied: any) => {
              const saldo = salden.get(mitglied.id) || 0
              const isPositive = saldo > 0
              const isZero = Math.abs(saldo) < 0.01

              return (
                <Card key={mitglied.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className="font-medium">{mitglied.name}</span>
                    <div className={`text-right font-bold ${isZero ? 'text-zinc-400' : isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                      {isPositive ? '+' : ''}
                      {saldo.toLocaleString('de-DE', { style: 'currency', currency: gruppe.waehrung })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="abrechnung" className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-2">Vorgeschlagene Zahlungen</h2>
            {ausgleich.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                  <Calculator className="h-10 w-10 text-zinc-300 mb-2" />
                  <p className="text-zinc-500">Alles ausgeglichen! Keine Zahlungen nötig.</p>
                </CardContent>
              </Card>
            ) : (
              ausgleich.map((z, i) => {
                const von = gruppe.mitglieder.find((m: any) => m.id === z.vonMitgliedId)
                const an = gruppe.mitglieder.find((m: any) => m.id === z.anMitgliedId)
                return (
                  <Card key={i}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{von?.name}</span>
                        <ArrowRight className="h-4 w-4 text-zinc-400" />
                        <span className="font-medium">{an?.name}</span>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="font-bold text-emerald-600">
                          {z.betrag.toLocaleString('de-DE', { style: 'currency', currency: gruppe.waehrung })}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs h-7"
                          onClick={async () => {
                            try {
                              const res = await fetch('/api/zahlungen', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  gruppeId: gruppe.id,
                                  vonMitgliedId: z.vonMitgliedId,
                                  anMitgliedId: z.anMitgliedId,
                                  betrag: z.betrag
                                })
                              })
                              if (!res.ok) throw new Error()
                              toast.success('Zahlung erfasst')
                              fetchGruppe()
                            } catch (e) {
                              toast.error('Fehler beim Erfassen')
                            }
                          }}
                        >
                          Begleichen
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
            
            <Separator className="my-6" />
            
            <Card className="bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30">
              <CardHeader>
                <CardTitle className="text-sm">Zusammenfassung teilen</CardTitle>
                <CardDescription>Sende eine Übersicht an die Gruppe.</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => exportToPDF(gruppe, salden, ausgleich)}>
                  <Download className="h-4 w-4" /> PDF Export
                </Button>
                <Button variant="outline" className="flex-1" disabled>Excel Export (Demnächst)</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
