'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Loader2, Users, Percent, Trash2, Pencil } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface Mitglied {
  id: string
  name: string
}

interface Anteil {
  mitgliedId: string
  betrag: number
}

interface Expense {
  id: string
  titel: string
  betrag: number
  zahlerId: string
  anteile: Anteil[]
}

interface Props {
  gruppeId: string
  mitglieder: Mitglied[]
  waehrung: string
  onSuccess: () => void
  expense?: Expense // If provided, we are in Edit Mode
}

export function ExpenseDialog({ gruppeId, mitglieder, waehrung, onSuccess, expense }: Props) {
  const [open, setOpen] = useState(false)
  const [titel, setTitel] = useState('')
  const [betrag, setBetrag] = useState('')
  const [zahlerId, setZahlerId] = useState('')
  
  // Split Modes: 'equal' or 'unequal'
  const [splitMode, setSplitMode] = useState('equal')
  
  // Equal Split State
  const [selectedMitglieder, setSelectedMitglieder] = useState<string[]>([])
  
  // Unequal Split State (Shares/Weights)
  const [shares, setShares] = useState<Map<string, string>>(new Map())

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Initialize form state
  useEffect(() => {
    if (open) {
      if (expense) {
        // Edit Mode Initialization
        setTitel(expense.titel)
        setBetrag(expense.betrag.toString())
        setZahlerId(expense.zahlerId)
        
        // Determine split mode based on anteile
        // For simplicity in MVP, we might default to 'unequal' if amounts differ slightly,
        // but let's try to detect equal split
        const amounts = expense.anteile.map(a => Number(a.betrag))
        const allEqual = amounts.every(val => Math.abs(val - amounts[0]) < 0.01)
        
        if (allEqual) {
          setSplitMode('equal')
          setSelectedMitglieder(expense.anteile.map(a => a.mitgliedId))
          // Also init shares just in case user switches tab
          setShares(new Map(mitglieder.map(m => [m.id, expense.anteile.find(a => a.mitgliedId === m.id) ? '1' : '0'])))
        } else {
          setSplitMode('unequal')
          // Initialize shares with actual amounts as weights
          const shareMap = new Map<string, string>()
          mitglieder.forEach(m => {
             const anteil = expense.anteile.find(a => a.mitgliedId === m.id)
             shareMap.set(m.id, anteil ? Number(anteil.betrag).toFixed(2) : '')
          })
          setShares(shareMap)
          // Also init selected just in case
          setSelectedMitglieder(expense.anteile.map(a => a.mitgliedId))
        }

      } else {
        // Create Mode Initialization
        setTitel('')
        setBetrag('')
        setZahlerId(mitglieder[0]?.id || '')
        setSplitMode('equal')
        setSelectedMitglieder(mitglieder.map(m => m.id))
        setShares(new Map(mitglieder.map(m => [m.id, '1'])))
      }
    }
  }, [open, expense, mitglieder])

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

  const handleDelete = async () => {
    if (!expense) return
    if (!confirm('Möchtest du diese Ausgabe wirklich löschen?')) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/ausgaben/${expense.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Delete failed')
      toast.success('Ausgabe gelöscht')
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
        toast.error('Bitte gib mindestens einen Anteil an')
        return
      }

      anteile = activeShares.map(item => ({
        mitgliedId: item.id,
        betrag: (numBetrag * item.share) / totalShares
      }))
    }

    setIsSubmitting(true)
    try {
      const url = expense ? `/api/ausgaben/${expense.id}` : '/api/ausgaben'
      const method = expense ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
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

      toast.success(expense ? 'Ausgabe aktualisiert' : 'Ausgabe hinzugefügt')
      setOpen(false)
      onSuccess()
    } catch (error) {
      console.error(error)
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {expense ? (
           <div className="cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors w-full">
             {/* Trigger is handled by wrapping content */}
             <span className="sr-only">Bearbeiten</span>
           </div>
        ) : (
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
            <Plus className="h-4 w-4" /> Ausgabe hinzufügen
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{expense ? 'Ausgabe bearbeiten' : 'Neue Ausgabe'}</DialogTitle>
          <DialogDescription>
            Details der Ausgabe anpassen.
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
                          placeholder="0"
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
          <DialogFooter className="flex gap-2 sm:justify-between">
             {expense && (
               <Button 
                 type="button" 
                 variant="destructive" 
                 onClick={handleDelete}
                 disabled={isDeleting}
               >
                 {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
               </Button>
             )}
             <div className="flex-1"></div>
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Speichern
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
