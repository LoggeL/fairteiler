'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Mitglied {
  id: string
  name: string
}

interface Props {
  gruppeId: string
  mitglieder: Mitglied[]
  waehrung: string
  onSuccess: () => void
}

export function AddPaymentDialog({ gruppeId, mitglieder, waehrung, onSuccess }: Props) {
  const [open, setOpen] = useState(false)
  const [vonId, setVonId] = useState(mitglieder[0]?.id || '')
  const [anId, setAnId] = useState(mitglieder[1]?.id || mitglieder[0]?.id || '')
  const [betrag, setBetrag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      const response = await fetch('/api/zahlungen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gruppeId,
          vonMitgliedId: vonId,
          anMitgliedId: anId,
          betrag: numBetrag
        })
      })

      if (!response.ok) throw new Error('Fehler beim Speichern')

      toast.success('Zahlung erfasst')
      setBetrag('')
      setOpen(false)
      onSuccess()
    } catch (error) {
      console.error(error)
      toast.error('Fehler beim Erfassen der Zahlung')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" /> Zahlung erfassen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Zahlung erfassen</DialogTitle>
          <DialogDescription>
            Wer hat wem Geld gegeben?
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="von">Von</Label>
              <select
                id="von"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={vonId}
                onChange={e => setVonId(e.target.value)}
              >
                {mitglieder.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="an">An</Label>
              <select
                id="an"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={anId}
                onChange={e => setAnId(e.target.value)}
              >
                {mitglieder.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="betrag">Betrag</Label>
              <div className="relative">
                <Input 
                  id="betrag" 
                  value={betrag} 
                  onChange={e => setBetrag(e.target.value)} 
                  placeholder="0,00" 
                  className="pr-10" 
                  type="number"
                  step="0.01"
                  min="0.01"
                />
                <span className="absolute right-3 top-2 text-zinc-500">{waehrung}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Speichern
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
