# Proxy Bot Google Classroom (GAS) 🤖📚

> **Un proxy complet per a l'API de Google Classroom.**
> Gestiona cursos, tasques, notes, rúbriques i tutors des d'una única API intermèdia a Google Apps Script.

---

## ⚡ Accés Ràpid
*   🎮 **[Obrir Tester Web (Demo Live)](https://adriasantacreu.github.io/proxy-bot-classroom/)**: Prova el bot en temps real des del teu navegador.
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

## 🛠 Guia de Desplegament (Deployment Script)

### 1. Preparació a Google Apps Script
1.  Accedeix a [script.google.com](https://script.google.com/) i crea un **Nou Projecte**.
2.  Copia el contingut de `Código.js` al fitxer `Code.gs`.
3.  Ves a **Serveis (+)**, busca **Classroom API** i afegeix-lo.
4.  **Important**: Ves a la roda dentada (Configuració) > Propietats de l'script i afegeix:
    *   **Property**: `API_KEY`
    *   **Value**: La teva clau (Ex: `pk_classroom_T9xR4mLw2vQ7nBs5jK8yF3hU6dP1aZ0c`)

### 2. Publicació com a Web App 🌐
1.  Clica a **Desplegar** > **Nou desplegament**.
2.  Tipus: **Aplicació web**.
3.  Executar com a: **Jo** (Me).
4.  Qui té accés: **Qualsevol** (**Anyone**). *Aquest pas és vital per al Tester Web.*

### 🛠️ Gestió Pro (Amb Clasp)
Si ets un usuari avançat i vols fer deploy des de la terminal sense morir en l'intent, consulta la **[Guia de Gestió de Desplegaments (DEPLOY_GUIDE.md)](DEPLOY_GUIDE.md)**. 

---

## 📖 Guia d'Ús Ràpida

Consulta **[API.md](API.md)** per veure tots els paràmetres i la secció de **Permisos** per entendre per què algunes accions (com crear cursos) poden fallar segons el teu compte. El format base és:
```json
{
  "key": "la_teva_clau",
  "action": "list_courses"
}
```

---

## 🚫 Limitacions Tècniques (API Google)
*   **Modificar Adjunts**: L'API de Google **no permet** afegir/eleminar materials a una tasca un cop creada. S'han de definir en el moment de la creació.

---

**Desenvolupat amb ❤️ i molta paciència amb l'API de Google.**
