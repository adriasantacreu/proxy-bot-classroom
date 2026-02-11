# 🤖 Context i Arquitectura del Projecte (AGENTS.md)

## 📝 Origen i Context
Aquest projecte ha estat generat mitjançant **Vibecoding**. Neix de la necessitat de crear una infraestructura robusta per configurar bots autònoms o semiautònoms que interactuïn amb Google Classroom.

### Evolució Tècnica
1.  **Intent inicial (MCP)**: El projecte va començar amb l'intent de crear un Model Context Protocol (MCP). Tot i que era una idea atractiva, la gestió de permisos i l'arquitectura de seguretat de Google feien que aquesta solució fos extremadament complexa i poc pràctica per a un entorn de bots distribuïts.
2.  **Solució actual (Proxy GAS)**: Es va optar per la creació d'aquest Proxy a Google Apps Script (GAS). Aquesta arquitectura permet centralitzar la gestió d'OAuth2 i permisos en un sol punt, oferint una API neta i accessible via Web App.

## 🏛️ Arquitectura i Decisions Clau (v55)
*   **Unified Params (`getParams`)**: Una de les grans dificultats va ser la inconsistència de com GAS rep les dades (URL params vs JSON body). Hem creat un helper que unifica ambdues fonts, fent que l'API sigui 100% robusta per a qualsevol client.
*   **Simplified Grading**: Vam haver de refer la lògica de qualificació per superar les limitacions de l'API de Classroom, passant d'un model de "patch" complex a una funció que gestiona automàticament els múltiples estats d'una nota (`draft` vs `assigned`).

## �️ Dificultats Superades
*   **Límit de Desplegaments**: Google Apps Script té un límit rígid de 20 desplegaments. Hem superat aquesta barrera implementant una metodologia de gestió de versions fixa (veure `DEPLOY_GUIDE.md`) que permet actualitzar el bot sense canviar la URL d'accés.
*   **Gestió de Permisos de Domini**: Moltes accions (crear cursos, convidar professors externs) fallaven per polítiques de Google Workspace Education. Hem documentat aquests casos a l'API.md per diferenciar clarament els errors de xarxa/codi dels de política de domini.
*   **Sincronització Local-Núvol**: L'ús de `clasp` ha estat vital per mantenir el control de versions a GitHub mentre es treballa en l'entorn tancat de Google.

## 🚀 Estat Actual
El projecte es troba en un estat estable amb totes les funcions estandarditzades. L'interfície web (`index.html`) s'ha anat adaptant per oferir tots els camps que el backend permet, garantint que el tester és una representació real del potencial del bot.

---
*Projecte tancat en la Versió 55 estable.* 🦾
