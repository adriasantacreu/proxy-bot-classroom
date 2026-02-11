/**
 * Punt d'entrada per a peticions GET.
 */
function doGet(e) {
  return handleRequest(e);
}

/**
 * Punt d'entrada per a peticions POST.
 */
function doPost(e) {
  return handleRequest(e);
}

/**
 * Gestor principal de peticions.
 * Verifica la seguretat i delega l'acció a la funció corresponent.
 */
function handleRequest(e) {
  const API_KEY = PropertiesService.getScriptProperties().getProperty("API_KEY");
  const key = e.parameter.key;

  // 1. Verificació de seguretat
  if (!API_KEY) {
    return ContentService.createTextOutput(JSON.stringify({ error: "API_KEY no configurada a les propietats de l'script" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (key !== API_KEY) {
    return ContentService.createTextOutput(JSON.stringify({ error: "⛔ Accés denegat" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const action = e.parameter.action;
  if (!action) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Falta el paràmetre 'action'" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 2. Map d'accions (Dispatcher)
  // Això enllaça el nom de l'acció amb la seva funció
  const actions = {
    // Lectura bàsica
    "list_courses": listCourses,
    "get_course": getCourse,
    "list_students": listStudents,
    "list_teachers": listTeachers,
    "list_courseWork": listCourseWork,
    "list_announcements": listAnnouncements,
    "list_submissions": listSubmissions,
    "list_topics": listTopics,
    "list_materials": listMaterials,

    // Escriptura / Gestió
    "create_announcement": createAnnouncement,
    "create_courseWork": createCourseWork,
    "create_topic": createTopic,
    "create_material": createMaterial,

    // Gestió Avançada (Modificacions)
    "patch_courseWork": patchCourseWork,
    "update_courseWork": updateCourseWork,
    "delete_courseWork": deleteCourseWork,
    "delete_announcement": deleteAnnouncement,
    "patch_announcement": patchAnnouncement,
    "patch_topic": patchTopic,
    "delete_material": deleteMaterial,
    "patch_material": patchMaterial,
    "update_material": updateMaterial,

    // Qualificacions / Feedback
    "grade_submission": gradeSubmission,
    "return_submission": returnSubmission,

    // Persones (Invitacions / Expulsions)
    "get_user_profile": getUserProfile,
    "invite_student": inviteStudent,
    "invite_teacher": inviteTeacher,
    "delete_student": deleteStudent,
    "delete_teacher": deleteTeacher,

    // Administració de Cursos
    "create_course": createCourse,
    "update_course": updateCourse,
    "delete_course": deleteCourse,

    // Gestió Avançada (Rúbriques i Tutors)
    "list_rubrics": listRubrics,
    "create_rubric": createRubric,
    "delete_rubric": deleteRubric,
    "patch_rubric": patchRubric,
    "list_guardians": listGuardians,
    "invite_guardian": inviteGuardian,
    "delete_guardian": deleteGuardian,

    // Gestió de Fitxers i Organització
    "upload_to_classroom": uploadToClassroom,
    "upload_file": uploadFile,
    "move_to_topic": moveToTopic,

    // AI Helper
    "explain_json": explainWithAI
  };

  try {
    let result;
    if (actions[action]) {
      // Executa la funció corresponent passant-li els paràmetres 'e'
      result = actions[action](e);
    } else {
      throw new Error(`Acció desconeguda: ${action}`);
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      error: err.toString(),
      stack: err.stack
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Utilitza intel·ligència artificial per explicar un JSON de Classroom.
 */
function explainWithAI(e) {
  const GOOGLE_AI_KEY = PropertiesService.getScriptProperties().getProperty("GOOGLE_AI_KEY");
  if (!GOOGLE_AI_KEY) throw new Error("Falta GOOGLE_AI_KEY a les propietats de l'script");

  const data = getPayload(e);
  const jsonToExplain = data.json_content;
  if (!jsonToExplain) throw new Error("Falta 'json_content' per explicar");

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemma-2-27b-it:generateContent?key=${GOOGLE_AI_KEY}`;

  const prompt = `Actua com un assistent expert en Google Classroom per a professors no tècnics. 
  Explica en català de forma senzilla i amable què significa el següent resultat JSON d'una operació de l'API. 
  No usis tecnicismes si no és necessari. Si és un error, explica com solucionar-ho. 
  Resultat JSON: ${JSON.stringify(jsonToExplain)}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  };

  const response = UrlFetchApp.fetch(apiUrl, options);
  const result = JSON.parse(response.getContentText());

  return {
    explanation: result.candidates[0].content.parts[0].text
  };
}

// ==========================================
// SECCIÓ 1: LECTURA DE DADES
// ==========================================

/**
 * Llista tots els cursos actius.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @returns {object[]} Una llista d'objectes de curs.
 */
function listCourses(e) {
  return Classroom.Courses.list({ courseStates: ["ACTIVE", "PROVISIONED"] }).courses || [];
}

/**
 * Obté informació d'un curs concret.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @returns {object} L'objecte del curs.
 * @throws {Error} Si falta 'courseId'.
 */
function getCourse(e) {
  const courseId = e.parameter.courseId;
  if (!courseId) throw new Error("Falta 'courseId'");
  return Classroom.Courses.get(courseId);
}

/**
 * Llista els estudiants d'un curs.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @returns {object[]} Una llista d'objectes d'estudiant.
 * @throws {Error} Si falta 'courseId'.
 */
function listStudents(e) {
  const courseId = e.parameter.courseId;
  if (!courseId) throw new Error("Falta 'courseId'");
  return Classroom.Courses.Students.list(courseId).students || [];
}

/**
 * Llista els professors d'un curs.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @returns {object[]} Una llista d'objectes de professor.
 * @throws {Error} Si falta 'courseId'.
 */
function listTeachers(e) {
  const courseId = e.parameter.courseId;
  if (!courseId) throw new Error("Falta 'courseId'");
  return Classroom.Courses.Teachers.list(courseId).teachers || [];
}

/**
 * Llista les tasques (assignments/questions) d'un curs.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @returns {object[]} Una llista d'objectes de tasca.
 * @throws {Error} Si falta 'courseId'.
 */
function listCourseWork(e) {
  const courseId = e.parameter.courseId;
  if (!courseId) throw new Error("Falta 'courseId'");
  return Classroom.Courses.CourseWork.list(courseId).courseWork || [];
}

/**
 * Llista els anuncis del tablón d'un curs.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @returns {object[]} Una llista d'objectes d'anunci.
 * @throws {Error} Si falta 'courseId'.
 */
function listAnnouncements(e) {
  const courseId = e.parameter.courseId;
  if (!courseId) throw new Error("Falta 'courseId'");
  return Classroom.Courses.Announcements.list(courseId).announcements || [];
}

/**
 * Llista les entregues dels alumnes per a una tasca específica.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @param {string} e.parameter.courseWorkId - L'ID de la tasca.
 * @returns {object[]} Una llista d'objectes d'entrega d'estudiant.
 * @throws {Error} Si falta 'courseId' o 'courseWorkId'.
 */
function listSubmissions(e) {
  const courseId = e.parameter.courseId;
  const courseWorkId = e.parameter.courseWorkId;
  if (!courseId || !courseWorkId) throw new Error("Falta 'courseId' o 'courseWorkId'");
  return Classroom.Courses.CourseWork.StudentSubmissions.list(courseId, courseWorkId).studentSubmissions || [];
}

/**
 * Llista els temes (topics) d'un curs.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @returns {object[]} Una llista d'objectes de tema.
 * @throws {Error} Si falta 'courseId'.
 */
function listTopics(e) {
  const courseId = e.parameter.courseId;
  if (!courseId) throw new Error("Falta 'courseId'");
  return Classroom.Courses.Topics.list(courseId).topic || [];
}

/**
 * Llista els materials de classe (sense nota) d'un curs.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @returns {object[]} Una llista d'objectes de material.
 * @throws {Error} Si falta 'courseId'.
 */
function listMaterials(e) {
  const courseId = e.parameter.courseId;
  if (!courseId) throw new Error("Falta 'courseId'");
  return Classroom.Courses.CourseWorkMaterials.list(courseId).courseWorkMaterial || [];
}


// ==========================================
// SECCIÓ 2: CREACIÓ DE CONTINGUT (POST)
// ==========================================

/**
 * Crea un anunci en un curs.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @param {string} e.parameter.text - El text de l'anunci.
 * @param {object} [e.postData.contents] - Dades JSON amb 'courseId' i 'text'.
 * @returns {object} L'objecte d'anunci creat.
 * @throws {Error} Si falta 'courseId' o 'text'.
 */
function createAnnouncement(e) {
  const data = getPayload(e);
  const courseId = data.courseId || e.parameter.courseId;
  const text = data.text || e.parameter.text;

  if (!courseId || !text) throw new Error("Falta 'courseId' o 'text'");

  const announcement = { text: text, state: "PUBLISHED" };
  return Classroom.Courses.Announcements.create(announcement, courseId);
}

/**
 * Crea una tasca (courseWork) en un curs.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @param {string} e.parameter.title - El títol de la tasca.
 * @param {string} [e.parameter.description] - La descripció de la tasca.
 * @param {string} [e.parameter.workType="ASSIGNMENT"] - El tipus de tasca (ASSIGNMENT, SHORT_ANSWER_QUESTION, etc.).
 * @param {object} [e.postData.contents] - Dades JSON amb 'courseId', 'title', 'description', 'workType'.
 * @returns {object} L'objecte de tasca creat.
 * @throws {Error} Si falta 'courseId' o 'title'.
 */
function createCourseWork(e) {
  const data = getPayload(e);
  const courseId = data.courseId || e.parameter.courseId;
  const title = data.title || e.parameter.title;
  const description = data.description || e.parameter.description;
  const workType = data.workType || e.parameter.workType || "ASSIGNMENT";
  const topicId = data.topicId || e.parameter.topicId;
  const maxPoints = data.maxPoints || e.parameter.maxPoints;
  const materials = data.materials; // array of {link:{url,title}} or {driveFile:{driveFile:{id,title}}}
  const dueDate = data.dueDate; // {year, month, day}
  const dueTime = data.dueTime; // {hours, minutes}
  const state = data.state || "PUBLISHED";

  if (!courseId || !title) throw new Error("Falta 'courseId' o 'title'");

  const courseWork = {
    title: title,
    description: description,
    workType: workType,
    state: state
  };

  if (topicId) {
    courseWork.topicId = topicId;
  }
  if (maxPoints !== undefined && maxPoints !== null) {
    courseWork.maxPoints = Number(maxPoints);
  }
  if (materials && Array.isArray(materials)) {
    courseWork.materials = materials;
  }
  if (dueDate) {
    courseWork.dueDate = dueDate;
  }
  if (dueTime) {
    courseWork.dueTime = dueTime;
  }
  // Opcions per a MULTIPLE_CHOICE_QUESTION
  const choices = data.choices;
  if (choices && Array.isArray(choices) && workType === "MULTIPLE_CHOICE_QUESTION") {
    courseWork.multipleChoiceQuestion = { choices: choices };
  }
  // Flag per associar amb el developer (API)
  if (data.associatedWithDeveloper !== undefined) {
    courseWork.associatedWithDeveloper = data.associatedWithDeveloper;
  }

  return Classroom.Courses.CourseWork.create(courseWork, courseId);
}

/**
 * Crea un tema (topic) en un curs.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @param {string} e.parameter.name - El nom del tema.
 * @param {object} [e.postData.contents] - Dades JSON amb 'courseId' i 'name'.
 * @returns {object} L'objecte de tema creat.
 * @throws {Error} Si falta 'courseId' o 'name'.
 */
function createTopic(e) {
  const data = getPayload(e);
  const courseId = data.courseId || e.parameter.courseId;
  const name = data.name || e.parameter.name;
  if (!courseId || !name) throw new Error("Falta 'courseId' o 'name'");
  return Classroom.Courses.Topics.create({ name: name }, courseId);
}

/**
 * Crea un material de classe en un curs.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @param {string} e.parameter.title - El títol del material.
 * @param {string} [e.parameter.description] - La descripció del material.
 * @param {object} [e.postData.contents] - Dades JSON amb 'courseId', 'title', 'description'.
 * @returns {object} L'objecte de material creat.
 * @throws {Error} Si falta 'courseId' o 'title'.
 */
function createMaterial(e) {
  const data = getPayload(e);
  const courseId = data.courseId || e.parameter.courseId;
  const title = data.title || e.parameter.title;
  const description = data.description || e.parameter.description;
  const topicId = data.topicId || e.parameter.topicId;
  const materials = data.materials;
  const state = data.state || "PUBLISHED"; // Permetre DRAFT

  if (!courseId || !title) throw new Error("Falta 'courseId' o 'title'");

  const material = {
    title: title,
    description: description,
    state: state
  };

  if (topicId) {
    material.topicId = topicId;
  }

  if (materials && Array.isArray(materials)) {
    material.materials = materials;
  }

  return Classroom.Courses.CourseWorkMaterials.create(material, courseId);
}


// ==========================================
// SECCIÓ 3: GESTIÓ I MODIFICACIÓ
// ==========================================

/**
 * Actualitza parcialment una tasca (courseWork).
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @param {string} e.parameter.id - L'ID de la tasca.
 * @param {string} [e.parameter.updateMask="title,description,state"] - Camps a actualitzar.
 * @param {object} [e.postData.contents] - Dades JSON amb 'courseId', 'id', 'updateMask', i l'objecte 'courseWork' amb els camps a modificar.
 * @returns {object} L'objecte de tasca actualitzat.
 * @throws {Error} Si falta 'courseId' o 'id'.
 */
function patchCourseWork(e) {
  const data = getPayload(e);
  const courseId = data.courseId || e.parameter.courseId;
  const id = data.id || e.parameter.id;
  const updateMask = data.updateMask || e.parameter.updateMask || "title,description,state";
  const courseWork = data.courseWork || {};

  if (!courseId || !id) throw new Error("Falta 'courseId' o 'id'");
  return Classroom.Courses.CourseWork.patch(courseWork, courseId, id, { updateMask: updateMask });
}

/**
 * Elimina una tasca (courseWork) d'un curs.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @param {string} e.parameter.id - L'ID de la tasca.
 * @returns {object} Un objecte buit en cas d'èxit.
 * @throws {Error} Si falta 'courseId' o 'id'.
 */
function deleteCourseWork(e) {
  const courseId = e.parameter.courseId;
  const id = e.parameter.id;
  if (!courseId || !id) throw new Error("Falta 'courseId' o 'id'");
  return Classroom.Courses.CourseWork.remove(courseId, id);
}

/**
 * Elimina un anunci d'un curs.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @param {string} e.parameter.id - L'ID de l'anunci.
 * @returns {object} Un objecte buit en cas d'èxit.
 * @throws {Error} Si falta 'courseId' o 'id'.
 */
function deleteAnnouncement(e) {
  const courseId = e.parameter.courseId;
  const id = e.parameter.id;
  if (!courseId || !id) throw new Error("Falta 'courseId' o 'id'");
  return Classroom.Courses.Announcements.remove(courseId, id);
}

/**
 * Elimina un material de classe d'un curs.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @param {string} e.parameter.id - L'ID del material.
 * @returns {object} Un objecte buit en cas d'èxit.
 * @throws {Error} Si falta 'courseId' o 'id'.
 */
function deleteMaterial(e) {
  const courseId = e.parameter.courseId;
  const id = e.parameter.id;
  if (!courseId || !id) throw new Error("Falta 'courseId' o 'id'");
  return Classroom.Courses.CourseWorkMaterials.remove(courseId, id);
}

/**
 * Actualitza parcialment un material (courseWorkMaterials).
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @param {string} e.parameter.id - L'ID del material.
 * @param {string} [e.parameter.updateMask="title,description,state"] - Camps a actualitzar.
 * @param {object} [e.postData.contents] - Dades JSON amb 'courseId', 'id', 'updateMask', i l'objecte 'material' amb els camps a modificar.
 * @returns {object} L'objecte de material actualitzat.
 * @throws {Error} Si falta 'courseId' o 'id'.
 */
function patchMaterial(e) {
  const data = getPayload(e);
  const courseId = data.courseId || e.parameter.courseId;
  const id = data.id || e.parameter.id;
  const updateMask = data.updateMask || e.parameter.updateMask || "title,description,state";
  const material = data.material || {};

  if (!courseId || !id) throw new Error("Falta 'courseId' o 'id'");
  return Classroom.Courses.CourseWorkMaterials.patch(material, courseId, id, { updateMask: updateMask });
}

/**
 * Actualitza parcialment un anunci.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @param {string} e.parameter.id - L'ID de l'anunci.
 * @param {string} [e.parameter.updateMask="text,state"] - Camps a actualitzar.
 * @param {object} [e.postData.contents] - Dades JSON amb 'courseId', 'id', 'updateMask', i l'objecte 'announcement' amb els camps a modificar.
 * @returns {object} L'objecte d'anunci actualitzat.
 * @throws {Error} Si falta 'courseId' o 'id'.
 */
function patchAnnouncement(e) {
  const data = getPayload(e);
  const courseId = data.courseId || e.parameter.courseId;
  const id = data.id || e.parameter.id;
  const updateMask = data.updateMask || "text,state";
  const announcement = data.announcement || {};

  if (!courseId || !id) throw new Error("Falta 'courseId' o 'id'");
  return Classroom.Courses.Announcements.patch(announcement, courseId, id, { updateMask: updateMask });
}

/**
 * Actualitza parcialment un tema (topic).
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @param {string} e.parameter.id - L'ID del tema.
 * @param {string} [e.parameter.updateMask="name"] - Camps a actualitzar.
 * @param {object} [e.postData.contents] - Dades JSON amb 'courseId', 'id', 'updateMask', i l'objecte 'topic' amb els camps a modificar.
 * @returns {object} L'objecte de tema actualitzat.
 * @throws {Error} Si falta 'courseId' o 'id'.
 */
function patchTopic(e) {
  const data = getPayload(e);
  const courseId = data.courseId || e.parameter.courseId;
  const id = data.id || e.parameter.id;
  const updateMask = data.updateMask || "name";
  const topic = data.topic || {};

  if (!courseId || !id) throw new Error("Falta 'courseId' o 'id'");
  return Classroom.Courses.Topics.patch(topic, courseId, id, { updateMask: updateMask });
}


// ==========================================
// SECCIÓ 4: QUALIFICACIONS (GRADING)
// ==========================================

/**
 * Qualifica una entrega d'estudiant.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @param {string} e.parameter.courseWorkId - L'ID de la tasca.
 * @param {string} e.parameter.id - L'ID de l'entrega de l'estudiant.
 * @param {string} [e.parameter.updateMask="assignedGrade,draftGrade"] - Camps a actualitzar (p.ex., 'assignedGrade', 'draftGrade').
 * @param {object} [e.postData.contents] - Dades JSON amb 'courseId', 'courseWorkId', 'id', 'updateMask', i l'objecte 'submission' amb les notes.
 * @returns {object} L'objecte d'entrega d'estudiant actualitzat.
 * @throws {Error} Si falten 'courseId', 'courseWorkId' o 'id'.
 */
function gradeSubmission(e) {
  const data = getPayload(e);
  const courseId = data.courseId || e.parameter.courseId;
  const courseWorkId = data.courseWorkId || e.parameter.courseWorkId;
  const id = data.id || e.parameter.id;
  const updateMask = data.updateMask || "assignedGrade,draftGrade";
  const studentSubmission = data.submission || {};

  if (!courseId || !courseWorkId || !id) throw new Error("Falten ids (course, courseWork, submission)");
  return Classroom.Courses.CourseWork.StudentSubmissions.patch(studentSubmission, courseId, courseWorkId, id, { updateMask: updateMask });
}

/**
 * Retorna una entrega d'estudiant.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @param {string} e.parameter.courseWorkId - L'ID de la tasca.
 * @param {string} e.parameter.id - L'ID de l'entrega de l'estudiant.
 * @returns {object} L'objecte d'entrega d'estudiant retornat.
 * @throws {Error} Si falten 'courseId', 'courseWorkId' o 'id'.
 */
function returnSubmission(e) {
  const courseId = e.parameter.courseId;
  const courseWorkId = e.parameter.courseWorkId;
  const id = e.parameter.id;
  if (!courseId || !courseWorkId || !id) throw new Error("Falten ids");
  return Classroom.Courses.CourseWork.StudentSubmissions['return']({}, courseId, courseWorkId, id);
}


// ==========================================
// SECCIÓ 5: PERSONES (INVITACIONS/EXPULSIONS)
// ==========================================

/**
 * Obté el perfil d'un usuari.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.userId - L'ID de l'usuari (email o ID).
 * @returns {object} L'objecte de perfil d'usuari.
 * @throws {Error} Si falta 'userId'.
 */
function getUserProfile(e) {
  const userId = e.parameter.userId;
  if (!userId) throw new Error("Falta 'userId'");
  return Classroom.UserProfiles.get(userId);
}

/**
 * Convida un estudiant a un curs.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @param {string} e.parameter.email - L'adreça de correu electrònic de l'estudiant.
 * @returns {object} L'objecte d'invitació creat.
 * @throws {Error} Si falta 'courseId' o 'email'.
 */
function inviteStudent(e) {
  const courseId = e.parameter.courseId;
  const email = e.parameter.email;
  if (!courseId || !email) throw new Error("Falta 'courseId' o 'email'");
  const invitation = { userId: email, courseId: courseId, role: "STUDENT" };
  return Classroom.Invitations.create(invitation);
}

/**
 * Convida un professor a un curs.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @param {string} e.parameter.email - L'adreça de correu electrònic del professor.
 * @returns {object} L'objecte d'invitació creat.
 * @throws {Error} Si falta 'courseId' o 'email'.
 */
function inviteTeacher(e) {
  const courseId = e.parameter.courseId;
  const email = e.parameter.email;
  if (!courseId || !email) throw new Error("Falta 'courseId' o 'email'");
  const invitation = { userId: email, courseId: courseId, role: "TEACHER" };
  return Classroom.Invitations.create(invitation);
}

/**
 * Elimina un estudiant d'un curs.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @param {string} e.parameter.userId - L'ID de l'estudiant (email o ID).
 * @returns {object} Un objecte buit en cas d'èxit.
 * @throws {Error} Si falta 'courseId' o 'userId'.
 */
function deleteStudent(e) {
  const courseId = e.parameter.courseId;
  const userId = e.parameter.userId;
  if (!courseId || !userId) throw new Error("Falta 'courseId' o 'userId'");
  return Classroom.Courses.Students.remove(courseId, userId);
}

/**
 * Elimina un professor d'un curs.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @param {string} e.parameter.userId - L'ID del professor (email o ID).
 * @returns {object} Un objecte buit en cas d'èxit.
 * @throws {Error} Si falta 'courseId' o 'userId'.
 */
function deleteTeacher(e) {
  const courseId = e.parameter.courseId;
  const userId = e.parameter.userId;
  if (!courseId || !userId) throw new Error("Falta 'courseId' o 'userId'");
  return Classroom.Courses.Teachers.remove(courseId, userId);
}


// ==========================================
// SECCIÓ 6: ADMINISTRACIÓ DE CURSOS
// ==========================================

/**
 * Crea un nou curs.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.name - El nom del curs.
 * @param {string} [e.parameter.section] - La secció del curs.
 * @param {string} [e.parameter.ownerId="me"] - L'ID del propietari del curs.
 * @param {object} [e.postData.contents] - Dades JSON amb 'name', 'section', 'ownerId'.
 * @returns {object} L'objecte de curs creat.
 * @throws {Error} Si falta 'name'.
 */
function createCourse(e) {
  const data = getPayload(e);
  const name = data.name || e.parameter.name;
  const section = data.section || e.parameter.section;
  const ownerId = data.ownerId || e.parameter.ownerId || "me";

  if (!name) throw new Error("Falta 'name'");
  const course = { name: name, section: section, ownerId: ownerId, courseState: "ACTIVE" };
  return Classroom.Courses.create(course);
}

/**
 * Actualitza parcialment un curs.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.id - L'ID del curs.
 * @param {string} [e.parameter.updateMask="name,courseState"] - Camps a actualitzar (p.ex., 'name', 'courseState').
 * @param {object} [e.postData.contents] - Dades JSON amb 'id', 'updateMask', i l'objecte 'course' amb els camps a modificar.
 * @returns {object} L'objecte de curs actualitzat.
 * @throws {Error} Si falta 'id'.
 */
function updateCourse(e) {
  const data = getPayload(e);
  const id = data.id || e.parameter.id;
  const updateMask = data.updateMask || e.parameter.updateMask || "name";
  const course = data.course || {};

  if (!id) throw new Error("Falta 'id' del curs");
  return Classroom.Courses.patch(course, id, { updateMask: updateMask });
}

/**
 * Elimina un curs.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.id - L'ID del curs.
 * @returns {object} Un objecte buit en cas d'èxit.
 * @throws {Error} Si falta 'id'.
 */
function deleteCourse(e) {
  const id = e.parameter.id;
  if (!id) throw new Error("Falta 'id'");
  return Classroom.Courses.remove(id);
}


// ==========================================
// SECCIÓ 7: GESTIÓ AVANÇADA (RÚBRIQUES I TUTORS)
// ==========================================

/**
 * Llista les rúbriques associades a una tasca.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @param {string} e.parameter.courseWorkId - L'ID de la tasca.
 * @returns {object[]} Una llista d'objectes de rúbrica.
 * @throws {Error} Si falten 'courseId' o 'courseWorkId'.
 */
function listRubrics(e) {
  const courseId = e.parameter.courseId;
  const courseWorkId = e.parameter.courseWorkId;
  if (!courseId || !courseWorkId) throw new Error("Falta 'courseId' o 'courseWorkId'");
  return Classroom.Courses.CourseWork.Rubrics.list(courseId, courseWorkId).rubrics || [];
}

/**
 * Crea una rúbrica per a una tasca.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @param {string} e.parameter.courseWorkId - L'ID de la tasca.
 * @param {object[]} [e.postData.contents.criteria] - Una llista d'objectes de criteri per a la rúbrica.
 * @returns {object} L'objecte de rúbrica creat.
 * @throws {Error} Si falten 'courseId' o 'courseWorkId'.
 */
function createRubric(e) {
  const data = getPayload(e);
  const courseId = data.courseId || e.parameter.courseId;
  const courseWorkId = data.courseWorkId || e.parameter.courseWorkId;
  const criteria = data.criteria || [];

  if (!courseId || !courseWorkId) throw new Error("Falta 'courseId' o 'courseWorkId'");
  return Classroom.Courses.CourseWork.Rubrics.create({ criteria: criteria }, courseId, courseWorkId);
}

/**
 * Elimina una rúbrica d'una tasca.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @param {string} e.parameter.courseWorkId - L'ID de la tasca.
 * @param {string} e.parameter.id - L'ID de la rúbrica.
 * @returns {object} Un objecte buit en cas d'èxit.
 * @throws {Error} Si falten 'courseId', 'courseWorkId' o 'id'.
 */
function deleteRubric(e) {
  const courseId = e.parameter.courseId;
  const courseWorkId = e.parameter.courseWorkId;
  const id = e.parameter.id;
  if (!courseId || !courseWorkId || !id) throw new Error("Falta 'courseId', 'courseWorkId' o 'id'");
  return Classroom.Courses.CourseWork.Rubrics.remove(courseId, courseWorkId, id);
}

/**
 * Actualitza parcialment una rúbrica.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.courseId - L'ID del curs.
 * @param {string} e.parameter.courseWorkId - L'ID de la tasca.
 * @param {string} e.parameter.id - L'ID de la rúbrica.
 * @param {string} [e.parameter.updateMask="criteria"] - Camps a actualitzar.
 * @param {object} [e.postData.contents] - Dades JSON amb 'courseId', 'courseWorkId', 'id', 'updateMask', i l'objecte 'rubric' amb els camps a modificar.
 * @returns {object} L'objecte de rúbrica actualitzat.
 * @throws {Error} Si falten 'courseId', 'courseWorkId' o 'id'.
 */
function patchRubric(e) {
  const data = getPayload(e);
  const courseId = data.courseId || e.parameter.courseId;
  const courseWorkId = data.courseWorkId || e.parameter.courseWorkId;
  const id = data.id || e.parameter.id;
  const updateMask = data.updateMask || "criteria";
  const rubric = data.rubric || {};

  if (!courseId || !courseWorkId || !id) throw new Error("Falta 'courseId', 'courseWorkId' o 'id'");
  return Classroom.Courses.CourseWork.Rubrics.patch(rubric, courseId, courseWorkId, id, { updateMask: updateMask });
}

/**
 * Llista els tutors (guardians) d'un estudiant.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.studentId - L'ID de l'estudiant (email o ID).
 * @returns {object[]} Una llista d'objectes de tutor.
 * @throws {Error} Si falta 'studentId'.
 */
function listGuardians(e) {
  const studentId = e.parameter.studentId;
  if (!studentId) throw new Error("Falta 'studentId'");
  return Classroom.UserProfiles.Guardians.list(studentId).guardians || [];
}

/**
 * Convida un tutor per a un estudiant.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.studentId - L'ID de l'estudiant.
 * @param {string} e.parameter.email - L'adreça de correu electrònic del tutor.
 * @returns {object} L'objecte d'invitació de tutor creat.
 * @throws {Error} Si falta 'studentId' o 'email'.
 */
function inviteGuardian(e) {
  const studentId = e.parameter.studentId;
  const email = e.parameter.email;
  if (!studentId || !email) throw new Error("Falta 'studentId' o 'email'");
  return Classroom.UserProfiles.GuardianInvitations.create({ invitedEmailAddress: email }, studentId);
}

/**
 * Elimina un tutor d'un estudiant.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @param {string} e.parameter.studentId - L'ID de l'estudiant.
 * @param {string} e.parameter.guardianId - L'ID del tutor.
 * @returns {object} Un objecte buit en cas d'èxit.
 * @throws {Error} Si falten 'studentId' o 'guardianId'.
 */
function deleteGuardian(e) {
  const studentId = e.parameter.studentId;
  const guardianId = e.parameter.guardianId;
  if (!studentId || !guardianId) throw new Error("Falta 'studentId' o 'guardianId'");
  return Classroom.UserProfiles.Guardians.remove(studentId, guardianId);
}


// ==========================================
// SECCIÓ 8: GESTIÓ DE FITXERS I ORGANITZACIÓ
// ==========================================

/**
 * Puja un fitxer a Drive i el crea com a Material a Classroom.
 * @param {GoogleAppsScript.Events.DoPost} e - L'objecte de petició.
 * @param {string} courseId - ID del curs.
 * @param {string} title - Títol del material.
 * @param {string} base64Data - Contingut del fitxer en Base64.
 * @param {string} fileName - Nom del fitxer.
 * @param {string} [topicId] - ID del tema (opcional).
 * @param {string} [mimeType] - Tipus MIME (opcional, per defecte PDF).
 */
function uploadToClassroom(e) {
  const data = getPayload(e);
  const courseId = data.courseId || e.parameter.courseId;
  const title = data.title || e.parameter.title;
  const base64Data = data.base64Data;
  const fileName = data.fileName;
  const mimeType = data.mimeType || MimeType.PDF;
  const topicId = data.topicId || e.parameter.topicId;

  if (!courseId || !title || !base64Data || !fileName) {
    throw new Error("Falten paràmetres: courseId, title, base64Data, fileName");
  }

  // 1. Decodificar i crear fitxer a Drive
  const decodedBlob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName);
  const driveFile = DriveApp.createFile(decodedBlob);

  // 2. Crear el material a Classroom vinculant el fitxer
  const material = {
    title: title,
    state: "PUBLISHED",
    materials: [
      {
        driveFile: {
          driveFile: {
            id: driveFile.getId(),
            title: fileName
          }
        }
      }
    ]
  };

  if (topicId) {
    material.topicId = topicId;
  }

  return Classroom.Courses.CourseWorkMaterials.create(material, courseId);
}

/**
 * Puja un fitxer codificat en base64 a Google Drive i retorna la informació del fitxer.
 * Útil per obtenir l'ID del fitxer i després adjuntar-lo a tasques o materials.
 * @param {GoogleAppsScript.Events.DoPost} e - L'objecte de petició.
 * @param {string} base64Data - Dades del fitxer en base64.
 * @param {string} fileName - Nom del fitxer.
 * @param {string} [mimeType=application/pdf] - Tipus MIME del fitxer.
 * @returns {object} Informació del fitxer: id, name, url.
 */
function uploadFile(e) {
  var data = getPayload(e);
  var base64Data = data.base64Data;
  var fileName = data.fileName;
  var mimeType = data.mimeType || "application/pdf";

  if (!base64Data || !fileName) {
    throw new Error("Falta 'base64Data' o 'fileName'");
  }

  var decodedBlob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName);
  var driveFile = DriveApp.createFile(decodedBlob);

  return {
    id: driveFile.getId(),
    name: driveFile.getName(),
    url: driveFile.getUrl()
  };
}

/**
 * Mou una tasca o material a un tema específic.
 * @param {GoogleAppsScript.Events.DoPost} e - L'objecte de petició.
 * @param {string} courseId - ID del curs.
 * @param {string} courseWorkId - ID de la tasca.
 * @param {string} topicId - ID del tema destí.
 */
function moveToTopic(e) {
  const data = getPayload(e);
  const courseId = data.courseId || e.parameter.courseId;
  const courseWorkId = data.courseWorkId || data.id || e.parameter.courseWorkId || e.parameter.id;
  const topicId = data.topicId || e.parameter.topicId;

  if (!courseId || !courseWorkId) throw new Error("Falta courseId o courseWorkId");

  const updateMask = "topicId";
  const content = { topicId: topicId || "" }; // Si no hi ha topicId, el buidem (moure a capçalera)

  return Classroom.Courses.CourseWork.patch(content, courseId, courseWorkId, { updateMask: updateMask });
}



/**
 * Substitueix completament una tasca (courseWork).
 * Útil per afegir/treure materials via update (PUT).
 */
function updateCourseWork(e) {
  const data = getPayload(e);
  const courseId = data.courseId || e.parameter.courseId;
  const id = data.id || e.parameter.id;
  const courseWork = data.courseWork || {};

  if (!courseId || !id) throw new Error("Falta 'courseId' o 'id'");

  // Use PATCH with explicit updateMask
  const updateMask = "title,description,state,materials,maxPoints,workType,topicId,dueDate,dueTime,submissionModificationMode,assigneeMode";
  const url = `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${id}?updateMask=${updateMask}`;
  const options = {
    method: "PATCH",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
    payload: JSON.stringify(courseWork),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const json = JSON.parse(response.getContentText());

  if (response.getResponseCode() >= 400) {
    return { error: json.error || json, code: response.getResponseCode() };
  }
  return json;
}

/**
 * Actualitza completament un material (courseWorkMaterials) via REST API directe.
 * Això permet modificar adjunts quan la llibreria GAS falla.
 */
function updateMaterial(e) {
  const data = getPayload(e);
  const courseId = data.courseId || e.parameter.courseId;
  const id = data.id || e.parameter.id;
  const material = data.material || {};

  if (!courseId || !id) throw new Error("Falta 'courseId' o 'id'");

  // Use PATCH with explicit updateMask
  const updateMask = "title,description,state,materials,topicId";
  const url = `https://classroom.googleapis.com/v1/courses/${courseId}/courseWorkMaterials/${id}?updateMask=${updateMask}`;
  const options = {
    method: "PATCH",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
    payload: JSON.stringify(material),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const json = JSON.parse(response.getContentText());

  if (response.getResponseCode() >= 400) {
    return { error: json.error || json, code: response.getResponseCode() };
  }
  return json;
}


// ==========================================
// HELPERS
// ==========================================

/**
 * Extreu el body JSON de la petició si existeix, o retorna un objecte buit.
 * @param {GoogleAppsScript.Events.DoPost} e - L'objecte d'esdeveniment de la petició.
 * @returns {object} L'objecte JSON parsejat o un objecte buit.
 */
function getPayload(e) {
  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (ignore) {
      // Ignorar errors de parsing si el contingut no és JSON vàlid
    }
  }
  return {};
}