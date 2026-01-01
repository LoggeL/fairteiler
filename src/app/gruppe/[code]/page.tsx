'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExpenseDialog } from '@/components/ExpenseDialog'
import { PaymentDialog } from '@/components/PaymentDialog'
import { GroupSettings } from '@/components/GroupSettings'
import { ModeToggle } from '@/components/mode-toggle'
import { berechneSalden, berechneAusgleichszahlungen } from '@/lib/balance-calc'
import { exportToCSV } from '@/lib/export'
import { Receipt, Users, Calculator, Share2, Loader2, ArrowRight, Download, Settings, ArrowLeftRight, PieChart, TrendingUp, FileText, Table } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export default function GruppeDetail() {
  const { code } = useParams()
  const [gruppe, setGruppe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [salden, setSalden] = useState<Map<string, number>>(new Map())
  const [ausgleich, setAusgleich] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])

  const fetchGruppe = useCallback(async () => {
    try {
      const response = await fetch(`/api/gruppen/code/${code}`)
      if (!response.ok) throw new Error('Gruppe nicht gefunden')
      const data = await response.json()
      setGruppe(data)
      
      const s = berechneSalden(data.mitglieder, data.ausgaben, data.zahlungen)
      setSalden(s)
      setAusgleich(berechneAusgleichszahlungen(s))

      // Combine and sort transactions
      const combined = [
        ...data.ausgaben.map((a: any) => ({ ...a, type: 'expense' })),
        ...data.zahlungen.map((z: any) => ({ ...z, type: 'payment' }))
      ].sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime())
      
      setTransactions(combined)

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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!gruppe) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-white">
        <h1 className="text-2xl font-bold text-slate-900">Gruppe nicht gefunden</h1>
        <p className="text-slate-500 mt-2">Der Link scheint ungültig zu sein.</p>
        <Button className="mt-4" onClick={() => window.location.href = '/'}>Zur Startseite</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-white/80 backdrop-blur-md px-4 md:px-6">
        <div className="flex flex-1 items-center gap-3">
          <h1 className="text-base font-semibold text-slate-900 truncate max-w-[200px]">{gruppe.name}</h1>
          <Badge variant="secondary" className="text-[10px] h-5 bg-emerald-50 text-emerald-700 border-emerald-100 uppercase">
            {gruppe.waehrung}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <ModeToggle />
          <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500" onClick={copyInviteLink}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500">
                <Settings className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-6">
              <SheetHeader className="mb-6">
                <SheetTitle>Einstellungen</SheetTitle>
                <SheetDescription>Verwalte deine Gruppe hier.</SheetDescription>
              </SheetHeader>
              <GroupSettings gruppe={gruppe} onSuccess={fetchGruppe} />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto p-4 md:p-6">
        <Tabs defaultValue="ausgaben" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="ausgaben" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Receipt className="h-4 w-4" /> <span className="hidden sm:inline">Ausgaben</span>
            </TabsTrigger>
            <TabsTrigger value="salden" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Users className="h-4 w-4" /> <span className="hidden sm:inline">Übersicht</span>
            </TabsTrigger>
            <TabsTrigger value="abrechnung" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Calculator className="h-4 w-4" /> <span className="hidden sm:inline">Abrechnung</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ausgaben" className="space-y-3">
            <div className="flex justify-between items-center mb-1 px-1">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Verlauf</h2>
              <ExpenseDialog 
                gruppeId={gruppe.id} 
                mitglieder={gruppe.mitglieder} 
                waehrung={gruppe.waehrung} 
                onSuccess={fetchGruppe} 
              />
            </div>
            
            {transactions.length === 0 ? (
              <Card className="border-dashed border-slate-200 bg-transparent shadow-none">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Receipt className="h-12 w-12 text-slate-200 mb-3" />
                  <p className="text-slate-400 font-medium">Noch keine Ausgaben.</p>
                </CardContent>
              </Card>
            ) : (
              transactions.map((item: any) => {
                if (item.type === 'expense') {
                  return (
                    <ExpenseDialog 
                      key={item.id}
                      gruppeId={gruppe.id}
                      mitglieder={gruppe.mitglieder}
                      waehrung={gruppe.waehrung}
                      onSuccess={fetchGruppe}
                      expense={item}
                      trigger={
                        <Card className="overflow-hidden cursor-pointer hover:ring-1 hover:ring-emerald-500/30 transition-all border-slate-200/60 shadow-sm group">
                        <CardContent className="p-2.5 flex items-center justify-between">
                          <div className="flex flex-col text-left">
                            <h3 className="font-semibold text-slate-800 text-[13px] leading-tight group-hover:text-emerald-700 transition-colors">{item.titel}</h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {item.zahler.name} • {new Date(item.datum).toLocaleDateString('de-DE')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900 text-[13px]">{Number(item.betrag).toLocaleString('de-DE', { style: 'currency', currency: gruppe.waehrung })}</p>
                          </div>
                        </CardContent>
                        </Card>
                      }
                    />
                  )
                } else {
                  // Payment
                  return (
                    <PaymentDialog 
                      key={item.id}
                      gruppeId={gruppe.id}
                      mitglieder={gruppe.mitglieder}
                      waehrung={gruppe.waehrung}
                      onSuccess={fetchGruppe}
                      payment={item}
                      trigger={
                        <Card className="bg-slate-50/50 cursor-pointer overflow-hidden hover:ring-1 hover:ring-emerald-500/30 transition-all border-slate-200/60 shadow-none group">
                          <CardContent className="p-2.5 flex items-center justify-between opacity-90">
                            <div className="flex items-center gap-3">
                              <div className="bg-emerald-100 p-1.5 rounded-full group-hover:bg-emerald-200 transition-colors">
                                <ArrowLeftRight className="h-3 w-3 text-emerald-600" />
                              </div>
                              <div className="text-left">
                                <div className="font-semibold text-slate-700 text-[11px]">
                                  <span>{item.vonMitglied.name}</span>
                                  <span className="text-slate-400 mx-1.5">→</span>
                                  <span>{item.anMitglied.name}</span>
                                </div>
                                <p className="text-[9px] text-slate-400 leading-none mt-0.5">
                                  {new Date(item.datum).toLocaleDateString('de-DE')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-emerald-600 text-[13px]">
                                {Number(item.betrag).toLocaleString('de-DE', { style: 'currency', currency: gruppe.waehrung })}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      }
                    />
                  )
                }
              })
            )}
          </TabsContent>

          <TabsContent value="salden" className="space-y-6">
            {(() => {
              const totalExpenses = gruppe.ausgaben.reduce((sum: number, a: any) => sum + Number(a.betrag), 0)
              const averagePerPerson = gruppe.mitglieder.length > 0 ? totalExpenses / gruppe.mitglieder.length : 0
              
              const spendingByMember = new Map<string, number>()
              gruppe.mitglieder.forEach((m: any) => spendingByMember.set(m.id, 0))
              gruppe.ausgaben.forEach((a: any) => {
                const current = spendingByMember.get(a.zahlerId) || 0
                spendingByMember.set(a.zahlerId, current + Number(a.betrag))
              })

              let topSpenderId = ""
              let maxSpent = -1
              spendingByMember.forEach((amount, id) => {
                if(amount > maxSpent) {
                  maxSpent = amount
                  topSpenderId = id
                }
              })
              const topSpender = gruppe.mitglieder.find((m: any) => m.id === topSpenderId)
              const mostExpensive = [...gruppe.ausgaben].sort((a: any, b: any) => Number(b.betrag) - Number(a.betrag))[0]

              const formatMoney = (amount: number) => 
                amount.toLocaleString('de-DE', { style: 'currency', currency: gruppe.waehrung })

              return (
                <>
                  <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                    <Card className="border-none bg-white shadow-sm ring-1 ring-slate-200/60">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gesamt</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-3 px-3">
                        <div className="text-lg font-bold text-slate-900">{formatMoney(totalExpenses)}</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-none bg-white shadow-sm ring-1 ring-slate-200/60">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Schnitt</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-3 px-3">
                        <div className="text-lg font-bold text-slate-900">{formatMoney(averagePerPerson)}</div>
                      </CardContent>
                    </Card>

                    <Card className="border-none bg-white shadow-sm ring-1 ring-slate-200/60 hidden sm:block">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Top Zahler</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-3 px-3">
                        <div className="text-lg font-bold text-slate-900 truncate">{topSpender?.name || "-"}</div>
                      </CardContent>
                    </Card>

                    <Card className="border-none bg-white shadow-sm ring-1 ring-slate-200/60 hidden sm:block">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Max Ausgabe</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-3 px-3">
                        <div className="text-lg font-bold text-slate-900">{mostExpensive ? formatMoney(Number(mostExpensive.betrag)) : "-"}</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Kontostand</h2>
                      {gruppe.mitglieder.map((mitglied: any) => {
                        const saldo = salden.get(mitglied.id) || 0
                        const isPositive = saldo > 0
                        const isZero = Math.abs(saldo) < 0.01

                        return (
                          <Card key={mitglied.id} className="border-none bg-white shadow-sm ring-1 ring-slate-200/60">
                            <CardContent className="p-3 flex items-center justify-between">
                              <span className="font-semibold text-slate-700 text-sm">{mitglied.name}</span>
                              <div className={`text-right font-bold text-sm ${isZero ? 'text-slate-400' : isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                                {isPositive ? '+' : ''}
                                {saldo.toLocaleString('de-DE', { style: 'currency', currency: gruppe.waehrung })}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Verteilung</h2>
                      {gruppe.mitglieder.map((mitglied: any) => {
                        const spent = spendingByMember.get(mitglied.id) || 0
                        const percentage = totalExpenses > 0 ? (spent / totalExpenses) * 100 : 0
                        
                        return (
                          <Card key={mitglied.id} className="border-none bg-white shadow-sm ring-1 ring-slate-200/60">
                            <CardContent className="p-3 space-y-2">
                              <div className="flex justify-between text-xs font-semibold text-slate-600">
                                <span>{mitglied.name}</span>
                                <span>{formatMoney(spent)}</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${percentage}%` }} />
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                </>
              )
            })()}
          </TabsContent>

          <TabsContent value="abrechnung" className="space-y-4">
            <div className="flex justify-between items-center mb-1 px-1">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Vorschläge</h2>
              <PaymentDialog 
                gruppeId={gruppe.id} 
                mitglieder={gruppe.mitglieder} 
                waehrung={gruppe.waehrung} 
                onSuccess={fetchGruppe} 
              />
            </div>
            {ausgleich.length === 0 ? (
              <Card className="border-none bg-emerald-50/50 shadow-none ring-1 ring-emerald-100">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                  <Calculator className="h-10 w-10 text-emerald-200 mb-2" />
                  <p className="text-emerald-700 font-medium text-sm">Alles ausgeglichen!</p>
                </CardContent>
              </Card>
            ) : (
              ausgleich.map((z, i) => {
                const von = gruppe.mitglieder.find((m: any) => m.id === z.vonMitgliedId)
                const an = gruppe.mitglieder.find((m: any) => m.id === z.anMitgliedId)
                return (
                  <Card key={i} className="border-none bg-white shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-700 text-sm">{von?.name}</span>
                        <ArrowRight className="h-3 w-3 text-slate-300" />
                        <span className="font-semibold text-slate-700 text-sm">{an?.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="font-bold text-emerald-600 text-sm">
                          {z.betrag.toLocaleString('de-DE', { style: 'currency', currency: gruppe.waehrung })}
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-xs h-8 px-2 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-bold"
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
            
            <Separator className="my-6 bg-slate-100" />
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full gap-2 border-slate-200 text-slate-600 font-semibold" 
                onClick={() => window.open(`/gruppe/${code}/print`, '_blank')}
              >
                <FileText className="h-3.5 w-3.5" /> PDF / Druck
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full gap-2 border-slate-200 text-slate-600 font-semibold" 
                onClick={() => exportToCSV(gruppe)}
              >
                <Table className="h-3.5 w-3.5" /> CSV Export
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="einstellungen" className="space-y-4 hidden">
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
