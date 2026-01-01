import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, waehrung, mitglieder } = body

    if (!name || !mitglieder || !Array.isArray(mitglieder) || mitglieder.length === 0) {
      return NextResponse.json({ error: 'Name und mindestens ein Mitglied sind erforderlich' }, { status: 400 })
    }

    const gruppe = await prisma.gruppe.create({
      data: {
        name,
        waehrung: waehrung || 'EUR',
        mitglieder: {
          create: mitglieder.map((m: string) => ({ name: m }))
        }
      },
      include: {
        mitglieder: true
      }
    })

    return NextResponse.json(gruppe)
  } catch (error) {
    console.error('Fehler beim Erstellen der Gruppe:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
