# Proxy Bot Google Classroom (GAS) 🤖📚

> **Un proxy complet per a l'API de Google Classroom.**
> Gestiona cursos, tasques, notes, rúbriques i tutors des d'una única API intermèdia a Google Apps Script.

---

## 🚀 Característiques

Aquest script actua com a intermediari (proxy) segur entre les teves aplicacions i l'API de Google Classroom, permetent realitzar accions administratives i de gestió.

### 🌟 Funcionalitats principals

*   **📚 Gestió de cursos**: Crear, llistar, actualitzar i esborrar cursos.
*   **👥 Gestió de persones**:
    *   Llistar alumnes i professors.
    *   **Invitar** nous alumnes i professors via email.
    *   **Eliminar** membres d'un curs.
    *   Obtenir perfils d'usuari detallats.
*   **📝 Tasques i avaluació**:
    *   Crear tasques (Assignments), Preguntes i Materials.
    *   Modificar i esborrar contingut.
    *   **Avaluació**: Qualificar entregues i retornar tasques als alumnes.
    *   **Rúbriques**: Crear, llegir i editar criteris d'avaluació.
*   **📢 Comunicació**:
    *   Publicar i gestionar anuncis.
    *   Crear i organitzar temes (Topics).
*   **👨‍👩‍👧‍👦 Tutors legals (Guardians)**:
    *   Llistar i invitar pares/tutors legals.
    *   Eliminar vincles de tutors.

---

## 🛠 Instal·lació i configuració

### 1. Requisits previs
*   Un compte de Google (preferiblement Google Workspace for Education per a funcions avançades com Guardians).
*   Accés a [Google Apps Script](https://script.google.com/).

### 2. Desplegament
1.  Crea un nou projecte a Google Apps Script.
2.  Copia el contingut de `Código.js` al teu projecte.
3.  Copia el contingut de `appsscript.json` (Manifest) per assegurar que es sol·liciten tots els permisos necessaris.
4.  Activa el servei avançat de **Google Classroom API**:
    *   Ves a "Serveis" (+), busca "Classroom" i afegeix-lo (versió v1).

### 3. Configuració de seguretat 🔐
L'script utilitza una clau API personalitzada per evitar accessos no autoritzats.

1.  A l'editor d'Apps Script, ves a **Configuració del projecte** (roda dentada).
2.  Baixa fins a **Propietats de l'script**.
3.  Afegeix una nova propietat:
    *   **Nom**: `API_KEY`
    *   **Valor**: *(Escriu una contrasenya segura)*

### 4. Publicació
1.  Fes clic a **Desplegar** > **Nou desplegament**.
2.  Tipus: **Aplicació web**.
3.  Executar com: **Jo** (User accessing).
4.  Qui té accés: **Qualsevol** (Anyone) *(La seguretat es gestiona via API_KEY).*

---

## 📖 Documentació de l'API

Totes les peticions s'han de fer a la URL de l'Aplicació Web desplegada (`https://script.google.com/macros/s/.../exec`).

### Paràmetres comuns
*   `key`: La teva `API_KEY` secreta (Obligatori).
*   `action`: El nom de l'acció a executar (Obligatori).

### Llista d'accions disponibles

#### 🟢 Lectura (GET)
| Acció | Paràmetres | Descripció |
| :--- | :--- | :--- |
| `list_courses` | Cap | Llista cursos actius. |
| `get_course` | `courseId` | Info d'un curs. |
| `list_students` | `courseId` | Llista alumnes. |
| `list_teachers` | `courseId` | Llista professors. |
| `list_courseWork` | `courseId` | Llista tasques. |
| `list_announcements`| `courseId` | Llista anuncis. |
| `list_submissions` | `courseId`, `courseWorkId` | Llista entregues. |
| `list_topics` | `courseId` | Llista temes. |
| `list_materials` | `courseId` | Llista materials. |
| `get_user_profile` | `userId` | Perfil d'usuari. |
| `list_rubrics` | `courseId`, `courseWorkId` | Llista rúbriques. |
| `list_guardians` | `studentId` | Llista tutors. |

#### 🟡 Escriptura / creació (POST/GET)
| Acció | Paràmetres obligatoris | Descripció |
| :--- | :--- | :--- |
| `create_course` | `name` | Crea un curs nou. |
| `create_announcement`| `courseId`, `text` | Publica anunci. |
| `create_courseWork` | `courseId`, `title` | Crea tasca. |
| `create_topic` | `courseId`, `name` | Crea tema. |
| `create_material` | `courseId`, `title` | Crea material. |
| `create_rubric` | `courseId`, `courseWorkId` | Crea rúbrica. |
| `invite_student` | `courseId`, `email` | Invita alumne. |
| `invite_teacher` | `courseId`, `email` | Invita professor. |
| `invite_guardian` | `studentId`, `email` | Invita tutor. |

#### 🔴 Modificació / esborrat (POST/GET)
| Acció | Paràmetres | Descripció |
| :--- | :--- | :--- |
| `grade_submission` | `courseId`, `courseWorkId`, `id`, `submission` | Qualifica entrega. |
| `return_submission`| `courseId`, `courseWorkId`, `id` | Retorna tasca. |
| `patch_courseWork` | `courseId`, `id` | Edita tasca. |
| `delete_courseWork`| `courseId`, `id` | Esborra tasca. |
| `delete_course` | `id` | Esborra curs. |
| `delete_student` | `courseId`, `userId` | Elimina alumne. |

---

## ⚠️ Notes importants

*   **Quotes**: L'API de Google té quotes d'ús diàries.
*   **Permisos**: L'usuari que executa l'script ha de tenir els permisos adequats a Classroom (ser professor del curs, administrador del domini, etc.) per realitzar certes accions, especialment les relacionades amb Guardians o la creació de cursos nivell domini.
