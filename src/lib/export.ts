import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export function exportToCSV(gruppe: any) {
  let csvContent = "Datum;Titel;Zahler;Betrag;Waehrung\n"
  
  gruppe.ausgaben.forEach((a: any) => {
    const datum = format(new Date(a.datum), 'dd.MM.yyyy')
    const betrag = Number(a.betrag).toFixed(2).replace('.', ',')
    csvContent += `${datum};${a.titel};${a.zahler.name};${betrag};${gruppe.waehrung}\n`
  })

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `Abrechnung_${gruppe.name}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
