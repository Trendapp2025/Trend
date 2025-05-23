# Trend - Applicazione per il tracciamento del sentiment di mercato

## Descrizione
Trend è un'applicazione web full-stack che permette agli utenti di tracciare, condividere e analizzare il sentiment di mercato su asset finanziari come azioni e criptovalute. Gli utenti possono registrarsi, esprimere le loro previsioni, guadagnare badge in base alla precisione e competere in una classifica mensile.

## Tecnologie utilizzate
- **Frontend**: React, TypeScript, Shadcn UI, TanStack Query, Zod
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL con Drizzle ORM
- **Email**: Integrazione con Brevo API

## Funzionalità principali
- Monitoraggio in tempo reale del sentiment di comunità
- Sistema di previsioni con valutazioni percentuali
- Badge mensili per predittori accurati
- Profili utente con storico badge e previsioni
- Pannello amministrativo
- Supporto multilingua (Italiano/Inglese)
- Tema chiaro/scuro

## Requisiti di installazione
1. Node.js v16 o superiore
2. PostgreSQL 14 o superiore
3. Account Brevo per servizi email (opzionale, ma raccomandato)

## Istruzioni per l'installazione

### Configurazione del database
```bash
# Creare un database PostgreSQL
createdb trend

# Impostare le variabili d'ambiente
export DATABASE_URL=postgresql://username:password@localhost:5432/trend
export SESSION_SECRET=your_session_secret
export BREVO_API_KEY=your_brevo_api_key
```

### Installazione dipendenze
```bash
# Installare le dipendenze
npm install

# Eseguire la migrazione del database
npm run db:push
```

### Avvio dell'applicazione
```bash
# Avviare il server di sviluppo
npm run dev

# Costruire per produzione
npm run build
npm start
```

## Struttura del progetto
- `/client` - Codice frontend React
- `/server` - API backend Express
- `/shared` - Tipi e schemi condivisi
- `/scripts` - Script di utilità

## Accesso all'applicazione
L'applicazione sarà disponibile su http://localhost:5000

L'utente amministratore predefinito è:
- Username: admin
- Password: password

## Funzionalità principali
- **Dashboard principale**: Visualizza gli asset con il loro sentiment attuale
- **Profilo utente**: Visualizza i badge e le previsioni dell'utente
- **Dettaglio asset**: Mostra informazioni dettagliate e consente di inserire previsioni
- **Pannello amministrativo**: Gestione utenti e monitoraggio del sistema
- **Supporto multilingua**: Cambia tra italiano e inglese
- **Tema chiaro/scuro**: Personalizza l'interfaccia utente

## Licenza
Tutti i diritti riservati.# Trend
