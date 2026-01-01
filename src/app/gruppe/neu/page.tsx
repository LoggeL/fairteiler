'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CURRENCIES } from '@/lib/currencies'
import { Plus, Trash2, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function NeueGruppe() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [waehrung, setWaehrung] = useState('EUR')
  const [mitglieder, setMitglieder] = useState(['', ''])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleMitgliedChange = (index: number, value: string) => {
    const newMitglieder = [...mitglieder]
    newMitglieder[index] = value
    setMitglieder(newMitglieder)
  }

  const addMitglied = () => {
    setMitglieder([...mitglieder, ''])
  }

  const removeMitglied = (index: number) => {
    if (mitglieder.length <= 1) return
    const newMitglieder = mitglieder.filter((_, i) => i !== index)
    setMitglieder(newMitglieder)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validMitglieder = mitglieder.filter(m => m.trim() !== '')
    if (!name.trim()) {
      toast.error('Bitte gib der Gruppe einen Namen')
      return
    }
    if (validMitglieder.length < 1) {
      toast.error('Bitte füge mindestens ein Mitglied hinzu')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/gruppen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          waehrung,
          mitglieder: validMitglieder
        })
      })

      if (!response.ok) throw new Error('Fehler beim Erstellen')

      const data = await response.json()
      router.push(`/gruppe/${data.einladecode}`)
    } catch (error) {
      console.error(error)
      toast.error('Fehler beim Erstellen der Gruppe')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-zinc-950">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/" className="text-zinc-500 hover:text-zinc-900">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <CardTitle>Neue Gruppe erstellen</CardTitle>
          </div>
          <CardDescription>
            Gib deiner Gruppe einen Namen und füge die Teilnehmer hinzu.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name der Gruppe</Label>
              <Input 
                id="name" 
                placeholder="z.B. WG-Kasse oder Interrail 2026" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="waehrung">Standardwährung</Label>
              <select
                id="waehrung"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={waehrung}
                onChange={(e) => setWaehrung(e.target.value)}
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} ({c.symbol}) - {c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <Label>Mitglieder</Label>
              {mitglieder.map((mitglied, index) => (
                <div key={index} className="flex gap-2">
                  <Input 
                    placeholder={`Mitglied ${index + 1}`} 
                    value={mitglied}
                    onChange={(e) => handleMitgliedChange(index, e.target.value)}
                    required
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeMitglied(index)}
                    disabled={mitglieder.length <= 1}
                  >
                    <Trash2 className="h-4 w-4 text-zinc-500" />
                  </Button>
                </div>
              ))}
              <Button 
                type="button" 
                variant="outline" 
                className="w-full gap-2 border-dashed" 
                onClick={addMitglied}
              >
                <Plus className="h-4 w-4" /> Mitglied hinzufügen
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Gruppe erstellen
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
