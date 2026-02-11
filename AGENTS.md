# 🤖 Agent Specialized Technical Guide (AGENTS.md)

Aquest fitxer conté instruccions tècniques crítiques per a futurs agents d'IA. Ignora la narrativa i centra't en la implementació.

## 🏛️ Arquitectura del Motor (v55)
*   **Dispatcher (`handleRequest`)**: És el cor del sistema. No afegeixis noves rutes directes al `doPost`, afegeix-les al mapa `actions`.
*   **Helper `getParams(e)`**: **ÚS OBLIGATORI**. Aquesta funció unifica paràmetres de l'URL (`e.parameter`) i del body JSON (`e.postData`). Qualsevol funció nova ha d'utilitzar-lo per extreure IDs o dades.
*   **Grading System**: La funció `gradeSubmission` ha estat simplificada. No intentis fer el "patch" manual de `draftGrade` i `assignedGrade` per separat tret que hi hagi un error de permisos; la funció ja gestiona la conversió a número i el doble enviament.

## 🛠️ Procediments Tècnics
*   **Desplegament**: El repositori està configurat amb `clasp`. No facis desplegaments nous a cegues. Utilitza sempre:
    ```powershell
    clasp push
    clasp version "Descripció"
    clasp deploy --versionNumber X --deploymentId [ID_ESTABLE]
    ```
    L'ID estable és: `AKfycbz5hvlbdd8vumKsAKQNrvwpxM4DUeHo1uMcAZE8vGKTfO4ZXnavqe4CEEGOqkTduMvAtw`.
*   **Límit de Google**: Estem gestionant el límit de 20 desplagaments. Si l'usuari demana un desplagament nou, verifica primer quants n'hi ha actius amb `clasp deployments`.

## ⚠️ "Gotchas" i Errors Coneguts
*   **403 Forbidden**: Molts errors de permisos són de Google Workspace, no de codi. No intentis "arreglar" el codi si l'error és de política de domini.
*   **Eliminació de Cursos**: Només es poden esborrar (`delete`) si prèviament s'han marcat com a `ARCHIVED` via `patch`.
*   **Gestió de Temes**: Recentment hem afegit suport complet per a `topicId` a tasques i materials. Verifica sempre que el tema existeix abans d'assignar-lo.

---
*Informació tècnica actualitzada per a la Versió 55 estable.* 🦾
