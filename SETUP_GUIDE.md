# EHC 2026 — Setup Guide
## Steg-for-steg bruksanvisning

---

## Del 1 — Supabase (database)

### Steg 1 — Opprett gratis Supabase-konto

1. Gå til **https://supabase.com**
2. Klikk **"Start your project"** (grønn knapp)
3. Logg inn med GitHub eller e-post
4. Klikk **"New project"**
5. Fyll inn:
   - **Name:** `ehc2026`
   - **Database Password:** velg et sterkt passord (lagre det et sted)
   - **Region:** velg `West EU (Ireland)` — nærmest Norge
6. Klikk **"Create new project"**
7. Vent ca. 1–2 minutter mens prosjektet opprettes

---

### Steg 2 — Opprett databasetabellen

1. I Supabase-dashbordet, klikk **"SQL Editor"** i venstremenyen
2. Klikk **"New query"**
3. Kopier og lim inn denne SQL-koden:

```sql
-- Opprett tabell for stage positions
CREATE TABLE stage_positions (
  stage_id    INTEGER PRIMARY KEY,
  positions   JSONB NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Tillat alle å lese og skrive (ingen innlogging nødvendig)
ALTER TABLE stage_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_read" ON stage_positions
  FOR SELECT USING (true);

CREATE POLICY "allow_all_write" ON stage_positions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_all_update" ON stage_positions
  FOR UPDATE USING (true);
```

4. Klikk **"Run"** (eller trykk Ctrl+Enter)
5. Du skal se: `Success. No rows returned`

---

### Steg 3 — Hent API-nøklene dine

1. Klikk **"Project Settings"** (tannhjul-ikon) i venstremenyen
2. Klikk **"API"**
3. Du ser to verdier du trenger:

```
Project URL:        https://xxxxxxxxxx.supabase.co
anon / public key:  eyJhbGciOiJIUzI1NiIsInR5cCI6....(lang streng)
```

4. Kopier begge — du trenger dem i neste steg

---

## Del 2 — Legg nøklene inn i appen

### Steg 4 — Rediger app.js

1. Åpne mappen `ehc2026` som du pakket ut
2. Åpne filen `app.js` i en teksteditor
   - **Mac:** TextEdit, eller høyreklikk → "Open With" → TextEdit
   - **Windows:** Notepad, eller høyreklikk → "Open with" → Notepad
3. Finn disse to linjene øverst i filen:

```javascript
const SUPABASE_URL  = '';  // paste your Project URL here
const SUPABASE_ANON = '';  // paste your anon/public key here
```

4. Lim inn verdiene dine slik (behold anførselstegnene!):

```javascript
const SUPABASE_URL  = 'https://xxxxxxxxxx.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6...';
```

5. Lagre filen (Ctrl+S eller Cmd+S)

---

## Del 3 — GitHub og GitHub Pages

### Steg 5 — Opprett GitHub-konto (hvis du ikke har en)

1. Gå til **https://github.com**
2. Klikk **"Sign up"**
3. Velg brukernavn, e-post og passord
4. Bekreft e-posten din

---

### Steg 6 — Opprett et nytt GitHub-repository

1. Logg inn på **https://github.com**
2. Klikk **"+"** øverst til høyre → **"New repository"**
3. Fyll inn:
   - **Repository name:** `ehc2026`
   - **Visibility:** `Public` ← viktig for GitHub Pages!
   - La alt annet stå som det er
4. Klikk **"Create repository"**

---

### Steg 7 — Last opp filene til GitHub

1. På den nye repo-siden, klikk **"uploading an existing file"**
   (eller klikk **"Add file"** → **"Upload files"**)
2. Dra hele innholdet i `ehc2026`-mappen inn i nettleservinduet
   **OBS:** Dra innholdet, ikke selve mappen
   Du skal se alle filene: `index.html`, `app.js`, `style.css`, osv.
3. Under **"Commit changes"** skriv: `Initial upload`
4. Klikk **"Commit changes"**

