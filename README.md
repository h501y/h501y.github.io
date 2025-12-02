# 📱 Magic Card Collection - Web App

Web application mobile-first per visualizzare la collezione di carte Magic: The Gathering.

🔗 **Live App**: [https://h501y.github.io/](https://h501y.github.io/)

## 🎯 Features

- ✅ **Solo lettura** - Visualizza e cerca carte senza modifiche
- ✅ **Mobile-first** - Ottimizzato per smartphone e tablet
- ✅ **PWA completa** - Installabile come app, funziona offline
- ✅ **Filtri completi** - Tutti i filtri dell'app desktop
- ✅ **Design Cosmic** - Palette colori personalizzata
- ✅ **Performance** - Build 166 KB (52 KB gzipped)
- ✅ **Smart caching** - Network-first per dati, cache-first per asset
- ✅ **Auto-deploy** - GitHub Actions per deploy automatico
- ✅ **HTTPS** - Hosting sicuro gratuito su GitHub Pages

## 🚀 Setup locale

### Installazione dipendenze

```bash
npm install
```

### Sviluppo locale

```bash
npm run dev
```

L'app sarà disponibile su `http://localhost:5173`

### Build per produzione

```bash
npm run build
```

I file statici saranno generati nella cartella `dist/`

## 📦 Deploy su GitHub Pages

### ⚡ Deploy automatico con GitHub Actions

Ogni **push su `main`** triggera automaticamente:
1. Incremento cache version del service worker
2. Build di produzione con type-check
3. Deploy su branch `gh-pages`
4. Pubblicazione su GitHub Pages (2-3 minuti)

**Workflow**: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

### Deploy manuale (alternativa)

```bash
npm run deploy
```

Questo comando locale esegue gli stessi step del workflow automatico.

### Prima volta - Setup GitHub Pages

1. Vai su **Settings** → **Pages** nel repository
2. Source: **Deploy from a branch**
3. Branch: **gh-pages** → **/ (root)**
4. Save

L'app sarà disponibile su: `https://h501y.github.io/`

## 📱 Aggiornamento collezione

Quando aggiungi nuove carte:

1. **Desktop app** → Click "📱 Export for Web"
2. Copia il JSON esportato in `public/collection-data.json`
3. Deploy:
   ```bash
   npm run deploy
   ```
4. App aggiornata su GitHub Pages in 2-3 minuti

## 🛠️ Tecnologie

- **React 18.3.1** + TypeScript 5.7.2
- **Vite 6.4.1** - Build tool ultra-veloce
- **Tailwind CSS 3.4.17** - Utility-first CSS
- **GitHub Pages** - Hosting gratuito con HTTPS
- **gh-pages** - Deploy automatico

## 📁 Struttura progetto

```
h501y.github.io/
├── public/
│   └── collection-data.json    # Dati collezione (da aggiornare)
├── src/
│   ├── components/            # Componenti UI
│   │   ├── Sidebar.tsx        # Sidebar con filtri
│   │   ├── CardGrid.tsx       # Griglia carte
│   │   ├── Accordion.tsx      # Sezioni collassabili
│   │   └── filters/           # Componenti filtri
│   ├── hooks/
│   │   └── useCollection.ts   # Logic filtri e dati
│   ├── styles/
│   │   └── theme.css          # Cosmic theme
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   ├── App.tsx                # Componente principale
│   └── main.tsx               # Entry point
├── dist/                       # Build production (git-ignored)
├── node_modules/               # Dipendenze (git-ignored)
├── package.json
├── vite.config.ts
├── .gitignore
└── README.md
```

## 🎨 Filtri disponibili

- **Nome & Testo** - Ricerca per nome carta o testo Oracle
- **Colori** - Filtro per colori (including/exactly/at most)
- **Commander Identity** - Filtro per identità colore
- **Tipo** - Ricerca per tipo carta (Creature, Instant, etc.)
- **Rarità** - Mythic, Rare, Uncommon, Common
- **Espansione** - Filtro per set specifico
- **Tag** - Filtro per tag personalizzati
- **Costo Mana** - Ricerca per simboli mana specifici
- **Statistiche** - CMC, Forza, Costituzione con operatori

## 🔒 Sicurezza

- ✅ HTTPS automatico (GitHub Pages)
- ✅ App completamente statica (zero backend)
- ✅ Nessun dato sensibile esposto
- ✅ Client-side filtering (privacy-first)
- ✅ Nessun tracking o analytics

## 📝 Note

- Il file `collection-data.json` è pubblico (parte del repo)
- Funziona offline dopo il primo caricamento (browser cache)
- Compatibile con tutti i browser moderni
- Deploy automatico ad ogni `npm run deploy`

## ⚖️ Legal / Fan Content Policy

Questo progetto è **Fan Content non ufficiale** permesso dalla [Wizards of the Coast Fan Content Policy](https://company.wizards.com/en/legal/fancontentpolicy).

**Non è approvato/sponsorizzato da Wizards of the Coast.**
Parti dei materiali utilizzati sono proprietà di Wizards of the Coast.
©Wizards of the Coast LLC.

- ✅ Progetto gratuito e open source
- ✅ Non commerciale (nessun guadagno/monetizzazione)
- ✅ Solo per uso personale e gestione collezione
- ✅ Rispetta copyright e trademark di WotC

## 📄 Versione

v1.0.0 - Initial Release

---

Generato con ❤️ per la gestione della collezione Magic
