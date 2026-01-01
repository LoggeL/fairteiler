'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CURRENCIES } from '@/lib/currencies'
import { Loader2, Save } from 'lucide-react'
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
    <form onSubmit={handleSubmit} className="space-y-6 pb-10 px-1">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-500">Gruppenname</Label>
          <Input id="name" value={name} onChange={e => setName(e.target.value)} className="bg-slate-50/50" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="waehrung" className="text-xs font-bold uppercase tracking-wider text-slate-500">Währung</Label>
          <select
            id="waehrung"
            className="flex h-10 w-full rounded-md border border-input bg-slate-50/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={waehrung}
            onChange={e => setWaehrung(e.target.value)}
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.code} ({c.symbol}) - {c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Mitglieder</Label>
        <div className="space-y-2">
          {mitglieder.map((m) => (
            <div key={m.id} className="flex gap-2">
              <Input 
                value={m.name} 
                onChange={(e) => handleMemberNameChange(m.id, e.target.value)}
                className="bg-slate-50/50"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input 
            placeholder="Neues Mitglied..." 
            value={newMember}
            onChange={e => setNewMember(e.target.value)}
            className="bg-slate-50/50"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddMember()
              }
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={handleAddMember}>Hinzufügen</Button>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full shadow-lg shadow-emerald-500/20">
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Änderungen speichern
      </Button>
    </form>
  )
}
