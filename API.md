# 📚 Documentació de l'API Proxy-Classroom 🤖

Aquesta pàgina detalla totes les accions disponibles en el Proxy Bot.

## 🔐 Autenticació i Base
Totes les peticions s'han d'enviar a la URL del teu desplegament (`Web App URL`).

*   **URL Base**: `https://script.google.com/macros/s/.../exec`
*   **Autenticació**: Totes les peticions han d'incloure el paràmetre `key` amb la clau API configurada a les propietats de l'script.

---

## 🟢 Accions de Lectura (GET)
Aquestes accions es poden executar directament al navegador enganxant la URL.

Format: `URL_BASE?action=NOM_ACCIO&key=LA_TEVA_CLAU&parametre=valor`

### 1. `list_courses`
Llista tots els cursos actius o provisionats on l'usuari (el bot) és professor.

*   **Paràmetres**: Cap.
*   **Exemple URL**: `.../exec?action=list_courses&key=abc`
*   **Resposta**: Array d'objectes [Course](https://developers.google.com/classroom/reference/rest/v1/courses).

### 2. `get_course`
Obté la informació detallada d'un curs específic.

*   **Paràmetres**:
    *   `courseId` (Obligatori): ID del curs.
*   **Exemple URL**: `.../exec?action=get_course&key=abc&courseId=123456`

### 3. `list_students` / `list_teachers`
Llista els usuaris d'un curs.

*   **Paràmetres**:
    *   `courseId` (Obligatori): ID del curs.
*   **Exemple URL**: `.../exec?action=list_students&key=abc&courseId=123456`

### 4. `list_courseWork`
Llista totes les tasques (Assignments) publicades, programades o esborranys.

*   **Paràmetres**:
    *   `courseId` (Obligatori): ID del curs.
*   **Exemple URL**: `.../exec?action=list_courseWork&key=abc&courseId=123456`
*   **Resposta**: Array d'objectes [CourseWork](https://developers.google.com/classroom/reference/rest/v1/courses.courseWork).

### 5. `list_materials`
Llista els materials de classe (recursos sense nota).

*   **Paràmetres**:
    *   `courseId` (Obligatori): ID del curs.
*   **Exemple URL**: `.../exec?action=list_materials&key=abc&courseId=123456`

### 6. `list_submissions`
Llista les entregues dels alumnes per a una tasca concreta (inclou notes).

*   **Paràmetres**:
    *   `courseId` (Obligatori): ID del curs.
    *   `courseWorkId` (Obligatori): ID de la tasca.
*   **Exemple URL**: `.../exec?action=list_submissions&key=abc&courseId=123&courseWorkId=456`

### 7. `get_user_profile`
Obté informació pública d'un usuari (nom, foto, email) a partir del seu ID o email.

*   **Paràmetres**:
    *   `userId` (Obligatori): Email o ID numèric de l'usuari.
*   **Exemple URL**: `.../exec?action=get_user_profile&key=abc&userId=alumne@escola.cat`

---

## 🟡 Accions de Creació (POST)
Aquestes accions modifiquen dades i han de ser peticions `POST` amb un cos JSON (`Content-Type: application/json`).

### 1. `create_course`
Crea un nou curs a Google Classroom.

*   **Cos de la Petició (JSON)**:
    ```json
    {
      "key": "abc",
      "action": "create_course",
      "name": "Nom del Curs",         // Obligatori
      "section": "Grup A",            // Opcional
      "ownerId": "me"                 // Opcional ("me" per defecte)
    }
    ```

### 2. `create_courseWork` (Tasques amb Adjunts) 💎
Aquesta és l'acció més potent. Permet crear una tasca completa amb títol, descripció, data, punts i fitxers adjunts.

