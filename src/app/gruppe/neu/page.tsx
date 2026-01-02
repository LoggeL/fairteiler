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
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      
      <div className="absolute top-6 right-6">
        <ModeToggle />
      </div>
      <Card className="w-full max-w-lg border-none shadow-2xl bg-card/50 backdrop-blur-xl ring-1 ring-border relative z-10 rounded-[2.5rem]">
        <CardHeader className="pb-8 pt-10 px-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-all bg-muted p-2 rounded-2xl hover:scale-110 active:scale-90">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <CardTitle className="text-3xl font-black text-foreground tracking-tight">Neue Gruppe</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground text-base font-medium">
            Starte eine neue Abrechnung für euren Trip oder eure WG.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 px-8">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Name der Gruppe</Label>
              <Input 
                id="name" 
                placeholder="z.B. Portugal 2026 🌴" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 bg-muted/50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-lg px-5"
                required
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="waehrung" className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Währung</Label>
              <select
                id="waehrung"
                className="flex h-14 w-full rounded-2xl border-none bg-muted/50 px-5 py-2 text-base font-bold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all cursor-pointer"
                value={waehrung}
                onChange={(e) => setWaehrung(e.target.value)}
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} ({c.symbol}) - {c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Mitglieder</Label>
              <div className="space-y-3">
                {mitglieder.map((mitglied, index) => (
                  <div key={index} className="flex gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                    <Input 
                      placeholder={`Mitglied ${index + 1}`} 
                      value={mitglied}
                      onChange={(e) => handleMitgliedChange(index, e.target.value)}
                      className="h-14 bg-muted/50 border-none rounded-2xl font-bold px-5"
                      required
                    />
                    {mitglieder.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-14 w-14 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => removeMitglied(index)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full gap-2 border-dashed border-2 border-border text-muted-foreground hover:text-primary hover:border-primary h-14 rounded-2xl font-bold text-sm transition-all" 
                onClick={addMitglied}
              >
                <Plus className="h-5 w-5" /> Mitglied hinzufügen
              </Button>
            </div>
          </CardContent>
          <CardFooter className="p-8">
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-16 text-lg font-black rounded-3xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : null}
              GRUPPE ERSTELLEN
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
