'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ModeToggle } from '@/components/mode-toggle'
import { Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwörter stimmen nicht überein')
      return
    }

    if (password.length < 6) {
      toast.error('Passwort muss mindestens 6 Zeichen lang sein')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registrierung fehlgeschlagen')
      }

      // Auto-login after registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Konto erstellt!')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      
      <div className="absolute top-6 right-6">
        <ModeToggle />
      </div>

      <Card className="w-full max-w-md border-none shadow-2xl bg-card/50 backdrop-blur-xl ring-1 ring-border relative z-10 rounded-[2.5rem]">
        <CardHeader className="pb-8 pt-10 px-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-all bg-muted p-2 rounded-2xl hover:scale-110 active:scale-90">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <CardTitle className="text-3xl font-black text-foreground tracking-tight">Registrieren</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground text-base font-medium">
            Erstelle ein Konto, um Gruppen anzulegen und Ausgaben zu teilen.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 px-8">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Name (optional)</Label>
              <Input 
                id="name" 
                type="text"
                placeholder="Dein Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 bg-muted/50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-lg px-5"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Email</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="deine@email.de" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 bg-muted/50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-lg px-5"
                required
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="password" className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Passwort</Label>
              <Input 
                id="password" 
                type="password"
                placeholder="Mindestens 6 Zeichen" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 bg-muted/50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-lg px-5"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Passwort bestätigen</Label>
              <Input 
                id="confirmPassword" 
                type="password"
                placeholder="Passwort wiederholen" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-14 bg-muted/50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-lg px-5"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 p-8">
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-16 text-lg font-black rounded-3xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : null}
              KONTO ERSTELLEN
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Bereits registriert?{' '}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Anmelden
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
