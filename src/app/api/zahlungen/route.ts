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
    const { gruppeId, vonMitgliedId, anMitgliedId, betrag } = body

    if (!gruppeId || !vonMitgliedId || !anMitgliedId || !betrag) {
      return NextResponse.json({ error: 'Unvollständige Daten' }, { status: 400 })
    }

    const zahlung = await prisma.zahlung.create({
      data: {
        gruppeId,
        vonMitgliedId,
        anMitgliedId,
        betrag: Number(betrag)
      }
    })

    return NextResponse.json(zahlung)
  } catch (error) {
    console.error('Fehler beim Erstellen der Zahlung:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
