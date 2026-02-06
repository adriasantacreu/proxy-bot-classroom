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

### 3. Configuració de seguretat �
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
| `get_course` | `courseId` | Info detallada d'un curs. |
| `list_students` | `courseId` | Llista alumnes matriculats. |
| `list_teachers` | `courseId` | Llista professors. |
| `list_courseWork` | `courseId` | Llista tasques (Assignments). |
| `list_announcements`| `courseId` | Llista anuncis del tauler. |
| `list_submissions` | `courseId`, `courseWorkId` | Llista entregues d'alumnes. |
| `list_topics` | `courseId` | Llista temes (Topics). |
| `list_materials` | `courseId` | Llista materials (recursos). |
| `list_rubrics` | `courseId`, `courseWorkId` | Llista rúbriques d'una tasca. |
| `list_guardians` | `studentId` | Llista tutors d'un alumne. |
| `get_user_profile` | `userId` | Obté el perfil complet d'un usuari. |

#### 🟡 Creació (POST)
| Acció | Paràmetres Obligatoris | Descripció |
| :--- | :--- | :--- |
| `create_course` | `name` | Crea un nou curs. |
| `create_announcement`| `courseId`, `text` | Publica un anunci al tauler. |
| `create_courseWork` | `courseId`, `title` | Crea una tasca (Assignment). |
| `create_material` | `courseId`, `title` | Crea un material de recurs. |
| `create_topic` | `courseId`, `name` | Crea un nou tema. |
| `create_rubric` | `courseId`, `courseWorkId` | Crea una rúbrica d'avaluació. |
| `upload_to_classroom`| `courseId`, `title`, `base64Data`, `fileName` | Puja fitxer a Drive i crea Material. |
| `invite_student` | `courseId`, `email` | Envia invitació a alumne. |
| `invite_teacher` | `courseId`, `email` | Envia invitació a professor. |
| `invite_guardian` | `studentId`, `email` | Envia invitació a tutor legal. |

#### � Modificació i organització (POST)
| Acció | Paràmetres | Descripció |
| :--- | :--- | :--- |
| `update_course` | `id` | Actualitza dades del curs (ex: arxivar). |
| `patch_courseWork` | `courseId`, `id` | Modifica una tasca existent. |
| `patch_announcement` | `courseId`, `id` | Modifica el text d'un anunci. |
| `patch_topic` | `courseId`, `id` | Canvia el nom d'un tema. |
| `patch_rubric` | `courseId`, `courseWorkId`, `id` | Modifica criteris d'una rúbrica. |
| `move_to_topic` | `courseId`, `courseWorkId`, `topicId` | Mou una tasca dins d'un tema. |
| `grade_submission` | `courseId`, `courseWorkId`, `id`, `submission` | Posa nota a una entrega. |
| `return_submission`| `courseId`, `courseWorkId`, `id` | Retorna la tasca a l'alumne. |

#### 🔴 Esborrat (POST)
| Acció | Paràmetres | Descripció |
| :--- | :--- | :--- |
| `delete_course` | `id` | Esborra permanentment un curs. |
| `delete_courseWork`| `courseId`, `id` | Esborra una tasca. |
| `delete_announcement`| `courseId`, `id` | Esborra un anunci. |
| `delete_material` | `courseId`, `id` | Esborra un material. |
| `delete_rubric` | `courseId`, `courseWorkId`, `id` | Esborra una rúbrica. |
| `delete_student` | `courseId`, `userId` | Expulsa un alumne del curs. |
| `delete_teacher` | `courseId`, `userId` | Expulsa un professor. |
| `delete_guardian` | `studentId`, `guardianId` | Elimina un tutor legal. |

---

## ⚠️ Notes importants

*   **Quotes**: L'API de Google té quotes d'ús diàries.
*   **Permisos**: L'usuari que executa l'script ha de tenir els permisos adequats a Classroom (ser professor del curs, administrador del domini, etc.) per realitzar certes accions, especialment les relacionades amb Guardians o la creació de cursos nivell domini.
