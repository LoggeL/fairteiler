import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { titel, betrag, zahlerId, anteile } = body

    // Transaction to update expense and shares
    const ausgabe = await prisma.$transaction(async (tx) => {
      // 1. Update basic fields
      const updated = await tx.ausgabe.update({
        where: { id },
        data: {
          titel,
          betrag,
          zahlerId,
        }
      })

      // 2. Delete old shares
      await tx.anteil.deleteMany({
        where: { ausgabeId: id }
      })

      // 3. Create new shares
      if (anteile && Array.isArray(anteile)) {
        await tx.anteil.createMany({
          data: anteile.map((a: { mitgliedId: string, betrag: number }) => ({
            ausgabeId: id,
            mitgliedId: a.mitgliedId,
            betrag: a.betrag
          }))
        })
      }

      return updated
    })

    return NextResponse.json(ausgabe)
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Ausgabe:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.ausgabe.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Fehler beim Löschen der Ausgabe:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
