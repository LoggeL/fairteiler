import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
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
