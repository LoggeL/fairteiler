import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
    }

    const { id } = await params

    // Check if member exists
    const mitglied = await prisma.mitglied.findUnique({
      where: { id },
      include: { gruppe: true }
    })

    if (!mitglied) {
      return NextResponse.json({ error: 'Mitglied nicht gefunden' }, { status: 404 })
    }

    // Check if already claimed by another user
    if (mitglied.userId && mitglied.userId !== session.user.id) {
      return NextResponse.json({ error: 'Dieses Mitglied wurde bereits von einem anderen Benutzer beansprucht' }, { status: 400 })
    }

    // Check if user already claimed a different member in this group
    const existingClaim = await prisma.mitglied.findFirst({
      where: {
        gruppeId: mitglied.gruppeId,
        userId: session.user.id,
        id: { not: id }
      }
    })

    if (existingClaim) {
      return NextResponse.json({ error: 'Du hast bereits ein anderes Mitglied in dieser Gruppe beansprucht' }, { status: 400 })
    }

    // Claim the member
    const updated = await prisma.mitglied.update({
      where: { id },
      data: { userId: session.user.id }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Fehler beim Beanspruchen des Mitglieds:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
    }

    const { id } = await params

    // Check if member exists and is claimed by this user
    const mitglied = await prisma.mitglied.findUnique({
      where: { id }
    })

    if (!mitglied) {
      return NextResponse.json({ error: 'Mitglied nicht gefunden' }, { status: 404 })
    }

    if (mitglied.userId !== session.user.id) {
      return NextResponse.json({ error: 'Du kannst nur deine eigenen Beanspruchungen aufheben' }, { status: 403 })
    }

    // Unclaim the member
    const updated = await prisma.mitglied.update({
      where: { id },
      data: { userId: null }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Fehler beim Aufheben der Beanspruchung:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
