'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  Legend
} from 'recharts'
import { TrendingUp, TrendingDown, Receipt, CreditCard, Users, Calendar } from 'lucide-react'

interface GroupAnalyticsProps {
  transactions: any[]
  mitglieder: any[]
  waehrung: string
  salden: Map<string, number>
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6']

export function GroupAnalytics({ transactions, mitglieder, waehrung, salden }: GroupAnalyticsProps) {
  
  const expenses = useMemo(() => {
    return transactions.filter(t => t.type === 'expense')
  }, [transactions])

  const payments = useMemo(() => {
    return transactions.filter(t => t.type === 'payment')
  }, [transactions])

  // Key metrics
  const stats = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + Number(e.betrag), 0)
    const avgExpense = expenses.length > 0 ? total / expenses.length : 0
    const maxExpense = expenses.length > 0 ? Math.max(...expenses.map(e => Number(e.betrag))) : 0
    const minExpense = expenses.length > 0 ? Math.min(...expenses.map(e => Number(e.betrag))) : 0
    
    // Find most expensive item
    const mostExpensive = expenses.reduce((max, e) => 
      Number(e.betrag) > Number(max?.betrag || 0) ? e : max, expenses[0])
    
    // Days since first expense
    const dates = expenses.map(e => new Date(e.datum).getTime())
    const firstDate = dates.length > 0 ? Math.min(...dates) : Date.now()
    const lastDate = dates.length > 0 ? Math.max(...dates) : Date.now()
    const daySpan = Math.max(1, Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)))
    const avgPerDay = total / daySpan

    return {
      total,
      avgExpense,
      maxExpense,
      minExpense,
      mostExpensive,
      expenseCount: expenses.length,
      paymentCount: payments.length,
      avgPerDay,
      daySpan
    }
  }, [expenses, payments])

  // Spending over time (cumulative)
  const cumulativeSpending = useMemo(() => {
    const sorted = [...expenses].sort((a, b) => 
      new Date(a.datum).getTime() - new Date(b.datum).getTime()
    )
    
    let cumulative = 0
    const grouped = new Map<string, { daily: number, cumulative: number }>()
    
    sorted.forEach(t => {
      const date = new Date(t.datum).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
      const existing = grouped.get(date) || { daily: 0, cumulative: 0 }
      cumulative += Number(t.betrag)
      grouped.set(date, { 
        daily: existing.daily + Number(t.betrag), 
        cumulative 
      })
    })

    return Array.from(grouped.entries()).map(([date, data]) => ({
      date,
      daily: data.daily,
      cumulative: data.cumulative
    }))
  }, [expenses])

  // Spending by member (who paid)
  const spendingByMember = useMemo(() => {
    const grouped = new Map<string, { name: string, paid: number, owes: number, color: string }>()
    
    mitglieder.forEach((m, i) => grouped.set(m.id, { 
      name: m.name, 
      paid: 0, 
      owes: 0,
      color: COLORS[i % COLORS.length]
    }))
    
    expenses.forEach(t => {
      const entry = grouped.get(t.zahlerId)
      if (entry) {
        entry.paid += Number(t.betrag)
      }
    })

    // Add balance info
    salden.forEach((saldo, id) => {
      const entry = grouped.get(id)
      if (entry) {
        entry.owes = saldo < 0 ? Math.abs(saldo) : 0
      }
    })

    return Array.from(grouped.values())
      .sort((a, b) => b.paid - a.paid)
  }, [expenses, mitglieder, salden])

  // Balance comparison data
  const balanceData = useMemo(() => {
    return mitglieder.map((m, i) => {
      const saldo = salden.get(m.id) || 0
      return {
        name: m.name,
        saldo,
        fill: saldo >= 0 ? '#10b981' : '#ef4444'
      }
    }).sort((a, b) => b.saldo - a.saldo)
  }, [mitglieder, salden])

  // Expense count by member
  const expenseCountByMember = useMemo(() => {
    const counts = new Map<string, number>()
    mitglieder.forEach(m => counts.set(m.name, 0))
    
    expenses.forEach(e => {
      const name = e.zahler?.name || 'Unbekannt'
      counts.set(name, (counts.get(name) || 0) + 1)
    })

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .filter(i => i.count > 0)
      .sort((a, b) => b.count - a.count)
  }, [expenses, mitglieder])

  const formatMoney = (val: number) => val.toLocaleString('de-DE', { style: 'currency', currency: waehrung })
  const formatCompact = (val: number) => val.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €'

  if (expenses.length === 0) {
    return (
      <Card className="border-dashed border-muted bg-transparent shadow-none">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Receipt className="h-12 w-12 text-muted/30 mb-3" />
          <p className="text-muted-foreground font-medium text-sm">Noch keine Ausgaben vorhanden.</p>
          <p className="text-muted-foreground/60 text-xs mt-1">Füge Ausgaben hinzu, um Analysen zu sehen.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-none bg-card shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ausgaben</p>
                <p className="text-xl font-black text-foreground">{stats.expenseCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-card shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ø Ausgabe</p>
                <p className="text-lg font-black text-foreground">{formatMoney(stats.avgExpense)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-card shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Maximum</p>
                <p className="text-lg font-black text-foreground">{formatMoney(stats.maxExpense)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-card shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ø pro Tag</p>
                <p className="text-lg font-black text-foreground">{formatMoney(stats.avgPerDay)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Cumulative Spending Area Chart */}
        <Card className="border-none bg-card shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Ausgabenverlauf
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativeSpending}>
                  <defs>
                    <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(val) => formatCompact(val)}
                    width={50}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-lg">
                            <p className="text-xs font-bold text-foreground mb-2">{label}</p>
                            <div className="space-y-1">
                              <div className="flex justify-between gap-4">
                                <span className="text-[10px] uppercase text-muted-foreground">Tagesausgaben</span>
                                <span className="font-bold text-foreground text-sm">{formatMoney(payload[0]?.payload?.daily || 0)}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-[10px] uppercase text-muted-foreground">Gesamt</span>
                                <span className="font-bold text-primary text-sm">{formatMoney(payload[0]?.value as number)}</span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area 
                    type="monotone"
                    dataKey="cumulative" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fill="url(#colorCumulative)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Member Distribution Donut */}
        <Card className="border-none bg-card shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Wer hat bezahlt?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full flex">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendingByMember.filter(m => m.paid > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="paid"
                      nameKey="name"
                    >
                      {spendingByMember.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          const total = spendingByMember.reduce((s, m) => s + m.paid, 0)
                          const pct = total > 0 ? ((data.paid / total) * 100).toFixed(1) : 0
                          return (
                            <div className="rounded-lg border bg-background p-3 shadow-lg">
                              <p className="font-bold text-foreground text-sm mb-1">{data.name}</p>
                              <div className="flex justify-between gap-4">
                                <span className="text-[10px] uppercase text-muted-foreground">Bezahlt</span>
                                <span className="font-bold text-primary">{formatMoney(data.paid)}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-[10px] uppercase text-muted-foreground">Anteil</span>
                                <span className="font-bold text-muted-foreground">{pct}%</span>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-28 flex flex-col justify-center gap-1.5">
                {spendingByMember.filter(m => m.paid > 0).slice(0, 5).map((member, i) => (
                  <div key={member.name} className="flex items-center gap-2">
                    <div 
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: member.color }}
                    />
                    <span className="text-[10px] font-medium text-muted-foreground truncate">
                      {member.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Balance Bar Chart */}
        <Card className="border-none bg-card shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Aktuelle Salden
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={balanceData} layout="vertical">
                  <XAxis 
                    type="number"
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(val) => formatCompact(val)}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    width={70}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.15 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        const isPositive = data.saldo >= 0
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-lg">
                            <p className="font-bold text-foreground text-sm mb-1">{data.name}</p>
                            <div className="flex items-center gap-2">
                              {isPositive ? (
                                <TrendingUp className="h-3 w-3 text-primary" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-destructive" />
                              )}
                              <span className={`font-bold ${isPositive ? 'text-primary' : 'text-destructive'}`}>
                                {isPositive ? '+' : ''}{formatMoney(data.saldo)}
                              </span>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar 
                    dataKey="saldo" 
                    radius={[0, 4, 4, 0]}
                    maxBarSize={24}
                  >
                    {balanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense Count by Member */}
        <Card className="border-none bg-card shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Anzahl Ausgaben
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseCountByMember}>
                  <XAxis 
                    dataKey="name" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    allowDecimals={false}
                    width={30}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.15 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-lg">
                            <p className="font-bold text-foreground text-sm">{data.name}</p>
                            <p className="text-muted-foreground text-xs">
                              <span className="font-bold text-primary">{data.count}</span> Ausgaben erfasst
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Most Expensive Item Highlight */}
      {stats.mostExpensive && (
        <Card className="border-none bg-gradient-to-r from-amber-500/10 to-orange-500/10 shadow-md overflow-hidden">
          <CardContent className="p-5 flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-2xl flex-shrink-0">
              💸
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">
                Größte Einzelausgabe
              </p>
              <h4 className="font-bold text-foreground text-base truncate">{stats.mostExpensive.titel}</h4>
              <p className="text-xs text-muted-foreground">
                {stats.mostExpensive.zahler?.name} • {new Date(stats.mostExpensive.datum).toLocaleDateString('de-DE')}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {formatMoney(Number(stats.mostExpensive.betrag))}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
