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
 */
function handleRequest(e) {
  const API_KEY = PropertiesService.getScriptProperties().getProperty("API_KEY");
  const params = getParams(e);
  const key = params.key;
  const action = params.action;

  Logger.log(`Action: ${action}, Params: ${JSON.stringify(params)}`);

  // 1. Verificació de seguretat
  if (!API_KEY) {
    return ContentService.createTextOutput(JSON.stringify({ error: "API_KEY no configurada a les propietats de l'script" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (key !== API_KEY) {
    return ContentService.createTextOutput(JSON.stringify({ error: "⛔ Accés denegat: Key incorrecta" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (!action) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Falta el paràmetre 'action'" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 2. Map d'accions
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
    "delete_topic": deleteTopic,
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
    "move_to_topic": moveToTopic
  };

  try {
    if (actions[action]) {
      const result = actions[action](e);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      throw new Error(`Acció desconeguda: ${action}`);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      error: err.toString(),
      details: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Helper per obtenir tots els paràmetres (URL + Body)
 */
function getParams(e) {
  const params = {};
  // Copiar paràmetres de la URL
  if (e.parameter) {
    for (let key in e.parameter) {
      params[key] = e.parameter[key];
    }
  }
  // Copiar dades del Body JSON
  const data = getPayload(e);
  for (let key in data) {
    params[key] = data[key];
  }
  return params;
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
  const params = getParams(e);
  const courseId = params.courseId;
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
  const params = getParams(e);
  const courseId = params.courseId;
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
  const params = getParams(e);
  const courseId = params.courseId;
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
  const params = getParams(e);
  const courseId = params.courseId;
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
  const params = getParams(e);
  const courseId = params.courseId;
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
  const params = getParams(e);
  const courseId = params.courseId;
  const courseWorkId = params.courseWorkId;
  if (!courseId || !courseWorkId) throw new Error("Faltes IDs (courseId o courseWorkId)");
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
  const params = getParams(e);
  const courseId = params.courseId;
  const text = params.text;

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
  const params = getParams(e);
  const courseId = params.courseId;
  const title = params.title;
  const description = params.description;
  const workType = params.workType || "ASSIGNMENT";
  const topicId = params.topicId;
  const maxPoints = params.maxPoints;
  const materials = params.materials;
  const dueDate = params.dueDate;
  const dueTime = params.dueTime;
  const state = params.state || "PUBLISHED";

  if (!courseId || !title) throw new Error("Falta 'courseId' o 'title'");

  const courseWork = {
    title: title,
    description: description,
    workType: workType,
    state: state
  };

  if (topicId) courseWork.topicId = topicId;
  if (maxPoints !== undefined && maxPoints !== null) courseWork.maxPoints = Number(maxPoints);
  if (materials && Array.isArray(materials)) courseWork.materials = materials;
  if (dueDate) courseWork.dueDate = dueDate;
  if (dueTime) courseWork.dueTime = dueTime;

  const choices = params.choices;
  if (choices && Array.isArray(choices) && workType === "MULTIPLE_CHOICE_QUESTION") {
    courseWork.multipleChoiceQuestion = { choices: choices };
  }
  if (params.associatedWithDeveloper !== undefined) {
    courseWork.associatedWithDeveloper = params.associatedWithDeveloper;
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
  const params = getParams(e);
  const courseId = params.courseId;
  const name = params.name;
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
  const params = getParams(e);
  const courseId = params.courseId;
  const title = params.title;
  const description = params.description;
  const topicId = params.topicId;
  const materials = params.materials;
  const state = params.state || "PUBLISHED";

  if (!courseId || !title) throw new Error("Falta 'courseId' o 'title'");

  const material = {
    title: title,
    description: description,
    state: state
  };

  if (topicId) material.topicId = topicId;
  if (materials && Array.isArray(materials)) material.materials = materials;

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
  const params = getParams(e);
  const courseId = params.courseId;
  const id = params.id;
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
  const params = getParams(e);
  const courseId = params.courseId;
  const id = params.id;
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
  const params = getParams(e);
  const courseId = params.courseId;
  const id = params.id;
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
  const params = getParams(e);
  const courseId = params.courseId;
  const id = params.id;
  const updateMask = params.updateMask || "title,description,state";
  const material = params.material || {};

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
  const params = getParams(e);
  const courseId = params.courseId;
  const id = params.id;
  const updateMask = params.updateMask || "text,state";
  const announcement = params.announcement || {};

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
  const params = getParams(e);
  const courseId = params.courseId;
  const id = params.id;
  const updateMask = params.updateMask || "name";
  const topic = params.topic || {};

  if (!courseId || !id) throw new Error("Falta 'courseId' o 'id'");
  return Classroom.Courses.Topics.patch(topic, courseId, id, { updateMask: updateMask });
}

/**
 * Elimina un tema (topic) d'un curs.
 */
function deleteTopic(e) {
  const params = getParams(e);
  const courseId = params.courseId;
  const id = params.id;
  if (!courseId || !id) throw new Error("Falta 'courseId' o 'id'");
  return Classroom.Courses.Topics.remove(courseId, id);
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
  const params = getParams(e);
  const courseId = params.courseId;
  const courseWorkId = params.courseWorkId;
  const id = params.id;
  const grade = params.grade;

  if (!courseId || !courseWorkId || !id) {
    throw new Error(`Falten paràmetres: courseId=${courseId}, courseWorkId=${courseWorkId}, id=${id}`);
  }

  const submission = {
    draftGrade: Number(grade),
    assignedGrade: Number(grade)
  };

  try {
    const result = Classroom.Courses.CourseWork.StudentSubmissions.patch(submission, courseId, courseWorkId, id, {
      updateMask: "draftGrade,assignedGrade"
    });
    return {
      success: true,
      sent: submission,
      received: result
    };
  } catch (err) {
    return {
      success: false,
      error: err.toString(),
      sent: submission
    };
  }
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
  const params = getParams(e);
  const courseId = params.courseId;
  const courseWorkId = params.courseWorkId;
  const id = params.id;
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
  const params = getParams(e);
  const userId = params.userId;
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
  const params = getParams(e);
  const courseId = params.courseId;
  const email = params.email;
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
  const params = getParams(e);
  const courseId = params.courseId;
  const email = params.email;
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
  const params = getParams(e);
  const courseId = params.courseId;
  const userId = params.userId;
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
  const params = getParams(e);
  const courseId = params.courseId;
  const userId = params.userId;
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
  const params = getParams(e);
  const name = params.name;
  const section = params.section;
  const ownerId = params.ownerId || "me";

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
  const params = getParams(e);
  const id = params.id;
  const updateMask = params.updateMask || "name";
  const course = params.course || {};

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
  const params = getParams(e);
  const id = params.id;
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
  const params = getParams(e);
  const courseId = params.courseId;
  const courseWorkId = params.courseWorkId;
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
  const params = getParams(e);
  const courseId = params.courseId;
  const courseWorkId = params.courseWorkId;
  const criteria = params.criteria || [];

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
  const params = getParams(e);
  const courseId = params.courseId;
  const courseWorkId = params.courseWorkId;
  const id = params.id;
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
  const params = getParams(e);
  const courseId = params.courseId;
  const courseWorkId = params.courseWorkId;
  const id = params.id;
  const updateMask = params.updateMask || "criteria";
  const rubric = params.rubric || {};

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
  const params = getParams(e);
  const studentId = params.studentId;
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
  const params = getParams(e);
  const studentId = params.studentId;
  const email = params.email;
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
  const params = getParams(e);
  const studentId = params.studentId;
  const guardianId = params.guardianId;
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
  const params = getParams(e);
  const courseId = params.courseId;
  const title = params.title;
  const base64Data = params.base64Data;
  const fileName = params.fileName;
  const mimeType = params.mimeType || MimeType.PDF;
  const topicId = params.topicId;

  if (!courseId || !title || !base64Data || !fileName) {
    throw new Error("Falten paràmetres: courseId, title, base64Data, fileName");
  }

  const decodedBlob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName);
  const driveFile = DriveApp.createFile(decodedBlob);

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

  if (topicId) material.topicId = topicId;
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
  const params = getParams(e);
  const base64Data = params.base64Data;
  const fileName = params.fileName;
  const mimeType = params.mimeType || "application/pdf";

  if (!base64Data || !fileName) {
    throw new Error("Falta 'base64Data' o 'fileName'");
  }

  const decodedBlob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName);
  const driveFile = DriveApp.createFile(decodedBlob);

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
  const params = getParams(e);
  const courseId = params.courseId;
  const courseWorkId = params.courseWorkId || params.id;
  const topicId = params.topicId;

  if (!courseId || !courseWorkId) throw new Error("Falta courseId o courseWorkId");

  const updateMask = "topicId";
  const content = { topicId: topicId || "" };

  return Classroom.Courses.CourseWork.patch(content, courseId, courseWorkId, { updateMask: updateMask });
}



/**
 * Substitueix completament una tasca (courseWork).
 * Útil per afegir/treure materials via update (PUT).
 */
function updateCourseWork(e) {
  const params = getParams(e);
  const courseId = params.courseId;
  const id = params.id;
  const courseWork = params.courseWork || {};

  if (!courseId || !id) throw new Error("Falta 'courseId' o 'id'");

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
  const params = getParams(e);
  const courseId = params.courseId;
  const id = params.id;
  const material = params.material || {};

  if (!courseId || !id) throw new Error("Falta 'courseId' o 'id'");

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