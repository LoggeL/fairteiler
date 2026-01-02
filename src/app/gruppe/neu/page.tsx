'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors bg-muted p-1.5 rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <CardTitle className="text-xl font-bold text-foreground">Neue Gruppe</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Erstelle eine neue Gruppe für eure gemeinsamen Ausgaben.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Name der Gruppe</Label>
              <Input 
                id="name" 
                placeholder="z.B. WG-Kasse oder Urlaub" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="waehrung" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Standardwährung</Label>
              <select
                id="waehrung"
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={waehrung}
                onChange={(e) => setWaehrung(e.target.value)}
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} ({c.symbol}) - {c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mitglieder</Label>
              <div className="space-y-2">
                {mitglieder.map((mitglied, index) => (
                  <div key={index} className="flex gap-2">
                    <Input 
                      placeholder={`Mitglied ${index + 1}`} 
                      value={mitglied}
                      onChange={(e) => handleMitgliedChange(index, e.target.value)}
                      className="h-11"
                      required
                    />
                    {mitglieder.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-11 w-11 text-muted-foreground hover:text-destructive"
                        onClick={() => removeMitglied(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full gap-2 border-dashed text-muted-foreground hover:text-primary hover:border-primary h-11" 
                onClick={addMitglied}
              >
                <Plus className="h-4 w-4" /> Mitglied hinzufügen
              </Button>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-bold shadow-lg"
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
