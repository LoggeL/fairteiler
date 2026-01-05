'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ModeToggle } from '@/components/mode-toggle'
import { Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        toast.error(result.error)
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-6 px-8">
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
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          ANMELDEN
        </Button>
        <p className="text-sm text-muted-foreground text-center">
          Noch kein Konto?{' '}
          <Link href="/register" className="text-primary font-bold hover:underline">
            Registrieren
          </Link>
        </p>
      </CardFooter>
    </form>
  )
}

export default function LoginPage() {
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
            <CardTitle className="text-3xl font-black text-foreground tracking-tight">Anmelden</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground text-base font-medium">
            Melde dich an, um Gruppen zu erstellen und zu verwalten.
          </CardDescription>
        </CardHeader>
        <Suspense fallback={
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        }>
          <LoginForm />
        </Suspense>
      </Card>
    </div>
  )
}
