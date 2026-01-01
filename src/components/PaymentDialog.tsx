'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Loader2, Trash2, ArrowLeftRight } from 'lucide-react'
import { toast } from 'sonner'

interface Mitglied {
  id: string
  name: string
}

interface Payment {
  id: string
  vonMitgliedId: string
  anMitgliedId: string
  betrag: number
}

interface Props {
  gruppeId: string
  mitglieder: Mitglied[]
  waehrung: string
  onSuccess: () => void
  payment?: Payment
  trigger?: React.ReactNode
}

export function PaymentDialog({ gruppeId, mitglieder, waehrung, onSuccess, payment, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const [vonId, setVonId] = useState('')
  const [anId, setAnId] = useState('')
  const [betrag, setBetrag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (open) {
      if (payment) {
        setVonId(payment.vonMitgliedId)
        setAnId(payment.anMitgliedId)
        setBetrag(payment.betrag.toString())
      } else {
        setVonId(mitglieder[0]?.id || '')
        setAnId(mitglieder[1]?.id || mitglieder[0]?.id || '')
        setBetrag('')
      }
    }
  }, [open, payment, mitglieder])

  const handleDelete = async () => {
    if (!payment) return
    if (!confirm('Möchtest du diese Zahlung wirklich löschen?')) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/zahlungen/${payment.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Delete failed')
      toast.success('Zahlung gelöscht')
      setOpen(false)
      onSuccess()
    } catch (error) {
      toast.error('Fehler beim Löschen')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const numBetrag = parseFloat(betrag.replace(',', '.'))
    if (!vonId || !anId || isNaN(numBetrag) || numBetrag <= 0) {
      toast.error('Bitte fülle alle Felder korrekt aus')
      return
    }
    if (vonId === anId) {
      toast.error('Sender und Empfänger müssen unterschiedlich sein')
      return
    }
    setIsSubmitting(true)
    try {
      const url = payment ? `/api/zahlungen/${payment.id}` : '/api/zahlungen'
      const method = payment ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gruppeId, vonMitgliedId: vonId, anMitgliedId: anId, betrag: numBetrag })
      })
      if (!response.ok) throw new Error('Fehler beim Speichern')
      toast.success(payment ? 'Zahlung aktualisiert' : 'Zahlung erfasst')
      setOpen(false)
      onSuccess()
    } catch (error) {
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          <Button variant="outline" size="sm" className="gap-2 h-9 px-3 rounded-xl border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Zahlung erfassen
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{payment ? 'Zahlung bearbeiten' : 'Zahlung erfassen'}</DialogTitle>
          <DialogDescription className="text-slate-500">
            {payment ? 'Passe die Zahlungsdetails an.' : 'Wer hat wem Geld gegeben?'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="von" className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Von</Label>
                <select id="von" className="flex h-11 w-full rounded-md border-none bg-slate-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={vonId} onChange={e => setVonId(e.target.value)}>
                  {mitglieder.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="an" className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">An</Label>
                <select id="an" className="flex h-11 w-full rounded-md border-none bg-slate-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={anId} onChange={e => setAnId(e.target.value)}>
                  {mitglieder.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="betrag" className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Betrag</Label>
              <div className="relative">
                <Input id="betrag" value={betrag} onChange={e => setBetrag(e.target.value)} placeholder="0,00" className="pr-12 font-bold text-lg h-12 bg-slate-50 border-none" type="number" step="0.01" min="0.01" />
                <span className="absolute right-4 top-3 text-slate-400 font-medium">{waehrung}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:justify-between pt-4">
             {payment && <Button type="button" variant="ghost" className="text-slate-400 hover:text-red-500 hover:bg-red-50 h-11 px-4 rounded-xl" onClick={handleDelete} disabled={isDeleting}><Trash2 className="h-4 w-4" /></Button>}
             <div className="flex-1"></div>
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white h-11 px-8 rounded-xl font-bold shadow-lg shadow-emerald-500/20">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Speichern
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
