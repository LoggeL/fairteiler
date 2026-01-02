'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CURRENCIES } from '@/lib/currencies'
import { Loader2, Save, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface Mitglied {
  id: string
  name: string
}

interface Props {
  gruppe: any
  onSuccess: () => void
}

export function GroupSettings({ gruppe, onSuccess }: Props) {
  const [name, setName] = useState(gruppe.name)
  const [waehrung, setWaehrung] = useState(gruppe.waehrung)
  const [mitglieder, setMitglieder] = useState<Mitglied[]>(gruppe.mitglieder)
  const [newMember, setNewMember] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleMemberNameChange = (id: string, newName: string) => {
    setMitglieder(mitglieder.map(m => m.id === id ? { ...m, name: newName } : m))
  }

  const handleAddMember = () => {
    if (!newMember.trim()) return
    setMitglieder([...mitglieder, { id: `temp-${Date.now()}`, name: newMember }])
    setNewMember('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const mitgliederPayload = mitglieder.map(m => ({
        id: m.id.startsWith('temp-') ? undefined : m.id,
        name: m.name
      }))

      const response = await fetch(`/api/gruppen/${gruppe.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          waehrung,
          mitglieder: mitgliederPayload
        })
      })

      if (!response.ok) throw new Error('Update failed')
      
      toast.success('Einstellungen gespeichert')
      onSuccess()
    } catch (error) {
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10 pb-10 px-1">
      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Gruppenname</Label>
          <Input id="name" value={name} onChange={e => setName(e.target.value)} className="bg-muted/50 border-none h-12 rounded-2xl font-bold px-4 focus:ring-2 focus:ring-primary" />
        </div>

        <div className="space-y-3">
          <Label htmlFor="waehrung" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Währung</Label>
          <select
            id="waehrung"
            className="flex h-12 w-full rounded-2xl border-none bg-muted/50 px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-primary cursor-pointer appearance-none"
            value={waehrung}
            onChange={e => setWaehrung(e.target.value)}
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.code} ({c.symbol}) - {c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-6">
        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Mitglieder</Label>
        <div className="space-y-3">
          {mitglieder.map((m) => (
            <div key={m.id} className="flex gap-2">
              <Input 
                value={m.name} 
                onChange={(e) => handleMemberNameChange(m.id, e.target.value)}
                className="bg-muted/50 border-none h-12 rounded-2xl font-bold px-4"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Input 
            placeholder="Neues Mitglied..." 
            value={newMember}
            onChange={e => setNewMember(e.target.value)}
            className="bg-muted/50 border-none h-12 rounded-2xl font-bold px-4"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddMember()
              }
            }}
          />
          <Button type="button" variant="secondary" size="icon" className="h-12 w-12 rounded-2xl shrink-0" onClick={handleAddMember}>
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full h-14 rounded-3xl font-black text-base shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
        {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
        ÄNDERUNGEN SPEICHERN
      </Button>
    </form>
  )
}
