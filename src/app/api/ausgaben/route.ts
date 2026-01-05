import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
    }

    const body = await request.json()
    const { titel, betrag, waehrung, zahlerId, gruppeId, anteile } = body

    if (!titel || !betrag || !zahlerId || !gruppeId || !anteile || !Array.isArray(anteile)) {
      return NextResponse.json({ error: 'Unvollständige Daten' }, { status: 400 })
    }

    const ausgabe = await prisma.ausgabe.create({
      data: {
        titel,
        betrag,
        waehrung: waehrung || 'EUR',
        zahlerId,
        gruppeId,
        anteile: {
          create: anteile.map((a: { mitgliedId: string, betrag: number }) => ({
            mitgliedId: a.mitgliedId,
            betrag: a.betrag
          }))
        }
      },
      include: {
        anteile: true
      }
    })

    return NextResponse.json(ausgabe)
  } catch (error) {
    console.error('Fehler beim Erstellen der Ausgabe:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
