import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    const gruppe = await prisma.gruppe.findUnique({
      where: { einladecode: code },
      include: {
        mitglieder: true,
        ausgaben: {
          include: {
            zahler: true,
            anteile: {
              include: {
                mitglied: true
              }
            }
          },
          orderBy: { datum: 'desc' }
        },
        zahlungen: {
          include: {
            vonMitglied: true,
            anMitglied: true
          },
          orderBy: { datum: 'desc' }
        }
      }
    })

    if (!gruppe) {
      return NextResponse.json({ error: 'Gruppe nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json(gruppe)
  } catch (error) {
    console.error('Fehler beim Abrufen der Gruppe:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
