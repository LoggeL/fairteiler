'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Loader2, Users, Percent, Trash2 } from 'lucide-react'
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
  expense?: Expense
  trigger?: React.ReactNode
}

export function ExpenseDialog({ gruppeId, mitglieder, waehrung, onSuccess, expense, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const [titel, setTitel] = useState('')
  const [betrag, setBetrag] = useState('')
  const [zahlerId, setZahlerId] = useState('')
  const [splitMode, setSplitMode] = useState('equal')
  const [selectedMitglieder, setSelectedMitglieder] = useState<string[]>([])
  const [shares, setShares] = useState<Map<string, string>>(new Map())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (open) {
      if (expense) {
        setTitel(expense.titel)
        setBetrag(expense.betrag.toString())
        setZahlerId(expense.zahlerId)
        const amounts = expense.anteile.map(a => Number(a.betrag))
        const allEqual = amounts.length > 0 && amounts.every(val => Math.abs(val - amounts[0]) < 0.01)
        
        if (allEqual) {
          setSplitMode('equal')
          setSelectedMitglieder(expense.anteile.map(a => a.mitgliedId))
          setShares(new Map(mitglieder.map(m => [m.id, expense.anteile.find(a => a.mitgliedId === m.id) ? '1' : '0'])))
        } else {
          setSplitMode('unequal')
          const shareMap = new Map<string, string>()
          mitglieder.forEach(m => {
             const anteil = expense.anteile.find(a => a.mitgliedId === m.id)
             shareMap.set(m.id, anteil ? Number(anteil.betrag).toFixed(2) : '')
          })
          setShares(shareMap)
          setSelectedMitglieder(expense.anteile.map(a => a.mitgliedId))
        }
      } else {
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
      const response = await fetch(`/api/ausgaben/${expense.id}`, { method: 'DELETE' })
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
      anteile = selectedMitglieder.map(id => ({ mitgliedId: id, betrag: anteilBetrag }))
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
      anteile = activeShares.map(item => ({ mitgliedId: item.id, betrag: (numBetrag * item.share) / totalShares }))
    }
    setIsSubmitting(true)
    try {
      const url = expense ? `/api/ausgaben/${expense.id}` : '/api/ausgaben'
      const method = expense ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titel, betrag: numBetrag, waehrung, zahlerId, gruppeId, anteile })
      })
      if (!response.ok) throw new Error('Fehler beim Speichern')
      toast.success(expense ? 'Ausgabe aktualisiert' : 'Ausgabe hinzugefügt')
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
          <Button className="gap-2 h-10 px-4 rounded-xl shadow-lg">
            <Plus className="h-4 w-4" /> Ausgabe hinzufügen
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{expense ? 'Ausgabe bearbeiten' : 'Neue Ausgabe'}</DialogTitle>
          <DialogDescription>
            {expense ? 'Passe die Details an.' : 'Wer hat was für die Gruppe bezahlt?'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titel" className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Beschreibung</Label>
              <Input id="titel" value={titel} onChange={e => setTitel(e.target.value)} placeholder="z.B. Supermarkt" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="betrag" className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Betrag</Label>
              <div className="relative">
                <Input id="betrag" value={betrag} onChange={e => setBetrag(e.target.value)} placeholder="0,00" className="pr-12 font-bold text-lg h-12" type="number" step="0.01" />
                <span className="absolute right-4 top-3 text-muted-foreground font-medium">{waehrung}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zahler" className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Bezahlt von</Label>
              <select id="zahler" className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={zahlerId} onChange={e => setZahlerId(e.target.value)}>
                {mitglieder.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Aufteilung</Label>
              <Tabs defaultValue="equal" value={splitMode} onValueChange={setSplitMode} className="w-full">
                <TabsList className="grid w-full grid-cols-2 p-1 rounded-xl h-10">
                  <TabsTrigger value="equal" className="gap-2 text-xs rounded-lg"><Users className="h-3 w-3" /> Gleichmäßig</TabsTrigger>
                  <TabsTrigger value="unequal" className="gap-2 text-xs rounded-lg"><Percent className="h-3 w-3" /> Anteile</TabsTrigger>
                </TabsList>
                <TabsContent value="equal" className="pt-3">
                  <div className="grid grid-cols-2 gap-2">
                    {mitglieder.map(m => (
                      <div key={m.id} className={`flex items-center space-x-2 rounded-xl border p-2.5 transition-colors ${selectedMitglieder.includes(m.id) ? 'bg-accent border-primary/20 text-accent-foreground' : 'bg-muted border-transparent text-muted-foreground'}`}>
                        <Checkbox id={`m-${m.id}`} checked={selectedMitglieder.includes(m.id)} onCheckedChange={() => handleToggleMitglied(m.id)} />
                        <label htmlFor={`m-${m.id}`} className="text-xs font-semibold leading-none cursor-pointer flex-1">{m.name}</label>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="unequal" className="pt-3">
                  <div className="space-y-2 bg-muted p-3 rounded-xl">
                    {mitglieder.map(m => (
                      <div key={m.id} className="flex items-center gap-2">
                        <Label className="w-24 truncate text-xs font-medium text-foreground/70" htmlFor={`share-${m.id}`}>{m.name}</Label>
                        <Input id={`share-${m.id}`} value={shares.get(m.id) || ''} onChange={e => handleShareChange(m.id, e.target.value)} placeholder="0" type="number" className="flex-1 h-9" />
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:justify-between pt-4">
             {expense && <Button type="button" variant="ghost" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-11 px-4 rounded-xl" onClick={handleDelete} disabled={isDeleting}><Trash2 className="h-4 w-4" /></Button>}
             <div className="flex-1"></div>
            <Button type="submit" disabled={isSubmitting} className="h-11 px-8 rounded-xl font-bold shadow-lg">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {expense ? 'Speichern' : 'Hinzufügen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
