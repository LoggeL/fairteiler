import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, waehrung, mitglieder } = body

    // Transaction to update group and add new members
    const gruppe = await prisma.$transaction(async (tx) => {
      // 1. Update Group details
      const updated = await tx.gruppe.update({
        where: { id },
        data: {
          name,
          waehrung
        }
      })

      // 2. Update existing members or create new ones
      if (mitglieder && Array.isArray(mitglieder)) {
        for (const m of mitglieder) {
          if (m.id) {
            // Update existing
            await tx.mitglied.update({
              where: { id: m.id },
              data: { name: m.name }
            })
          } else if (m.name) {
            // Create new
            await tx.mitglied.create({
              data: {
                name: m.name,
                gruppeId: id
              }
            })
          }
        }
      }

      return updated
    })

    return NextResponse.json(gruppe)
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Gruppe:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
