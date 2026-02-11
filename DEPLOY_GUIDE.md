# 🚀 Guia de Desplegament del Proxy Classroom (Sense morir en l'intent)

Aquesta guia detalla com gestionar els canvis en el codi de Google Apps Script (GAS) i com assegurar-te que la web el reconegui sense perdre el cap.

---

## 1. El flux de treball correcte (The "God Mode" Workflow)

Quan facis un canvi a `Código.js`, no basta amb fer un `clasp push`. Google Apps Script no actualitza l'URL de producció automàticament. Has de seguir aquests 3 passos:

1.  **Push**: Puja el codi al núvol.
2.  **Version**: Crea un "snapshot" immutable d'aquest codi.
3.  **Deploy**: Digues-li a l'URL de producció que ara ha d'apuntar a aquesta nova versió.

### Mitjançant la terminal (Recomanat):
```powershell
# 1. Pugen els fitxers
clasp push

# 2. Creem una nova versió (guarda el número que et doni, ex: 53)
clasp version "Descripció del canvi"

# 3. Actualitzem el desplegament existent (el que acaba en ...vAtw)
# L'argument -i és el DeploymentId. No canvia mai si ho fas així.
clasp deploy --versionNumber 53 --deploymentId AKfycbz5hvlbdd8vumKsAKQNrvwpxM4DUeHo1uMcAZE8vGKTfO4ZXnavqe4CEEGOqkTduMvAtw --description "Versió estable 53"
```

---

## 2. Com gestionar el límit de 20 desplegaments

Google només permet tenir **20 IDs de desplegament actius**. Si et surt l'error `Scripts may only have up to 20 versioned deployments`, has de netejar els vells que no facis servir.

### Com netejar:
1.  Llista els desplegaments: `clasp deployments`
2.  Identifica els IDs que NO siguin el teu principal.
3.  Esborra'ls: `clasp undeploy ID_A_BORRAR`

*Tip: Mai esborris el que acaba en `...vAtw` ni el que diu `@HEAD`.*

---

## 3. Com verificar quina versió està corrent realment

Si la web fa coses rares, potser està realitzant crides a una versió vella del codi que Google encara té en memòria.

1.  **El test de la veritat**: Afegeix temporalment una línia al `handleRequest`:
    ```javascript
    if (action === "ping") return { status: "ok", version: 53 };
    ```
2.  Fes el deploy (push + version + deploy).
3.  Crida a l'URL des del navegador: `...vAtw/exec?action=ping&key=LA_TEVA_KEY`.
4.  Si no et respon la versió 53, és que el deploy no s'ha propagat. **Espera 30 segons i torna a provar.**

---

## 4. Problemes comuns i solucions ràpides

### ❌ Error 401 / 403 (Permisos)
*   **Causa**: Has afegit un servei nou (ex: `Drive`) i no has autoritzat l'script.
*   **Solució**: Obre l'editor de GAS al navegador, executa qualsevol funció manualment i accepta els permisos que et demani el pop-up de Google.

### ❌ Error: "ReferenceError: X is not defined"
*   **Causa**: Molt comú al `handleRequest` quan esborres una funció però l'acció encara està al mapa d'accions (`const actions = { ... }`).
*   **Solució**: Revisa que totes les claus del mapa `actions` tinguin una funció real definida a sota.

### ❌ La web diu "Success" però no veig canvis al Classroom
*   **Causa**: Google triga uns segons a reflectir els canvis de l'API.
*   **Solució**: Espera 5 segons i refresca la pàgina oficial de Classroom.

---

## 5. Mantenir l'URL fix a la Web
L'URL del teu Proxy a la web és:
`https://script.google.com/macros/s/AKfycbz5hvlbdd8vumKsAKQNrvwpxM4DUeHo1uMcAZE8vGKTfO4ZXnavqe4CEEGOqkTduMvAtw/exec`

Si mai perds aquest ID, és el que surt al fitxer `index.html` dins del camp `apiUrl`. **Mentre facis servir `clasp deploy -i ID`, aquest URL no canviarà mai.** 

---
*Manual creat per Antigravity per al futur jo de l'usuari.* 👨‍🏫🛠️
