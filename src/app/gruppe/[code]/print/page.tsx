'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { berechneSalden, berechneAusgleichszahlungen } from '@/lib/balance-calc'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export default function PrintPage() {
  const { code } = useParams()
  const [gruppe, setGruppe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [salden, setSalden] = useState<Map<string, number>>(new Map())
  const [ausgleich, setAusgleich] = useState<any[]>([])

  const fetchGruppe = useCallback(async () => {
    try {
      const response = await fetch(`/api/gruppen/code/${code}`)
      if (!response.ok) throw new Error('Gruppe nicht gefunden')
      const data = await response.json()
      setGruppe(data)
      
      const s = berechneSalden(data.mitglieder, data.ausgaben, data.zahlungen)
      setSalden(s)
      setAusgleich(berechneAusgleichszahlungen(s))
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [code])

  useEffect(() => {
    fetchGruppe()
  }, [fetchGruppe])

  useEffect(() => {
    if (!loading && gruppe) {
      setTimeout(() => {
        window.print()
      }, 500)
    }
  }, [loading, gruppe])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!gruppe) return null

  const formatMoney = (amount: number) => 
    amount.toLocaleString('de-DE', { style: 'currency', currency: gruppe.waehrung })

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white text-slate-900 print:p-0 font-sans">
      <div className="flex justify-between items-baseline border-b-2 border-slate-900 pb-4 mb-8">
        <h1 className="text-3xl font-bold">Fairteiler: {gruppe.name}</h1>
        <p className="text-slate-500 font-medium">{format(new Date(), 'dd. MMMM yyyy', { locale: de })}</p>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-bold uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Kontostände</h2>
        <div className="grid grid-cols-2 gap-4">
          {gruppe.mitglieder.map((mitglied: any) => {
            const saldo = salden.get(mitglied.id) || 0
            return (
              <div key={mitglied.id} className="flex justify-between py-2 border-b border-slate-100">
                <span className="font-semibold">{mitglied.name}</span>
                <span className={saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                  {saldo > 0 ? '+' : ''}{formatMoney(saldo)}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Ausgleichszahlungen</h2>
        {ausgleich.length === 0 ? (
          <p className="text-slate-500 italic">Alles ausgeglichen, keine Zahlungen nötig.</p>
        ) : (
          <div className="space-y-2">
            {ausgleich.map((z, i) => {
              const von = gruppe.mitglieder.find((m: any) => m.id === z.vonMitgliedId)?.name
              const an = gruppe.mitglieder.find((m: any) => m.id === z.anMitgliedId)?.name
              return (
                <div key={i} className="flex gap-4 items-center py-1">
                  <span className="font-bold w-32">{von}</span>
                  <span className="text-slate-400">zahlt an</span>
                  <span className="font-bold w-32">{an}</span>
                  <span className="font-mono font-bold text-emerald-600 ml-auto">{formatMoney(z.betrag)}</span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Ausgabenverlauf</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="py-2 px-1">Datum</th>
              <th className="py-2 px-1">Beschreibung</th>
              <th className="py-2 px-1">Zahler</th>
              <th className="py-2 px-1 text-right">Betrag</th>
            </tr>
          </thead>
          <tbody>
            {[...gruppe.ausgaben].sort((a,b) => new Date(b.datum).getTime() - new Date(a.datum).getTime()).map((a: any) => (
              <tr key={a.id} className="border-b border-slate-100 text-sm">
                <td className="py-2 px-1">{format(new Date(a.datum), 'dd.MM.yyyy')}</td>
                <td className="py-2 px-1">{a.titel}</td>
                <td className="py-2 px-1">{a.zahler.name}</td>
                <td className="py-2 px-1 text-right font-semibold">{formatMoney(Number(a.betrag))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="mt-20 pt-8 border-t border-slate-200 text-center text-slate-400 text-xs">
        Fairteiler - Gemeinsam Ausgaben teilen. Erstellt auf fairteiler.logge.top
      </footer>
    </div>
  )
}
