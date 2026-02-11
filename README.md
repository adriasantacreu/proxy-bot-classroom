# Proxy Bot Google Classroom (GAS) 🤖📚

> **Un proxy complet per a l'API de Google Classroom.**
> Gestiona cursos, tasques, notes, rúbriques i tutors des d'una única API intermèdia a Google Apps Script.

---

## ⚡ Accés Ràpid
*   🎮 **[Obrir Tester Web (index.html)](index.html)**: Un tauler de control interactiu per provar el bot sense programar.
*   📘 **[Documentació Tècnica (API.md)](API.md)**: Guia detallada de tots els endpoints, paràmetres i tipus de dades.

---

## 🚀 Motiu i Aplicabilitat

Aquest projecte neix de la necessitat d'interactuar amb Google Classroom des d'entorns externs (com bots de Telegram, aplicacions web, sistemes de gestió acadèmica pròpis, etc.) sense haver de lidiar amb la complexa autenticació OAuth2 de Google a cada client.

**Aplicabilitat en projectes reals:**
*   **Bots Docents:** Un bot de Telegram/Discord que permet als professors crear tasques ràpidament des del mòbil.
*   **Sincronització Acadèmica:** Connectar el Moodle o ClickEdu de l'escola amb Classroom per crear cursos i alumnes automàticament.
*   **Automatització d'Anuncis:** Programar anuncis setmanals o recordatoris d'examen automàtics.
*   **Generació de Butlletins:** Extreure notes de tots els alumnes i generar informes PDF personalitzats.

---

## 🌐 Publicació a GitHub Pages (Web de Test)

Pots activar la web de test (`index.html`) directament a GitHub:
1.  Ves a la pestanya **Settings** del teu repo.
2.  Busca la secció **Pages**.
3.  Tria la branca `main` (o `master`) i la carpeta `/ (root)`.
4.  La teva web **Tester** estarà disponible públicament a `https://<usuari>.github.io/<repo>/`.

---

## 🛠 Guia de Desplegament (Deployment Script)

Per posar en marxa aquest bot, necessites un projecte de Google Apps Script. Pots fer-ho manualment o utilitzant `clasp` (recomanat).

### Opció A: Desplegament Manual (Copy-Paste)

1.  Accedeix a [script.google.com](https://script.google.com/) i crea un **Nou Projecte**.
2.  Ves a **Configuració del Projecte** (⚙️) i marca la casella "Show 'appsscript.json' manifest file in editor".
3.  Copia el contingut del fitxer `appsscript.json` d'aquest repositori i substitueix el del teu editor. **Això és crític per als permisos!**
4.  Copia el contingut de `Código.js` al fitxer `Code.gs` de l'editor.
5.  Ves a **Serveis (+)** a l'esquerra, busca **Classroom API** i afegeix-lo (Versió v1).

### Opció B: Desplegament amb CLASP (Línia de comandes)

1.  Instal·la clasp: `npm install -g @google/clasp`
2.  Fes login: `clasp login`
3.  Crea un projecte: `clasp create --type webapp --title "Proxy Classroom Bot"`
4.  Puja els fitxers: `clasp push`
    *   Assegura't de pujar `appsscript.json` i `Código.js`.

### Configuració de Seguretat (CRÍTIC) 🔐

Per evitar que qualsevol persona pugui esborrar els teus cursos, protegim l'accés amb una clau secreta.

1.  Obre el projecte a l'editor web.
2.  Ves a **Configuració del Projecte (⚙️)** > **Propietats de l'script**.
3.  Afegeix una nova propietat:
    *   Clau: `API_KEY`
    *   Valor: `la_teva_contrasenya_super_secreta_aquí`

### Publicació com a Web App 🌐

1.  Fes clic al botó **Desplegar (Deploy)** > **Nou desplegament**.
2.  Selecciona tipus: **Aplicació web**.
3.  Configuració:
    *   **Descripció**: "Versió 1.0"
    *   **Executar com a**: **Jo** (User accessing) -> Això farà que el bot tingui els teus permisos de professor.
    *   **Qui té accés**: **Qualsevol** (Anyone) -> Això permet que el teu bot extern cridi a l'API, però la seguretat la gestionem nosaltres amb la `API_KEY`.
4.  Clica **Desplegar**.
5.  Copia la **URL de l'aplicació web** (`https://script.google.com/.../exec`). Aquesta és la teva API endpoint.

---

## 📖 Guia d'Ús Ràpida

Per a una referència completa de totes les accions, consulta **[API.md](API.md)** o utilitza el **[Tester Web](index.html)**.

Totes les peticions han de ser `POST` a la URL del teu script amb un cos JSON:
```json
{
  "key": "la_teva_clau",
  "action": "nom_accio",
  ...parametres
}
```

### Funcions Destacades ✨

#### 1. Crear Tasques amb Adjunts
La "Joia de la Corona". Permet crear tasques amb fitxers i vídeos en una sola crida.
**Important:** Els adjunts s'han de definir *al moment de crear*.

```json
{
  "action": "create_courseWork",
  "courseId": "12345",
  "title": "Tasca Final",
  "materials": [
    { "link": { "url": "https://wikipedia.org", "title": "Info" } },
    { "youtubeVideo": { "videoUrl": "...", "title": "Video" } }
  ]
}
```

#### 2. Matrícula Massiva
Pots invitar alumnes mitjançant el seu correu electrònic.
```json
{ "action": "invite_student", "courseId": "12345", "email": "alumne@escola.cat" }
```

---

## 🚫 Limitacions Tècniques (API Google)

### ❌ 1. Modificar Adjunts en Tasques Existents
L'API de Classroom permet modificar el títol, la descripció i l'estat d'una tasca existent (`patch`), però **NO permet afegir, treure o canviar els adjunts (materials)** un cop la tasca ha estat creada. Si ho intentes, rebràs un error `400: Non-supported update mask`.

**Solució**: Assegura't de posar tots els adjunts correctament **en el moment de la creació**.

### ❌ 2. Accions "Com a Alumne"
Aquest bot s'executa amb els permisos del professor. No pot "entregar tasques" simulant ser un alumne.

---

## 🔮 Futures Millores

*   **Cua de Peticions**: Sistema de retry automàtic per evitar errors de quota.
*   **Gestió d'Errors HTTP**: Retornar codis d'error HTTP reals (400, 401, 500) en lloc de JSON `{error: ...}` amb estat 200.

---

**Desenvolupat amb ❤️ i molta paciència amb l'API de Google.**
