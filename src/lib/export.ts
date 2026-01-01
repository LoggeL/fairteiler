import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export function exportToPDF(gruppe: any, salden: Map<string, number>, ausgleich: any[]) {
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(22)
  doc.text(`Fairteiler: ${gruppe.name}`, 20, 20)
  
  doc.setFontSize(10)
  doc.text(`Erstellt am: ${format(new Date(), 'dd. MMMM yyyy', { locale: de })}`, 20, 30)
  
  // Salden
  doc.setFontSize(16)
  doc.text('Aktuelle Salden', 20, 45)
  
  let y = 55
  doc.setFontSize(12)
  gruppe.mitglieder.forEach((m: any) => {
    const saldo = salden.get(m.id) || 0
    const text = `${m.name}: ${saldo.toLocaleString('de-DE', { style: 'currency', currency: gruppe.waehrung })}`
    doc.text(text, 25, y)
    y += 8
  })
  
  // Zahlungen
  y += 10
  doc.setFontSize(16)
  doc.text('Vorgeschlagene Zahlungen', 20, y)
  y += 10
  
  doc.setFontSize(12)
  if (ausgleich.length === 0) {
    doc.text('Keine Zahlungen nötig.', 25, y)
  } else {
    ausgleich.forEach((z: any) => {
      const von = gruppe.mitglieder.find((m: any) => m.id === z.vonMitgliedId)?.name
      const an = gruppe.mitglieder.find((m: any) => m.id === z.anMitgliedId)?.name
      const text = `${von} -> ${an}: ${z.betrag.toLocaleString('de-DE', { style: 'currency', currency: gruppe.waehrung })}`
      doc.text(text, 25, y)
      y += 8
    })
  }
  
  // Ausgaben
  y += 10
  if (y > 250) {
    doc.addPage()
    y = 20
  }
  doc.setFontSize(16)
  doc.text('Ausgabenliste', 20, y)
  y += 10
  
  doc.setFontSize(10)
  gruppe.ausgaben.forEach((a: any) => {
    if (y > 280) {
      doc.addPage()
      y = 20
    }
    const datum = format(new Date(a.datum), 'dd.MM.yyyy')
    const text = `${datum} | ${a.titel} | ${a.zahler.name}: ${Number(a.betrag).toLocaleString('de-DE', { style: 'currency', currency: gruppe.waehrung })}`
    doc.text(text, 25, y)
    y += 6
  })
  
  doc.save(`Abrechnung_${gruppe.name}.pdf`)
}
