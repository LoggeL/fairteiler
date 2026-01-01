import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { vonMitgliedId, anMitgliedId, betrag } = body

    const zahlung = await prisma.zahlung.update({
      where: { id },
      data: {
        vonMitgliedId,
        anMitgliedId,
        betrag: Number(betrag)
      }
    })

    return NextResponse.json(zahlung)
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Zahlung:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.zahlung.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Fehler beim Löschen der Zahlung:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