**Vent!** Bildene i `images/`-mappen må også lastes opp:
- Gå tilbake til repo-siden
- Klikk **"Add file"** → **"Upload files"**
- Åpne `images/`-mappen og velg alle 24 PNG-filer
- Commit: `Add stage images`

---

### Steg 8 — Aktiver GitHub Pages

1. I repo-en, klikk **"Settings"** (øverst i menyen)
2. Klikk **"Pages"** i venstremenyen
3. Under **"Source"** velg:
   - **Branch:** `main`
   - **Folder:** `/ (root)`
4. Klikk **"Save"**
5. Vent 1–2 minutter
6. GitHub viser deg URL-en din:
   ```
   https://DITTBRUKERNAVN.github.io/ehc2026/
   ```

**Test at det fungerer:** Åpne URL-en i nettleseren.
Du skal se EHC 2026-appen med grønn "Live · 0 stages loaded" status.

---

## Del 4 — Gi kompisen tilgang

### Steg 9 — Del URL-en med kompisen

1. Send kompisen denne URL-en:
   ```
   https://DITTBRUKERNAVN.github.io/ehc2026/
   ```
2. Han åpner den i nettleseren — ingen installasjon, ingen konto
3. Han kan se alle stagene med analysene dine

---

### Steg 10 — La kompisen redigere

Kompisen kan redigere uten å gjøre noe ekstra:

1. Han åpner URL-en
2. Klikker en stage-kortene
3. Klikker **✏ Edit positions**
4. Drar markørene til riktige posisjoner
5. Klikker **✓ Done editing**

Endringene lagres **automatisk** til databasen. Du ser dem innen 15 sekunder når du refresher.

---

## Del 5 — Bruk

### Slik redigerer du selv

1. Åpne `https://DITTBRUKERNAVN.github.io/ehc2026/`
2. Klikk en stage
3. Klikk **✏ Edit positions** (lilla knapp)
4. Dra de blå tallsirklene til riktige posisjoner på stage-bildet
5. Dra de røde NS-markørene til NS-target-posisjonene
6. Klikk **✓ Done editing**
7. Status viser **"Saved HH:MM:SS"** — ferdig!

### Markør-forklaringer

| Markør | Farge | Betyr |
|--------|-------|-------|
| Tall (1, 2, 3…) | Blå | Skytsteg i rekkefølge |
| ↺ | Oransje | Reload-punkt |
| NS | Rød | NS-target — IKKE skyt |
| Grønn pil | Grønn stiplet | Mover-aktivering (forblir synlig) |
| Rød pil | Rød stiplet | Mover som FORSVINNER |

### Navigasjon

| | |
|--|--|
| ← → piltaster | Forrige/neste stage |
| Esc | Lukk stage |
| Klikk kort | Åpne stage |

---

## Feilsøking

**"Not configured" i status-feltet**
→ Du har ikke lagt inn Supabase-nøklene i `app.js`. Gjenta Steg 4.

**"DB error — using local data"**
→ Sjekk at URL og nøkkel er riktig kopiert uten mellomrom.
→ Sjekk at tabellen ble opprettet (Steg 2).

**Bilder vises ikke**
→ Sørg for at `images/`-mappen er lastet opp til GitHub med alle 24 PNG-filer.

**Kompisen ser ikke endringene**
→ Siden oppdaterer automatisk hvert 15. sekund. Be ham vente litt eller trykke F5.

**GitHub Pages-siden er ikke oppdatert**
→ Etter en ny fil-upload til GitHub tar det 1–3 minutter før GitHub Pages oppdateres.

---

## Supabase gratis-grenser (mer enn nok)

| | |
|--|--|
| Database-størrelse | 500 MB (vi bruker < 1 MB) |
| API-kall | 2 millioner/måned |
| Brukere | Ubegrenset |
| Kostnad | Gratis for alltid |

---

*Laget for EHC 2026 · Classic Division · 10-round magazines*
