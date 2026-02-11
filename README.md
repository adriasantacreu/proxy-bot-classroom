# Proxy Bot Google Classroom (GAS) 🤖📚

> **Un proxy complet per a l'API de Google Classroom.**
> Gestiona cursos, tasques, notes, rúbriques i tutors des d'una única API intermèdia a Google Apps Script.

---

## ⚡ Accés Ràpid
*   🎮 **[Obrir Tester Web (Demo Live)](https://adriasantacreu.github.io/proxy-bot-classroom/)**: Prova el bot en temps real des del teu navegador.
*   📘 **[Documentació Tècnica (API.md)](API.md)**: Guia detallada de tots els endpoints, paràmetres i tipus de dades.

---

## 🚀 Context i Origen
Aquest projecte és producte de la mentalitat **Vibecoding**. Neix d'una necessitat real: crear una infraestructura robusta per configurar **bots autònoms o semiautònoms** que puguin gestionar Google Classroom de manera eficient.

### Per què un Proxy a GAS?
Originalment, es va intentar implementar aquesta solució com un **Model Context Protocol (MCP)**. Tot i que era la idea més puntera tecnològicament, la realitat de Google (gestió de permisos, autenticació OAuth2 i protecció de dominis educatius) ho feia extremadament complicat i poc àgil. 

Per això, vam optar per aquest **Proxy a Google Apps Script (GAS)**, que ens permet:
1.  Centralitzar la comunicació amb Google des del propi entorn de Google.
2.  Oferir una API neta i accessible des de qualsevol entorn extern.
3.  Simplificar dràsticament la gestió de permisos per als bots finals.

---

## 🛠️ Aplicabilitat en projectes reals
*   **Bots Docents Autònoms:** Bots que poden rebre ordres de llenguatge natural i executar-les a Classroom.
*   **Sincronització Acadèmica:** Connectar entorns externs amb Classroom evitant la complexitat d'OAuth a cada microservei.
*   **Automatització Docent:** Programació massiva d'anuncis o gestió de notes sense intervenció humana constant.

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
