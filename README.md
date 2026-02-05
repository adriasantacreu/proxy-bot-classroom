# Proxy Bot Google Classroom (GAS) 🤖📚

> **Un "God Mode" proxy para la API de Google Classroom.**
> Gestiona cursos, tareas, notas, rúbricas y tutores desde una única API intermedia en Google Apps Script.

---

## 🚀 Característiques

Aquest script actua com a intermediari (proxy) segur entre les teves aplicacions i l'API de Google Classroom, permetent realitzar pràcticament **qualsevol acció administrativa** possible.

### 🌟 Capacitats Principals ("God Mode")

*   **📚 Gestió de Cursos**: Crear, llistar, arxivar i esborrar cursos complets.
*   **👥 Gestió de Persones**:
    *   Llistar alumnes i professors.
    *   **Invitar** nous alumnes i professors via email.
    *   **Expulsar** membres d'un curs.
    *   Obtenir perfils d'usuari detallats.
*   **📝 Tasques i Avaluació**:
    *   Crear tareas (Assignments), Preguntes i Materials.
    *   Modificar i esborrar qualsevol contingut.
    *   **Posar Notes** (Grading) i retornar tasques.
    *   **Rúbriques**: Crear, llegir i editar criteris d'avaluació complexos.
*   **📢 Comunicació**:
    *   Publicar i gestionar anuncis al tauler.
    *   Crear i organitzar Temes (Topics).
*   **👨‍👩‍👧‍👦 Tutores (Guardians)**:
    *   Llistar i invitar pares/tutors legals.
    *   Eliminar vincles de tutors.

---

## 🛠 Instal·lació i Configuració

### 1. Requisits Previs
*   Un compte de Google (preferiblement Google Workspace for Education per a funcions avançades com Guardians).
*   Accés a [Google Apps Script](https://script.google.com/).

### 2. Desplegament
1.  Crea un nou projecte a Google Apps Script.
2.  Copia el contingut de `Código.js` al teu projecte.
3.  Activa el servei avançat de **Google Classroom API**:
    *   Ves a "Serveis" (+), busca "Classroom" i afegeix-lo (v1).

### 3. Configuració de Seguretat 🔐
El script utilitza una clau API personalitzada per evitar accessos no autoritzats.

1.  A l'editor de Apps Script, ves a **Configuració del Projecte** (roda dentada).
2.  Baixa fins a **Propietats de l'Script**.
3.  Afegeix una nova propietat:
    *   **Nom**: `API_KEY`
    *   **Valor**: *(Inventa't una contrasenya segura, ex: `LaMevaSuperClauSecreta2026`)*

### 4. Publicació
1.  Fes clic a **Desplegar** > **Nou desplegament**.
2.  Tipus: **Aplicació web**.
3.  Executar com: **Jo** (User accessing).
4.  Qui té accés: **Qualsevol** (Anyone) *(La seguretat la gestionem nosaltres via API_KEY).*

---

## 📖 Documentació de l'API

Totes les peticions s'han de fer a la URL del teu Web App desplegat (`https://script.google.com/macros/s/.../exec`).

### Paràmetres Comuns
*   `key`: La teva `API_KEY` secreta (Obligatori).
*   `action`: El nom de l'acció a executar (Obligatori).

### Llista d'Accions Disponibles

#### 🟢 Lectura (GET)
| Acció | Paràmetres | Descripció |
| :--- | :--- | :--- |
| `list_courses` | Cap | Llista cursos actius. |
| `get_course` | `courseId` | Info d'un curs. |
| `list_students` | `courseId` | Llista alumnes. |
| `list_teachers` | `courseId` | Llista profes. |
| `list_courseWork` | `courseId` | Llista tasques. |
| `list_announcements`| `courseId` | Llista anuncis. |
| `list_submissions` | `courseId`, `courseWorkId` | Llista entregues. |
| `list_topics` | `courseId` | Llista temes. |
| `list_materials` | `courseId` | Llista materials. |
| `get_user_profile` | `userId` | Perfil d'usuari. |
| `list_rubrics` | `courseId`, `courseWorkId` | Llista rúbriques. |
| `list_guardians` | `studentId` | Llista tutors. |

#### 🟡 Escriptura / Creació (POST/GET)
| Acció | Paràmetres Obligatoris | Descripció |
| :--- | :--- | :--- |
| `create_course` | `name` | Crea un curs nou. |
| `create_announcement`| `courseId`, `text` | Publica anunci. |
| `create_courseWork` | `courseId`, `title` | Crea tasca. |
| `create_topic` | `courseId`, `name` | Crea tema. |
| `create_material` | `courseId`, `title` | Crea material. |
| `create_rubric` | `courseId`, `courseWorkId` | Crea rúbrica. |
| `invite_student` | `courseId`, `email` | Invita alumne. |
| `invite_teacher` | `courseId`, `email` | Invita profe. |
| `invite_guardian` | `studentId`, `email` | Invita tutor. |

#### 🔴 Modificació / Esborrat (POST/GET)
| Acció | Paràmetres | Descripció |
| :--- | :--- | :--- |
| `grade_submission` | `courseId`, `courseWorkId`, `id`, `submission` | Posa nota. |
| `return_submission`| `courseId`, `courseWorkId`, `id` | Retorna tasca. |
| `patch_courseWork` | `courseId`, `id` | Edita tasca. |
| `delete_courseWork`| `courseId`, `id` | Esborra tasca. |
| `delete_course` | `id` | Esborra curs. |
| `delete_student` | `courseId`, `userId` | Expulsa alumne. |

*(Consulta el codi font per veure tots els paràmetres opcionals i detalls tècnics)*

---

## ⚠️ Notes Importants

*   **Límits de Google**: L'API de Google té quotes diàries. No facis milers de peticions per segon.
*   **Permisos**: L'usuari que executa el script ha de tenir els permisos adequats a Classroom (ser professor del curs, administrador, etc.) per realitzar certes accions.

---
Creat amb ❤️ i molta IA.
