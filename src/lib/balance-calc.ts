export interface Mitglied {
  id: string
  name: string
}

export interface Anteil {
  mitgliedId: string
  betrag: number
}

export interface Ausgabe {
  id: string
  titel: string
  betrag: number
  zahlerId: string
  anteile: Anteil[]
}

export interface Zahlung {
  vonMitgliedId: string
  anMitgliedId: string
  betrag: number
}

export function berechneSalden(mitglieder: Mitglied[], ausgaben: Ausgabe[], zahlungen: { vonMitgliedId: string, anMitgliedId: string, betrag: number }[]): Map<string, number> {
  const salden = new Map<string, number>()
  
  // Initialize balances
  mitglieder.forEach(m => salden.set(m.id, 0))
  
  // Apply expenses
  ausgaben.forEach(ausgabe => {
    // Payer gets credit
    salden.set(ausgabe.zahlerId, (salden.get(ausgabe.zahlerId) || 0) + Number(ausgabe.betrag))
    
    // Participants get debit
    ausgabe.anteile.forEach(anteil => {
      salden.set(anteil.mitgliedId, (salden.get(anteil.mitgliedId) || 0) - Number(anteil.betrag))
    })
  })
  
  // Apply recorded payments
  zahlungen.forEach(zahlung => {
    salden.set(zahlung.vonMitgliedId, (salden.get(zahlung.vonMitgliedId) || 0) + Number(zahlung.betrag))
    salden.set(zahlung.anMitgliedId, (salden.get(zahlung.anMitgliedId) || 0) - Number(zahlung.betrag))
  })
  
  return salden
}

export function berechneAusgleichszahlungen(salden: Map<string, number>): Zahlung[] {
  const ausgleich: Zahlung[] = []
  
  const schulden: { id: string, betrag: number }[] = []
  const guthaben: { id: string, betrag: number }[] = []
  
  salden.forEach((betrag, id) => {
    // Round to 2 decimal places to avoid floating point issues
    const rounded = Math.round(betrag * 100) / 100
    if (rounded < 0) {
      schulden.push({ id, betrag: Math.abs(rounded) })
    } else if (rounded > 0) {
      guthaben.push({ id, betrag: rounded })
    }
  })
  
  // Sort to match largest debt with largest credit
  schulden.sort((a, b) => b.betrag - a.betrag)
  guthaben.sort((a, b) => b.betrag - a.betrag)
  
  let i = 0, j = 0
  while (i < schulden.length && j < guthaben.length) {
    const s = schulden[i]
    const g = guthaben[j]
    
    const zahlbetrag = Math.min(s.betrag, g.betrag)
    if (zahlbetrag > 0) {
      ausgleich.push({
        vonMitgliedId: s.id,
        anMitgliedId: g.id,
        betrag: zahlbetrag
      })
    }
    
    s.betrag -= zahlbetrag
    g.betrag -= zahlbetrag
    
    if (s.betrag <= 0.001) i++
    if (g.betrag <= 0.001) j++
  }
  
  return ausgleich
}
