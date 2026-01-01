'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Loader2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
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

export function AddExpenseDialog({ gruppeId, mitglieder, waehrung, onSuccess }: Props) {
  const [open, setOpen] = useState(false)
  const [titel, setTitel] = useState('')
  const [betrag, setBetrag] = useState('')
  const [zahlerId, setZahlerId] = useState(mitglieder[0]?.id || '')
  const [selectedMitglieder, setSelectedMitglieder] = useState<string[]>(mitglieder.map(m => m.id))
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (mitglieder.length > 0 && !zahlerId) {
      setZahlerId(mitglieder[0].id)
    }
  }, [mitglieder, zahlerId])

  const handleToggleMitglied = (id: string) => {
    if (selectedMitglieder.includes(id)) {
      setSelectedMitglieder(selectedMitglieder.filter(m => m !== id))
    } else {
      setSelectedMitglieder([...selectedMitglieder, id])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const numBetrag = parseFloat(betrag.replace(',', '.'))
    if (!titel || isNaN(numBetrag) || numBetrag <= 0 || !zahlerId || selectedMitglieder.length === 0) {
      toast.error('Bitte fülle alle Felder korrekt aus')
      return
    }

    setIsSubmitting(true)
    try {
      // Simple even split for now
      const anteilBetrag = numBetrag / selectedMitglieder.length
      const anteile = selectedMitglieder.map(id => ({
        mitgliedId: id,
        betrag: anteilBetrag
      }))

      const response = await fetch('/api/ausgaben', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titel,
          betrag: numBetrag,
          waehrung,
          zahlerId,
          gruppeId,
          anteile
        })
      })

      if (!response.ok) throw new Error('Fehler beim Speichern')

      toast.success('Ausgabe hinzugefügt')
      setTitel('')
      setBetrag('')
      setOpen(false)
      onSuccess()
    } catch (error) {
      console.error(error)
      toast.error('Fehler beim Hinzufügen der Ausgabe')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <Plus className="h-4 w-4" /> Ausgabe hinzufügen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Neue Ausgabe</DialogTitle>
          <DialogDescription>
            Wer hat was für die Gruppe bezahlt?
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="titel">Was?</Label>
              <Input id="titel" value={titel} onChange={e => setTitel(e.target.value)} placeholder="z.B. Supermarkt" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="betrag">Wieviel?</Label>
              <div className="relative">
                <Input id="betrag" value={betrag} onChange={e => setBetrag(e.target.value)} placeholder="0,00" className="pr-10" />
                <span className="absolute right-3 top-2 text-zinc-500">{waehrung}</span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="zahler">Wer hat bezahlt?</Label>
              <select
                id="zahler"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={zahlerId}
                onChange={e => setZahlerId(e.target.value)}
              >
                {mitglieder.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Für wen?</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {mitglieder.map(m => (
                  <div key={m.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`m-${m.id}`}
                      checked={selectedMitglieder.includes(m.id)}
                      onCheckedChange={() => handleToggleMitglied(m.id)}
                    />
                    <label htmlFor={`m-${m.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {m.name}
                    </label>
                  </div>
                ))}
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
