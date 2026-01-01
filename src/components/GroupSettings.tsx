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
    // Optimistic add (no ID yet, will be created by backend)
    // Actually backend expects { id?: string, name: string }
    // But local state needs consistent type.
    // I'll handle "new" members by not having an ID in the payload, but here I need a temp ID for UI key.
    // Let's just append to a separate list or handle it in submit.
    // Actually easier: just add to list with a temp- prefix ID and filter before sending.
    setMitglieder([...mitglieder, { id: `temp-${Date.now()}`, name: newMember }])
    setNewMember('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Filter out temp IDs
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
    <Card>
      <CardHeader>
        <CardTitle>Gruppeneinstellungen</CardTitle>
        <CardDescription>Hier kannst du Namen, Währung und Mitglieder verwalten.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Gruppenname</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="waehrung">Währung</Label>
            <select
              id="waehrung"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={waehrung}
              onChange={e => setWaehrung(e.target.value)}
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} ({c.symbol}) - {c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <Label>Mitglieder</Label>
            {mitglieder.map((m) => (
              <div key={m.id} className="flex gap-2">
                <Input 
                  value={m.name} 
                  onChange={(e) => handleMemberNameChange(m.id, e.target.value)}
                />
              </div>
            ))}
            <div className="flex gap-2">
              <Input 
                placeholder="Neues Mitglied..." 
                value={newMember}
                onChange={e => setNewMember(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddMember()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddMember}>Hinzufügen</Button>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Speichern
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
