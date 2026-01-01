'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Loader2, Users, Percent } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  
  // Split Modes: 'equal' or 'unequal'
  const [splitMode, setSplitMode] = useState('equal')
  
  // Equal Split State
  const [selectedMitglieder, setSelectedMitglieder] = useState<string[]>(mitglieder.map(m => m.id))
  
  // Unequal Split State (Shares/Weights)
  const [shares, setShares] = useState<Map<string, string>>(new Map(mitglieder.map(m => [m.id, '1'])))

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

  const handleShareChange = (id: string, value: string) => {
    const newShares = new Map(shares)
    newShares.set(id, value)
    setShares(newShares)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const numBetrag = parseFloat(betrag.replace(',', '.'))
    if (!titel || isNaN(numBetrag) || numBetrag <= 0 || !zahlerId) {
      toast.error('Bitte fülle alle Felder korrekt aus')
      return
    }

    let anteile: { mitgliedId: string, betrag: number }[] = []

    if (splitMode === 'equal') {
      if (selectedMitglieder.length === 0) {
        toast.error('Bitte wähle mindestens ein Mitglied aus')
        return
      }
      const anteilBetrag = numBetrag / selectedMitglieder.length
      anteile = selectedMitglieder.map(id => ({
        mitgliedId: id,
        betrag: anteilBetrag
      }))
    } else {
      // Unequal split based on shares/weights
      let totalShares = 0
      const activeShares: { id: string, share: number }[] = []

      shares.forEach((val, key) => {
        const s = parseFloat(val.replace(',', '.'))
        if (!isNaN(s) && s > 0) {
          totalShares += s
          activeShares.push({ id: key, share: s })
        }
      })

      if (totalShares === 0) {
        toast.error('Bitte gib mindestens einen Anteil/Gewichtung an')
        return
      }

      anteile = activeShares.map(item => ({
        mitgliedId: item.id,
        betrag: (numBetrag * item.share) / totalShares
      }))
    }

    setIsSubmitting(true)
    try {
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
      <DialogContent className="sm:max-w-[500px]">
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
                <Input 
                  id="betrag" 
                  value={betrag} 
                  onChange={e => setBetrag(e.target.value)} 
                  placeholder="0,00" 
                  className="pr-10 font-bold" 
                  type="number" 
                  step="0.01"
                />
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

            <div className="space-y-3">
              <Label>Aufteilung</Label>
              <Tabs defaultValue="equal" value={splitMode} onValueChange={setSplitMode} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="equal" className="gap-2">
                    <Users className="h-4 w-4" /> Gleichmäßig
                  </TabsTrigger>
                  <TabsTrigger value="unequal" className="gap-2">
                    <Percent className="h-4 w-4" /> Anteile / %
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="equal" className="pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    {mitglieder.map(m => (
                      <div key={m.id} className="flex items-center space-x-2 rounded border p-2">
                        <Checkbox 
                          id={`m-${m.id}`}
                          checked={selectedMitglieder.includes(m.id)}
                          onCheckedChange={() => handleToggleMitglied(m.id)}
                        />
                        <label htmlFor={`m-${m.id}`} className="text-sm font-medium leading-none cursor-pointer flex-1">
                          {m.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="unequal" className="pt-2">
                  <div className="space-y-2">
                    <p className="text-xs text-zinc-500 mb-2">Gib Anteile (z.B. 1, 2) oder Prozentwerte ein.</p>
                    {mitglieder.map(m => (
                      <div key={m.id} className="flex items-center gap-2">
                        <Label className="w-24 truncate" htmlFor={`share-${m.id}`}>{m.name}</Label>
                        <Input 
                          id={`share-${m.id}`}
                          value={shares.get(m.id) || ''}
                          onChange={e => handleShareChange(m.id, e.target.value)}
                          placeholder="1"
                          type="number"
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
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
