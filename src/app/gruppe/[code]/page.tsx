'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExpenseDialog } from '@/components/ExpenseDialog'
import { PaymentDialog } from '@/components/PaymentDialog'
import { GroupSettings } from '@/components/GroupSettings'
import { ModeToggle } from '@/components/mode-toggle'
import { useRecentGroups } from '@/hooks/use-recent-groups'
import { berechneSalden, berechneAusgleichszahlungen } from '@/lib/balance-calc'
import { exportToCSV } from '@/lib/export'
import { Receipt, Users, Calculator, Share2, Loader2, ArrowRight, Settings, ArrowLeftRight, FileText, Table } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { SidebarContent } from '@/components/AppSidebar'
import { Menu } from 'lucide-react'

export default function GruppeDetail() {
  const { code } = useParams()
  const [gruppe, setGruppe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [salden, setSalden] = useState<Map<string, number>>(new Map())
  const [ausgleich, setAusgleich] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const { addGroup } = useRecentGroups()

  const fetchGruppe = useCallback(async () => {
    try {
      const response = await fetch(`/api/gruppen/code/${code}`)
      if (!response.ok) throw new Error('Gruppe nicht gefunden')
      const data = await response.json()
      setGruppe(data)
      
      // Save to recent groups
      addGroup({ id: data.id, name: data.name, code: data.einladecode })
      
      const s = berechneSalden(data.mitglieder, data.ausgaben, data.zahlungen)
      setSalden(s)
      setAusgleich(berechneAusgleichszahlungen(s))

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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!gruppe) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-background">
        <h1 className="text-2xl font-bold text-foreground">Gruppe nicht gefunden</h1>
        <p className="text-muted-foreground mt-2">Der Link scheint ungültig zu sein.</p>
        <Button className="mt-4" onClick={() => window.location.href = '/'}>Zur Startseite</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-background/80 backdrop-blur-md px-4 md:px-6">
        <div className="flex items-center gap-2 md:hidden mr-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-none">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex flex-1 items-center gap-3">
          <h1 className="text-base font-bold text-foreground truncate max-w-[150px] sm:max-w-[200px]">{gruppe.name}</h1>
          <Badge variant="secondary" className="text-[10px] h-5 bg-primary/10 text-primary border-primary/20 uppercase">
            {gruppe.waehrung}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <ModeToggle />
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" onClick={copyInviteLink}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
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
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1 rounded-2xl ring-1 ring-border">
            <TabsTrigger value="ausgaben" className="gap-2 rounded-xl data-[state=active]:bg-card data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm transition-all duration-300">
              <Receipt className="h-4 w-4" /> <span className="hidden sm:inline">Ausgaben</span>
            </TabsTrigger>
            <TabsTrigger value="salden" className="gap-2 rounded-xl data-[state=active]:bg-card data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm transition-all duration-300">
              <Users className="h-4 w-4" /> <span className="hidden sm:inline">Übersicht</span>
            </TabsTrigger>
            <TabsTrigger value="abrechnung" className="gap-2 rounded-xl data-[state=active]:bg-card data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm transition-all duration-300">
              <Calculator className="h-4 w-4" /> <span className="hidden sm:inline">Abrechnung</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ausgaben" className="space-y-4 pt-2">
            <div className="flex justify-between items-center mb-1 px-1">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Verlauf</h2>
              <ExpenseDialog 
                gruppeId={gruppe.id} 
                mitglieder={gruppe.mitglieder} 
                waehrung={gruppe.waehrung} 
                onSuccess={fetchGruppe} 
              />
            </div>
            
            {transactions.length === 0 ? (
              <Card className="border-dashed bg-transparent shadow-none border-muted">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Receipt className="h-16 w-16 text-muted/30 mb-4" />
                  <p className="text-muted-foreground font-bold italic">Keine Transaktionen bisher.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {transactions.map((item: any) => {
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
                          <Card className="overflow-hidden cursor-pointer border-none bg-card shadow-md hover:ring-2 hover:ring-primary/20 transition-all group active:scale-[0.98]">
                            <CardContent className="p-4 flex items-center justify-between">
                              <div className="flex flex-col text-left">
                                <h3 className="font-bold text-foreground text-sm leading-tight group-hover:text-primary transition-colors">{item.titel}</h3>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-tighter">
                                  {item.zahler.name} • {new Date(item.datum).toLocaleDateString('de-DE')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-foreground text-base tracking-tight">{Number(item.betrag).toLocaleString('de-DE', { style: 'currency', currency: gruppe.waehrung })}</p>
                              </div>
                            </CardContent>
                          </Card>
                        }
                      />
                    )
                  } else {
                    return (
                      <PaymentDialog 
                        key={item.id}
                        gruppeId={gruppe.id}
                        mitglieder={gruppe.mitglieder}
                        waehrung={gruppe.waehrung}
                        onSuccess={fetchGruppe}
                        payment={item}
                        trigger={
                          <Card className="bg-muted/30 cursor-pointer overflow-hidden border-none shadow-sm hover:ring-2 hover:ring-primary/20 transition-all group active:scale-[0.98]">
                            <CardContent className="p-4 flex items-center justify-between opacity-90">
                              <div className="flex items-center gap-4">
                                <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
                                  <ArrowLeftRight className="h-4 w-4 text-primary" />
                                </div>
                                <div className="text-left">
                                  <div className="font-bold text-foreground/80 text-xs">
                                    <span>{item.vonMitglied.name}</span>
                                    <span className="text-muted-foreground mx-2">→</span>
                                    <span>{item.anMitglied.name}</span>
                                  </div>
                                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                    {new Date(item.datum).toLocaleDateString('de-DE')}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-primary text-base tracking-tight">
                                  {Number(item.betrag).toLocaleString('de-DE', { style: 'currency', currency: gruppe.waehrung })}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        }
                      />
                    )
                  }
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="salden" className="space-y-8 pt-2">
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

              const formatMoney = (amount: number) => 
                amount.toLocaleString('de-DE', { style: 'currency', currency: gruppe.waehrung })

              return (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="relative overflow-hidden rounded-3xl bg-emerald-600 p-8 text-white shadow-2xl shadow-emerald-500/20">
                    <div className="relative z-10 grid gap-8 sm:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-100/80">Gesamtausgaben</p>
                        <h3 className="text-4xl font-black tracking-tight">{formatMoney(totalExpenses)}</h3>
                      </div>
                      <div className="space-y-1 sm:text-right">
                        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-100/80">Schnitt pro Kopf</p>
                        <h3 className="text-2xl font-bold tracking-tight">{formatMoney(averagePerPerson)}</h3>
                      </div>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-emerald-500/20" />
                    <div className="absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-emerald-700/30" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Gruppenmitglieder</h2>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{gruppe.mitglieder.length} Personen</span>
                    </div>
                    
                    <div className="grid gap-3">
                      {gruppe.mitglieder.map((mitglied: any) => {
                        const saldo = salden.get(mitglied.id) || 0
                        const spent = spendingByMember.get(mitglied.id) || 0
                        const isPositive = saldo > 0
                        const isZero = Math.abs(saldo) < 0.01
                        const spentPercentage = totalExpenses > 0 ? (spent / totalExpenses) * 100 : 0

                        return (
                          <Card key={mitglied.id} className="overflow-hidden border-none bg-card shadow-md transition-all hover:scale-[1.01]">
                            <CardContent className="p-5">
                              <div className="flex items-center justify-between mb-4">
                                <div className="space-y-1">
                                  <h4 className="font-bold text-foreground text-base leading-none">{mitglied.name}</h4>
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                    Insgesamt {formatMoney(spent)} gezahlt
                                  </p>
                                </div>
                                <div className="text-right space-y-1">
                                  <div className={`text-lg font-black tracking-tight ${isZero ? 'text-muted-foreground' : isPositive ? 'text-primary' : 'text-destructive'}`}>
                                    {isPositive ? '+' : ''}{formatMoney(saldo)}
                                  </div>
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Saldo</p>
                                </div>
                              </div>
                              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/50">
                                <div 
                                  className="h-full bg-primary transition-all duration-1000 ease-out" 
                                  style={{ width: `${spentPercentage}%` }} 
                                />
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>

                  {topSpender && totalExpenses > 0 && (
                    <Card className="border-none bg-slate-100/50 dark:bg-zinc-900/50 p-6 flex items-center gap-6">
                      <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-2xl">🏆</div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-widest mb-1">Top Zahler</h4>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                          <span className="font-bold text-emerald-600">{topSpender.name}</span> hat mit <span className="font-bold">{formatMoney(spendingByMember.get(topSpenderId) || 0)}</span> am meisten in die Gruppe eingebracht.
                        </p>
                      </div>
                    </Card>
                  )}
                </div>
              )
            })()}
          </TabsContent>

          <TabsContent value="abrechnung" className="space-y-4 pt-2">
            <div className="flex justify-between items-center mb-1 px-1">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Vorschläge</h2>
              <PaymentDialog 
                gruppeId={gruppe.id} 
                mitglieder={gruppe.mitglieder} 
                waehrung={gruppe.waehrung} 
                onSuccess={fetchGruppe} 
              />
            </div>
            {ausgleich.length === 0 ? (
              <Card className="border-none bg-primary/5 shadow-none ring-1 ring-primary/10">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Calculator className="h-12 w-12 text-primary/20 mb-3" />
                  <p className="text-primary font-bold text-sm">Alles ausgeglichen!</p>
                </CardContent>
              </Card>
            ) : (
              ausgleich.map((z, i) => {
                const von = gruppe.mitglieder.find((m: any) => m.id === z.vonMitgliedId)
                const an = gruppe.mitglieder.find((m: any) => m.id === z.anMitgliedId)
                return (
                  <Card key={i} className="border-none bg-card shadow-md transition-all hover:scale-[1.01] overflow-hidden">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-foreground text-sm">{von?.name}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-bold text-foreground text-sm">{an?.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="font-black text-primary text-sm">
                          {z.betrag.toLocaleString('de-DE', { style: 'currency', currency: gruppe.waehrung })}
                        </div>
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="text-xs font-bold h-8 px-3 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
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
            
            <Separator className="my-8 opacity-50" />
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full gap-2 font-bold rounded-2xl border-none bg-card shadow-sm hover:bg-muted" 
                onClick={() => window.open(`/gruppe/${code}/print`, '_blank')}
              >
                <FileText className="h-4 w-4" /> PDF
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full gap-2 font-bold rounded-2xl border-none bg-card shadow-sm hover:bg-muted" 
                onClick={() => exportToCSV(gruppe)}
              >
                <Table className="h-4 w-4" /> CSV
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
