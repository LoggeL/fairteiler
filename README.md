# Fairteiler

Teile Ausgaben fair auf. Eine moderne Gruppenausgaben-App auf Deutsch, inspiriert von Splid.

## Features

- **Gruppen erstellen**: Erstelle Gruppen für WG, Urlaub oder Events.
- **Ausgaben erfassen**: Wer hat was für wen bezahlt?
- **Saldenübersicht**: Wer schuldet wem wie viel?
- **Abrechnung**: Minimale Anzahl an Ausgleichszahlungen berechnen.
- **Zahlungen erfassen**: Markiere Schulden als beglichen.
- **PDF Export**: Lade eine Übersicht der Abrechnung als PDF herunter.
- **Kein Login**: Sofort loslegen, einfach Link teilen.
- **PWA**: Installierbar auf dem Smartphone.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Datenbank**: PostgreSQL + Prisma
- **Export**: jsPDF
- **Sprache**: TypeScript

## Installation & Entwicklung

1. Repository klonen:
   ```bash
   git clone https://github.com/LoggeL/fairteiler.git
   cd fairteiler
   ```

2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```

3. Umgebungsvariablen setzen:
   Erstelle eine `.env` Datei mit:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/fairteiler"
   ```

4. Datenbank initialisieren:
   ```bash
   npx prisma db push
   ```

5. Server starten:
   ```bash
   npm run dev
   ```

## Deployment auf Dokploy

1. In Dokploy einloggen (`dokploy.logge.top`).
2. Neues Projekt erstellen: "Fairteiler".
3. Neue Anwendung hinzufügen:
   - Source: GitHub (`LoggeL/fairteiler`)
   - Build Type: Dockerfile
4. PostgreSQL Datenbank in Dokploy erstellen.
5. `DATABASE_URL` in den Application Settings hinzufügen.
6. Domain `fairteiler.logge.top` hinzufügen.
7. Deploy!