*   **Cos de la Petició (JSON)**:
    ```json
    {
      "key": "abc",
      "action": "create_courseWork",
      "courseId": "123456",             // Obligatori
      "title": "Tasca Setmanal",        // Obligatori
      "description": "Llegiu el PDF i responeu.",
      "maxPoints": 100,
      "state": "PUBLISHED",             // PUBLISHED, DRAFT, SCHEDULED
      "workType": "ASSIGNMENT",         // ASSIGNMENT, SHORT_ANSWER_QUESTION, MULTIPLE_CHOICE_QUESTION
      "dueDate": { "year": 2024, "month": 12, "day": 31 }, // Opcional
      "dueTime": { "hours": 23, "minutes": 59 },           // Opcional
      "topicId": "123456",              // Opcional (ID del tema)
      "materials": [                    // Opcional: Llista d'adjunts
        { "link": { "url": "http://...", "title": "Imatge" } }, // Link
        { "driveFile": { "driveFile": { "id": "FILE_ID", "title": "Nom Fitxer" } } }, // Drive
        { "youtubeVideo": { "id": "VIDEO_ID", "title": "Títol Video" } } // YouTube
      ]
    }
    ```

### 3. `create_material`
Crea un recurs de material (apunts, lectures) sense qualificació.

*   **Cos de la Petició (JSON)**:
    ```json
    {
      "key": "abc",
      "action": "create_material",
      "courseId": "123456",
      "title": "Apunts Tema 1",
      "description": "Materials d'estudi.",
      "topicId": "123456",
      "materials": [ ... ] // Igual que a courseWork
    }
    ```

### 4. `create_announcement`
Publica un anunci al tauler de novetats (Stream).

*   **Cos de la Petició (JSON)**:
    ```json
    {
      "key": "abc",
      "action": "create_announcement",
      "courseId": "123456",
      "text": "Benvinguts al curs! 👋"
    }
    ```

### 5. `invite_student` / `invite_teacher`
Envia una invitació per correu electrònic per unir-se al curs.

*   **Cos de la Petició (JSON)**:
    ```json
    {
      "key": "abc",
      "action": "invite_student", // o invite_teacher
      "courseId": "123456",
      "email": "alumne@domini.cat"
    }
    ```

---

## 🟠 Accions de Modificació (POST) - Patch
Permeten editar elements existents.
**⚠️ LIMITACIÓ**: No es poden modificar, afegir ni eliminar adjunts (`materials`) en aquesta versió de l'API.

### 1. `patch_courseWork`
Modifica títol, descripció, estat, punts o tema d'una tasca.

*   **Cos de la Petició (JSON)**:
    ```json
    {
      "key": "abc",
      "action": "patch_courseWork",
      "courseId": "123456",
      "id": "789012",              // ID de la tasca
      "updateMask": "title,state", // Camps a actualitzar (separats per comes)
      "courseWork": {              // Objecte amb els nous valors
        "title": "Nou Títol Corregit",
        "state": "DRAFT"
      }
    }
    ```

### 2. `grade_submission`
Posa nota a una entrega d'alumne.

*   **Cos de la Petició (JSON)**:
    ```json
    {
      "key": "abc",
      "action": "grade_submission",
      "courseId": "123",
      "courseWorkId": "456",
      "id": "789",                 // ID de l'entrega (Submission ID)
      "submission": {
        "assignedGrade": 95,
        "draftGrade": 95
      }
    }
    ```

### 3. `return_submission`
Retorna la tasca a l'alumne (finalitza la correcció).

*   **Cos de la Petició (JSON)**:
    ```json
    {
      "key": "abc",
      "action": "return_submission",
      "courseId": "123",
      "courseWorkId": "456",
      "id": "789"
    }
    ```

---

## 🔴 Accions d'Eliminació (POST)

### 1. `delete_courseWork` / `delete_material` / `delete_announcement`
Esborra permanentment un element. Irreversible.

*   **Cos de la Petició (JSON)**:
    ```json
    {
      "key": "abc",
      "action": "delete_courseWork",
      "courseId": "123456",
      "id": "789012"
    }
    ```

### 2. `delete_student` / `delete_teacher`
Expulsa un membre del curs.

*   **Cos de la Petició (JSON)**:
    ```json
    {
      "key": "abc",
      "action": "delete_student",
      "courseId": "123456",
      "userId": "alumne@domini.cat" // O ID numèric
    }
    ```
