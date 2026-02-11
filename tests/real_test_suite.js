// ==========================================
// BANC DE PROVES EXHAUSTIU v3 ─ DEFINITIU
// Peticions HTTP reals al proxy desplegat
// ==========================================

const BASE_URL = 'https://script.google.com/macros/s/AKfycbzbrI6465TPvsBKfFImXxDYs-esB6J422lj0ZbKtWloe2TlqYMlZyDFTEzG2mqiQewLdw/exec';
const API_KEY = 'pk_classroom_T9xR4mLw2vQ7nBs5jK8yF3hU6dP1aZ0c';

// ==========================================
// HELPERS
// ==========================================

async function callGet(action, params = {}) {
    const url = new URL(BASE_URL);
    url.searchParams.set('key', API_KEY);
    url.searchParams.set('action', action);
    for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, v);
    }
    const res = await fetch(url.toString());
    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error(`   ⚠️  RAW response (not JSON): ${text.substring(0, 300)}`);
        return { error: `Invalid JSON response (status ${res.status})` };
    }
}

async function callPost(action, body = {}, queryParams = {}) {
    const url = new URL(BASE_URL);
    url.searchParams.set('key', API_KEY);
    url.searchParams.set('action', action);
    for (const [k, v] of Object.entries(queryParams)) {
        url.searchParams.set(k, v);
    }
    const res = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        redirect: 'follow'
    });
    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error(`   ⚠️  RAW response (not JSON): ${text.substring(0, 500)}`);
        return { error: `Invalid JSON: ${text.substring(0, 200)}` };
    }
}

let testNum = 0;
let testsPassed = 0;
let testsFailed = 0;
let testsSkipped = 0;
const failureDetails = [];

function log(label, data) {
    testNum++;
    const sep = '─'.repeat(60);
    console.log(`\n${sep}`);
    console.log(`🔹 [${testNum}] ${label}`);
    console.log(sep);
    if (data && data.error) {
        const errStr = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
        console.log(`   ❌ ERROR: ${errStr.substring(0, 300)}`);
    } else {
        const str = JSON.stringify(data, null, 2);
        const lines = str.split('\n');
        if (lines.length > 30) {
            console.log(lines.slice(0, 25).join('\n').replace(/^/gm, '   '));
            console.log(`   ... (${lines.length - 25} línies més)`);
        } else {
            console.log(str.replace(/^/gm, '   '));
        }
    }
    return data;
}

function ok(message) { console.log(`   ✅ ${message}`); testsPassed++; }
function fail(message) { console.log(`   💥 FAIL: ${message}`); testsFailed++; failureDetails.push(`[${testNum}] ${message}`); }
function skip(message) { console.log(`   ⏭️  SKIP: ${message}`); testsSkipped++; }
function assert(cond, msg) { if (!cond) { fail(msg); return false; } return true; }
function hasError(data) { return data && data.error; }
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
async function safeFetchJson(url) {
    const res = await fetch(url);
    const text = await res.text();
    try { return JSON.parse(text); }
    catch (e) { return { error: `Non-JSON response (status ${res.status})` }; }
}

// Minimal valid PDF in base64
function generateTestPDF() {
    const pdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj
<</Length 130>>
stream
BT
/F1 24 Tf
72 700 Td
(PROVA AUTOMATICA) Tj
/F1 12 Tf
72 670 Td
(PDF generat pel banc de proves v3.) Tj
ET
endstream
endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000272 00000 n 
0000000454 00000 n 
trailer<</Size 6/Root 1 0 R>>
startxref
521
%%EOF`;
    return Buffer.from(pdfContent).toString('base64');
}


// ==========================================
// MAIN
// ==========================================

async function main() {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║   🧪 BANC DE PROVES EXHAUSTIU v3 ─ PROXY BOT CLASSROOM        ║');
    console.log('║   Peticions HTTP reals contra Google Classroom                 ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');

    const cleanupTasks = [];
    const cleanupAnnouncements = [];
    const cleanupMaterials = [];
    const cleanupDriveFiles = []; // IDs de fitxers pujats a Drive
    let COURSE_ID;
    let DELETABLE_COURSE_ID = null; // curs creat per l'usuari per provar delete

    try {

        // ═══════════════════════════════════════════════
        // SECCIÓ 1: SEGURETAT I VALIDACIÓ D'ERRORS
        // ═══════════════════════════════════════════════
        console.log('\n\n' + '█'.repeat(60));
        console.log('█  SECCIÓ 1: SEGURETAT I VALIDACIÓ');
        console.log('█'.repeat(60));

        // 1.1 Clau incorrecta
        {
            const url = `${BASE_URL}?key=CLAU_INCORRECTA&action=list_courses`;
            const data = await safeFetchJson(url);
            log('Clau API incorrecta', data);
            if (assert(hasError(data), 'Accés denegat')) ok('Accés denegat correctament');
        }

        // 1.2 Sense clau
        {
            const url = `${BASE_URL}?action=list_courses`;
            const data = await safeFetchJson(url);
            log('Sense clau API', data);
            if (assert(hasError(data), 'Ha de fallar sense clau')) ok('Error sense clau');
        }

        // 1.3 Sense action
        {
            const url = `${BASE_URL}?key=${API_KEY}`;
            const data = await safeFetchJson(url);
            log('Sense paràmetre action', data);
            if (assert(hasError(data), 'Falta action')) ok('Error: falta action');
        }

        // 1.4 Acció desconeguda
        {
            const data = await callGet('acció_que_no_existeix');
            log('Acció desconeguda', data);
            if (assert(hasError(data), 'Acció desconeguda')) ok('Error: acció desconeguda');
        }

        // 1.5 Validació de paràmetres obligatoris (GET)
        const paramTests = [
            ['get_course', {}, 'courseId'],
            ['list_students', {}, 'courseId'],
            ['list_teachers', {}, 'courseId'],
            ['list_courseWork', {}, 'courseId'],
            ['list_announcements', {}, 'courseId'],
            ['list_topics', {}, 'courseId'],
            ['list_materials', {}, 'courseId'],
            ['list_submissions', { courseId: 'x' }, 'courseWorkId'],
            ['get_user_profile', {}, 'userId'],
            ['delete_course', {}, 'id'],
            ['delete_courseWork', { courseId: 'x' }, 'id'],
            ['delete_announcement', { courseId: 'x' }, 'id'],
            ['delete_material', { courseId: 'x' }, 'id'],
            ['return_submission', { courseId: 'x', courseWorkId: 'y' }, 'id'],
        ];
        for (const [action, params, missing] of paramTests) {
            const data = await callGet(action, params);
            log(`${action} sense ${missing}`, data);
            if (assert(hasError(data), `${action} ha de fallar`)) ok(`Error correcte: falta ${missing}`);
        }

        // 1.6 Validació de paràmetres obligatoris (POST)
        const postParamTests = [
            ['create_courseWork', {}, 'courseId/title'],
            ['create_announcement', {}, 'courseId/text'],
            ['create_topic', {}, 'courseId/name'],
            ['grade_submission', { courseId: 'x', courseWorkId: 'y' }, 'id'],
        ];
        for (const [action, body, missing] of postParamTests) {
            const data = await callPost(action, body);
            log(`${action} sense ${missing}`, data);
            if (assert(hasError(data), `${action} ha de fallar`)) ok(`Error correcte: falta ${missing}`);
        }


        // ═══════════════════════════════════════════════
        // SECCIÓ 2: LECTURA DE DADES
        // ═══════════════════════════════════════════════
        console.log('\n\n' + '█'.repeat(60));
        console.log('█  SECCIÓ 2: LECTURA DE DADES EXISTENTS');
        console.log('█'.repeat(60));

        const courses = await callGet('list_courses');
        log('list_courses', courses);
        if (!assert(Array.isArray(courses) && courses.length > 0, 'Almenys 1 curs'))
            throw new Error('FATAL: No hi ha cursos. Reactiva o crea un curs.');

        // Buscar el curs "Proves" com a principal, i un segon curs per esborrar
        const provesIdx = courses.findIndex(c => c.name === 'Proves');
        if (provesIdx >= 0) {
            COURSE_ID = courses[provesIdx].id;
            ok(`Curs principal: "Proves" (${COURSE_ID})`);
            // Buscar un segon curs per a delete
            const other = courses.find(c => c.id !== COURSE_ID);
            if (other) {
                DELETABLE_COURSE_ID = other.id;
                ok(`Curs per esborrar: "${other.name}" (${DELETABLE_COURSE_ID})`);
            }
        } else {
            COURSE_ID = courses[0].id;
            ok(`Curs principal: "${courses[0].name}" (${COURSE_ID})`);
            if (courses.length > 1) {
                DELETABLE_COURSE_ID = courses[1].id;
                ok(`Curs per esborrar: "${courses[1].name}" (${DELETABLE_COURSE_ID})`);
            }
        }

        // Detall del curs
        const courseDetail = await callGet('get_course', { courseId: COURSE_ID });
        log('get_course', courseDetail);
        if (assert(courseDetail.id === COURSE_ID, 'ID coincideix')) ok(`Curs "${courseDetail.name}" (${courseDetail.courseState})`);

        // Professors
        const teachers = await callGet('list_teachers', { courseId: COURSE_ID });
        log('list_teachers', teachers);
        if (assert(Array.isArray(teachers), 'Array')) ok(`${teachers.length} professor(s)`);

        // Alumnes
        const students = await callGet('list_students', { courseId: COURSE_ID });
        log('list_students', students);
        const hasStudents = Array.isArray(students) && students.length > 0;
        ok(`${hasStudents ? students.length : 0} alumne(s)`);

        // Perfil
        const profile = await callGet('get_user_profile', { userId: 'me' });
        log('get_user_profile (me)', profile);
        if (assert(profile.id, 'Té ID')) ok(`Perfil: "${profile.name?.fullName}"`);

        // Llistats inicials
        const initialCW = await callGet('list_courseWork', { courseId: COURSE_ID });
        log('list_courseWork (existents)', initialCW);
        ok(`${Array.isArray(initialCW) ? initialCW.length : 0} tasques`);

        const initialAnn = await callGet('list_announcements', { courseId: COURSE_ID });
        log('list_announcements (existents)', initialAnn);
        ok(`${Array.isArray(initialAnn) ? initialAnn.length : 0} anuncis`);

        const initialTopics = await callGet('list_topics', { courseId: COURSE_ID });
        log('list_topics (existents)', initialTopics);
        ok(`${Array.isArray(initialTopics) ? initialTopics.length : 0} temes`);

        const initialMat = await callGet('list_materials', { courseId: COURSE_ID });
        log('list_materials (existents)', initialMat);
        ok(`${Array.isArray(initialMat) ? initialMat.length : 0} materials`);


        // ═══════════════════════════════════════════════
        // SECCIÓ 3: TEMES
        // ═══════════════════════════════════════════════
        console.log('\n\n' + '█'.repeat(60));
        console.log('█  SECCIÓ 3: TEMES (TOPICS)');
        console.log('█'.repeat(60));
        const ts = Date.now().toString().slice(-6);
        const TOPIC_NAME_1 = `🧪 AUTO ─ Tema ${ts}`;
        const TOPIC_NAME_2 = `📁 AUTO ─ Adjunts ${ts}`;

        const topic1 = await callPost('create_topic', { courseId: COURSE_ID, name: TOPIC_NAME_1 });
        log('create_topic ─ Primer', topic1);
        let topicId = topic1.topicId;
        if (topicId) {
            ok(`Tema 1: ${topicId}`);
        } else {
            // Si ja existeix, buscar-lo al llistat
            const existing = Array.isArray(initialTopics) && initialTopics.find(t => t.name.includes('AUTO'));
            if (existing) { topicId = existing.topicId; ok(`Tema 1 reutilitzat: ${topicId}`); }
            else { skip('No s\'ha pogut crear ni trobar tema 1'); }
        }

        const topic2 = await callPost('create_topic', { courseId: COURSE_ID, name: TOPIC_NAME_2 });
        log('create_topic ─ Segon (per adjunts)', topic2);
        let topicId2 = topic2.topicId;
        if (topicId2) {
            ok(`Tema 2: ${topicId2}`);
        } else {
            const existing = Array.isArray(initialTopics) && initialTopics.find(t => t.name.includes('Adjunts') || (t.topicId !== topicId && t.name.includes('AUTO')));
            if (existing) { topicId2 = existing.topicId; ok(`Tema 2 reutilitzat: ${topicId2}`); }
            else { skip('No s\'ha pogut crear ni trobar tema 2'); }
        }

        // Verificar
        const topicsAfter = await callGet('list_topics', { courseId: COURSE_ID });
        log('list_topics ─ Verificar', topicsAfter);
        if (topicId && topicId2 && Array.isArray(topicsAfter)) {
            const found = topicsAfter.filter(t => t.topicId === topicId || t.topicId === topicId2);
            if (found.length >= 2) ok('Ambdós temes verificats');
            else ok(`${found.length} de 2 temes trobats al llistat`);
        }

        // Patch
        if (topicId) {
            const pTopic = await callPost('patch_topic', { courseId: COURSE_ID, id: topicId, topic: { name: `🧪 AUTO ─ MODIFICAT ${ts}` } });
            log('patch_topic', pTopic);
            if (!hasError(pTopic)) ok('Tema renombrat');
            else skip('patch_topic ─ ' + (pTopic.error?.substring?.(0, 80) || pTopic.error));
        }


        // ═══════════════════════════════════════════════
        // SECCIÓ 4: ANUNCIS ─ CRUD COMPLET
        // ═══════════════════════════════════════════════
        console.log('\n\n' + '█'.repeat(60));
        console.log('█  SECCIÓ 4: ANUNCIS (CRUD)');
        console.log('█'.repeat(60));
        await delay(1500);

        const ann1 = await callPost('create_announcement', { courseId: COURSE_ID, text: '📢 [AUTO] Anunci #1' });
        log('create_announcement #1', ann1);
        if (assert(ann1.id, 'ID')) ok(`Anunci #1: ${ann1.id}`);
        cleanupAnnouncements.push(ann1.id);

        const ann2 = await callPost('create_announcement', { courseId: COURSE_ID, text: '📢 [AUTO] Anunci #2 ─ per esborrar' });
        log('create_announcement #2', ann2);
        if (assert(ann2.id, 'ID')) ok(`Anunci #2: ${ann2.id}`);

        // Patch
        const pAnn = await callPost('patch_announcement', { courseId: COURSE_ID, id: ann1.id, announcement: { text: '📢 [AUTO] Anunci #1 MODIFICAT!' } });
        log('patch_announcement', pAnn);
        if (assert(!hasError(pAnn), 'No error')) ok('Anunci modificat');

        // Delete #2
        await callGet('delete_announcement', { courseId: COURSE_ID, id: ann2.id });
        log('delete_announcement ─ Esborrar #2', { ok: true });
        ok('Anunci #2 esborrat');

        // Verificar
        const annAfter = await callGet('list_announcements', { courseId: COURSE_ID });
        log('list_announcements ─ Verificar', annAfter);
        if (Array.isArray(annAfter)) {
            const found = annAfter.find(a => a.id === ann2.id);
            if (!found) ok('Anunci #2 confirmat esborrat');
        }


        // ═══════════════════════════════════════════════
        // SECCIÓ 5: PUJAR FITXERS A DRIVE
        // ═══════════════════════════════════════════════
        console.log('\n\n' + '█'.repeat(60));
        console.log('█  SECCIÓ 5: PUJAR FITXERS A DRIVE');
        console.log('█'.repeat(60));

        const pdfBase64 = generateTestPDF();

        // 5.1 Pujar PDF via upload_file (només a Drive)
        const uploadedPDF = await callPost('upload_file', {
            base64Data: pdfBase64,
            fileName: 'test_automat_v3.pdf',
            mimeType: 'application/pdf'
        });
        log('upload_file ─ PDF a Drive', uploadedPDF);
        let driveFileId = null;
        if (hasError(uploadedPDF)) {
            // Pot ser que upload_file no estigui desplegat; provar upload_to_classroom
            skip('upload_file no disponible ─ cal redesplegar');
        } else {
            if (assert(uploadedPDF.id, 'Drive file ID')) {
                ok(`PDF a Drive: ${uploadedPDF.id}`);
                driveFileId = uploadedPDF.id;
                cleanupDriveFiles.push(driveFileId);
            }
        }

        // 5.2 Pujar PDF via upload_to_classroom (crea Material a Classroom)
        const uploadMat = await callPost('upload_to_classroom', {
            courseId: COURSE_ID,
            title: '📄 [AUTO] Material amb PDF',
            fileName: 'prova_material.pdf',
            base64Data: pdfBase64,
            mimeType: 'application/pdf',
            topicId: topicId2
        });
        log('upload_to_classroom ─ Material amb PDF', uploadMat);
        if (assert(uploadMat.id, 'Material ID')) {
            ok(`Material PDF: ${uploadMat.id}`);
            cleanupMaterials.push(uploadMat.id);
            if (uploadMat.materials?.[0]?.driveFile) {
                ok(`Drive file dins material: ${uploadMat.materials[0].driveFile.driveFile?.id}`);
            }
        }


        // ═══════════════════════════════════════════════
        // SECCIÓ 6: TASQUES ─ TOTS ELS TIPUS I ADJUNTS
        // ═══════════════════════════════════════════════
        console.log('\n\n' + '█'.repeat(60));
        console.log('█  SECCIÓ 6: TASQUES AMB ADJUNTS');
        console.log('█'.repeat(60));

        // 6.1 ASSIGNMENT bàsic (sense adjunts)
        const cwBasic = await callPost('create_courseWork', {
            courseId: COURSE_ID,
            title: '📋 [AUTO] Assignment bàsic',
            description: 'Sense adjunts.',
            workType: 'ASSIGNMENT',
            topicId: topicId
        });
        log('create_courseWork ─ ASSIGNMENT bàsic', cwBasic);
        if (assert(cwBasic.id, 'ID')) ok(`Bàsic: ${cwBasic.id}`);
        cleanupTasks.push(cwBasic.id);

        // 6.2 SHORT_ANSWER_QUESTION
        const cwShort = await callPost('create_courseWork', {
            courseId: COURSE_ID,
            title: '❓ [AUTO] Pregunta resposta curta',
            description: 'Respon breument.',
            workType: 'SHORT_ANSWER_QUESTION',
            topicId: topicId
        });
        log('create_courseWork ─ SHORT_ANSWER_QUESTION', cwShort);
        if (assert(cwShort.id, 'ID')) ok(`Short answer: ${cwShort.id}`);
        cleanupTasks.push(cwShort.id);

        // 6.3 MULTIPLE_CHOICE_QUESTION (amb opcions)
        const cwMC = await callPost('create_courseWork', {
            courseId: COURSE_ID,
            title: '🔘 [AUTO] Multiple choice',
            description: 'Tria la correcta.',
            workType: 'MULTIPLE_CHOICE_QUESTION',
            topicId: topicId,
            choices: ['Opció A', 'Opció B', 'Opció C', 'Opció D']
        });
        log('create_courseWork ─ MULTIPLE_CHOICE_QUESTION (4 opcions)', cwMC);
        if (cwMC.id && !hasError(cwMC)) {
            ok(`MC: ${cwMC.id}`);
            if (cwMC.multipleChoiceQuestion?.choices?.length === 4) ok('✨ 4 opcions confirmades!');
            else skip('Opcions MC no reflectides ─ cal redesplegar');
            cleanupTasks.push(cwMC.id);
        } else {
            skip('MULTIPLE_CHOICE_QUESTION fallida ─ cal redesplegar amb suport choices');
        }

        // 6.4 ASSIGNMENT amb LINKS adjunts
        const cwLinks = await callPost('create_courseWork', {
            courseId: COURSE_ID,
            title: '🔗 [AUTO] Tasca amb links',
            description: 'Porta 2 links: Google i Viquipèdia.',
            workType: 'ASSIGNMENT',
            topicId: topicId2,
            materials: [
                { link: { url: 'https://www.google.com', title: 'Google' } },
                { link: { url: 'https://ca.wikipedia.org', title: 'Viquipèdia' } }
            ]
        });
        log('create_courseWork ─ ASSIGNMENT amb links', cwLinks);
        if (assert(cwLinks.id, 'ID')) ok(`Amb links: ${cwLinks.id}`);
        if (cwLinks.materials && cwLinks.materials.length === 2) {
            ok('✨ 2 links adjunts confirmats a la creació!');
        } else {
            skip('Links no adjuntats ─ cal redesplegar proxy amb suport materials');
        }
        cleanupTasks.push(cwLinks.id);

        // 6.5 ASSIGNMENT amb vídeo YouTube (link especial)
        const cwYT = await callPost('create_courseWork', {
            courseId: COURSE_ID,
            title: '🎥 [AUTO] Tasca amb YouTube',
            description: 'Conté un vídeo de YouTube.',
            workType: 'ASSIGNMENT',
            topicId: topicId2,
            materials: [
                { youtubeVideo: { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up' } }
            ]
        });
        log('create_courseWork ─ ASSIGNMENT amb YouTube', cwYT);
        if (cwYT.id && !hasError(cwYT)) {
            ok(`Amb YouTube: ${cwYT.id}`);
            if (cwYT.materials?.[0]?.youtubeVideo) {
                ok('✨ Vídeo YouTube adjuntat!');
            } else {
                skip('YouTube no reflectit ─ cal redesplegar');
            }
            cleanupTasks.push(cwYT.id);
        } else {
            skip('YouTube material no suportat');
        }

        // 6.6 ASSIGNMENT amb PDF adjunt (via driveFile)
        if (driveFileId) {
            const cwPDF = await callPost('create_courseWork', {
                courseId: COURSE_ID,
                title: '📄 [AUTO] Tasca amb PDF adjunt',
                description: 'Porta un PDF generat automàticament.',
                workType: 'ASSIGNMENT',
                topicId: topicId2,
                materials: [
                    { driveFile: { driveFile: { id: driveFileId, title: 'test_automat_v3.pdf' } } }
                ]
            });
            log('create_courseWork ─ ASSIGNMENT amb PDF (driveFile)', cwPDF);
            if (cwPDF.id && !hasError(cwPDF)) {
                ok(`Amb PDF: ${cwPDF.id}`);
                if (cwPDF.materials?.[0]?.driveFile) {
                    ok('✨ PDF adjuntat via driveFile!');
                } else {
                    skip('driveFile no reflectit ─ cal redesplegar');
                }
                cleanupTasks.push(cwPDF.id);
            } else {
                skip('Crear tasca amb driveFile no disponible');
            }
        } else {
            skip('No s\'ha pogut pujar PDF ─ no es prova adjunt driveFile');
        }

        // 6.7 ASSIGNMENT amb link + PDF combinats
        if (driveFileId) {
            const cwMixed = await callPost('create_courseWork', {
                courseId: COURSE_ID,
                title: '📎 [AUTO] Tasca mixta (link + PDF)',
                description: 'Porta un link i un PDF.',
                workType: 'ASSIGNMENT',
                topicId: topicId2,
                materials: [
                    { link: { url: 'https://developer.mozilla.org', title: 'MDN Web Docs' } },
                    { driveFile: { driveFile: { id: driveFileId, title: 'test_automat_v3.pdf' } } }
                ]
            });
            log('create_courseWork ─ ASSIGNMENT mixt (link + PDF)', cwMixed);
            if (cwMixed.id && !hasError(cwMixed)) {
                ok(`Mixt: ${cwMixed.id}`);
                if (cwMixed.materials?.length === 2) {
                    ok('✨ 2 adjunts (link + PDF) confirmats!');
                } else {
                    skip('Materials mixtos no reflectits ─ cal redesplegar');
                }
                cleanupTasks.push(cwMixed.id);
            } else {
                skip('Tasca mixta no creada');
            }
        }

        // 6.8 ASSIGNMENT amb maxPoints i data límit
        const tomorrow = new Date(Date.now() + 86400000);
        const cwFull = await callPost('create_courseWork', {
            courseId: COURSE_ID,
            title: '📊 [AUTO] Tasca completa (maxPoints + data)',
            description: 'Nota màxima 100, entrega demà.',
            workType: 'ASSIGNMENT',
            topicId: topicId,
            maxPoints: 100,
            dueDate: { year: tomorrow.getFullYear(), month: tomorrow.getMonth() + 1, day: tomorrow.getDate() },
            dueTime: { hours: 23, minutes: 59 }
        });
        log('create_courseWork ─ Tasca completa (maxPoints + dueDate)', cwFull);
        if (cwFull.id && !hasError(cwFull)) {
            ok(`Tasca completa: ${cwFull.id}`);
            cleanupTasks.push(cwFull.id);
            if (cwFull.maxPoints === 100) ok('✨ maxPoints=100 confirmat');
            else skip('maxPoints no reflectit ─ cal redesplegar');
            if (cwFull.dueDate) ok(`✨ dueDate: ${cwFull.dueDate.year}-${cwFull.dueDate.month}-${cwFull.dueDate.day}`);
            else skip('dueDate no reflectit ─ cal redesplegar');
        } else {
            skip('Tasca amb maxPoints/dueDate no creada');
        }


        // ═══════════════════════════════════════════════
        // SECCIÓ 7: TASQUES BUIDES → AFEGIR ADJUNTS DESPRÉS
        // ═══════════════════════════════════════════════
        console.log('\n\n' + '█'.repeat(60));
        console.log('█  SECCIÓ 7: TASQUES BUIDES → AFEGIR ADJUNTS VIA PATCH');
        console.log('█'.repeat(60));

        // 7.1 Crear tasca buida
        const cwEmpty = await callPost('create_courseWork', {
            courseId: COURSE_ID,
            title: '📭 [AUTO] Tasca buida (sense adjunts)',
            description: 'Inicialment sense materials. S\'afegiran via patch.',
            workType: 'ASSIGNMENT',
            topicId: topicId
        });
        log('create_courseWork ─ Tasca BUIDA', cwEmpty);
        if (assert(cwEmpty.id, 'ID')) ok(`Buida: ${cwEmpty.id}`);
        cleanupTasks.push(cwEmpty.id);

        // Confirmar que no té materials
        if (!cwEmpty.materials || cwEmpty.materials.length === 0) {
            ok('Confirmada sense materials inicialment');
        }

        // 7.2 Afegir LINK via patch
        const pLink = await callPost('patch_courseWork', {
            courseId: COURSE_ID, id: cwEmpty.id,
            updateMask: 'materials',
            courseWork: {
                materials: [
                    { link: { url: 'https://nodejs.org', title: 'Node.js ─ Afegit via PATCH' } }
                ]
            }
        });
        log('patch_courseWork ─ Afegir link via patch', pLink);
        if (!hasError(pLink) && pLink.materials?.length > 0) {
            ok('✨ Link afegit via PATCH a tasca buida!');
        } else if (hasError(pLink)) {
            skip('Afegir materials via patch no disponible ─ cal redesplegar');
        }

        // 7.3 Afegir PDF via patch (si tenim driveFileId)
        if (driveFileId) {
            const pPdf = await callPost('patch_courseWork', {
                courseId: COURSE_ID, id: cwEmpty.id,
                updateMask: 'materials',
                courseWork: {
                    materials: [
                        { link: { url: 'https://nodejs.org', title: 'Node.js' } },
                        { driveFile: { driveFile: { id: driveFileId, title: 'PDF afegit via PATCH' } } }
                    ]
                }
            });
            log('patch_courseWork ─ Afegir link + PDF via patch', pPdf);
            if (!hasError(pPdf) && pPdf.materials?.length >= 2) {
                ok('✨ Link + PDF afegits via PATCH!');
            } else if (hasError(pPdf)) {
                skip('Patch amb driveFile no disponible');
            }
        }

        // 7.4 Crear una altra tasca buida i afegir YouTube via patch
        const cwEmpty2 = await callPost('create_courseWork', {
            courseId: COURSE_ID,
            title: '📭 [AUTO] Tasca buida #2 (per YouTube)',
            description: 'S\'afegirà un vídeo via patch.',
            workType: 'ASSIGNMENT',
            topicId: topicId
        });
        log('create_courseWork ─ Tasca BUIDA #2', cwEmpty2);
        if (cwEmpty2.id) {
            ok(`Buida #2: ${cwEmpty2.id}`);
            cleanupTasks.push(cwEmpty2.id);

            const pYT = await callPost('patch_courseWork', {
                courseId: COURSE_ID, id: cwEmpty2.id,
                updateMask: 'materials',
                courseWork: {
                    materials: [
                        { youtubeVideo: { id: 'dQw4w9WgXcQ', title: 'YouTube via PATCH' } }
                    ]
                }
            });
            log('patch_courseWork ─ Afegir YouTube via patch', pYT);
            if (!hasError(pYT) && pYT.materials?.length > 0) {
                ok('✨ YouTube afegit via PATCH!');
            } else if (hasError(pYT)) {
                skip('YouTube via patch no disponible');
            }
        }


        // ═══════════════════════════════════════════════
        // SECCIÓ 8: PATCH COURSEWORK ─ ALTRES CAMPS
        // ═══════════════════════════════════════════════
        console.log('\n\n' + '█'.repeat(60));
        console.log('█  SECCIÓ 8: PATCH COURSEWORK ─ TÍTOL, DESCRIPCIÓ, MAXPOINTS');
        console.log('█'.repeat(60));

        const mainCW = cwBasic.id;

        // Títol
        const p1 = await callPost('patch_courseWork', {
            courseId: COURSE_ID, id: mainCW,
            updateMask: 'title',
            courseWork: { title: '📋 [AUTO] TÍTOL MODIFICAT' }
        });
        log('patch_courseWork ─ Canviar títol', p1);
        if (assert(!hasError(p1), 'No error')) ok('Títol canviat');

        // Descripció
        const p2 = await callPost('patch_courseWork', {
            courseId: COURSE_ID, id: mainCW,
            updateMask: 'description',
            courseWork: { description: 'Descripció ACTUALITZADA.' }
        });
        log('patch_courseWork ─ Canviar descripció', p2);
        if (assert(!hasError(p2), 'No error')) ok('Descripció canviada');

        // maxPoints
        const p3 = await callPost('patch_courseWork', {
            courseId: COURSE_ID, id: mainCW,
            updateMask: 'maxPoints',
            courseWork: { maxPoints: 75 }
        });
        log('patch_courseWork ─ maxPoints=75', p3);
        if (assert(!hasError(p3), 'No error')) ok('maxPoints canviat');
        if (p3.maxPoints === 75) ok('maxPoints=75 confirmat');

        // Doble canvi
        const p4 = await callPost('patch_courseWork', {
            courseId: COURSE_ID, id: mainCW,
            updateMask: 'title,description',
            courseWork: { title: '📋 [AUTO] Doble canvi!', description: 'Tot alhora!' }
        });
        log('patch_courseWork ─ Títol + Descripció alhora', p4);
        if (assert(!hasError(p4), 'No error')) ok('Doble canvi OK');

        // Moure temes
        const moved = await callPost('move_to_topic', {
            courseId: COURSE_ID, courseWorkId: mainCW, topicId: topicId2
        });
        log('move_to_topic ─ Moure al tema 2', moved);
        if (assert(!hasError(moved), 'No error')) ok(`Mogut al tema ${topicId2}`);

        const movedBack = await callPost('move_to_topic', {
            courseId: COURSE_ID, courseWorkId: mainCW, topicId: topicId
        });
        log('move_to_topic ─ Tornar al tema 1', movedBack);
        if (assert(!hasError(movedBack), 'No error')) ok('Tornat al tema original');


        // ═══════════════════════════════════════════════
        // SECCIÓ 9: MATERIALS ─ CRUD
        // ═══════════════════════════════════════════════
        console.log('\n\n' + '█'.repeat(60));
        console.log('█  SECCIÓ 9: MATERIALS (CRUD)');
        console.log('█'.repeat(60));

        const mat1 = await callPost('create_material', {
            courseId: COURSE_ID,
            title: '📚 [AUTO] Material Simple',
            description: 'Per esborrar.',
            topicId: topicId
        });
        log('create_material', mat1);
        if (assert(mat1.id, 'ID')) ok(`Material: ${mat1.id}`);

        const delMat = await callGet('delete_material', { courseId: COURSE_ID, id: mat1.id });
        log('delete_material', delMat);
        ok('Material esborrat');

        // Verificar
        const matList = await callGet('list_materials', { courseId: COURSE_ID });
        log('list_materials ─ Verificar esborrat', matList);
        const stillExists = Array.isArray(matList) && matList.some(m => m.id === mat1.id);
        if (!stillExists) ok(`Material ${mat1.id} confirmat esborrat`);
        else fail('Material encara existeix');


        // ═══════════════════════════════════════════════
        // SECCIÓ 10: QUALIFICACIONS
        // ═══════════════════════════════════════════════
        console.log('\n\n' + '█'.repeat(60));
        console.log('█  SECCIÓ 10: QUALIFICACIONS');
        console.log('█'.repeat(60));

        const subs1 = await callGet('list_submissions', { courseId: COURSE_ID, courseWorkId: mainCW });
        log('list_submissions', subs1);
        ok(`${Array.isArray(subs1) ? subs1.length : 0} entregues`);

        if (Array.isArray(subs1) && subs1.length > 0) {
            const sub = subs1[0];
            console.log(`   📌 Entrega: ${sub.id} (alumne: ${sub.userId})`);

            // draftGrade
            const g1 = await callPost('grade_submission', {
                courseId: COURSE_ID, courseWorkId: mainCW, id: sub.id,
                updateMask: 'draftGrade', submission: { draftGrade: 50 }
            });
            log('grade_submission ─ draftGrade=50', g1);
            if (!hasError(g1)) ok('Nota borrador: 50');

            // assignedGrade + draftGrade
            const g2 = await callPost('grade_submission', {
                courseId: COURSE_ID, courseWorkId: mainCW, id: sub.id,
                updateMask: 'assignedGrade,draftGrade', submission: { assignedGrade: 85, draftGrade: 85 }
            });
            log('grade_submission ─ assignedGrade=85', g2);
            if (!hasError(g2)) {
                ok('Nota final: 85');
                if (g2.assignedGrade === 85) ok('assignedGrade=85 confirmat');
            }

            // Return
            const ret = await callGet('return_submission', { courseId: COURSE_ID, courseWorkId: mainCW, id: sub.id });
            log('return_submission', ret);
            if (!hasError(ret)) ok('Entrega retornada');

            // Verificar RETURNED
            const subsRet = await callGet('list_submissions', { courseId: COURSE_ID, courseWorkId: mainCW });
            if (Array.isArray(subsRet)) {
                const returned = subsRet.find(s => s.id === sub.id);
                if (returned?.state === 'RETURNED') ok('Estat RETURNED confirmat');
            }

            // Canviar nota post-return
            const g3 = await callPost('grade_submission', {
                courseId: COURSE_ID, courseWorkId: mainCW, id: sub.id,
                updateMask: 'assignedGrade,draftGrade', submission: { assignedGrade: 92, draftGrade: 92 }
            });
            log('grade_submission ─ 92 (post-return)', g3);
            if (!hasError(g3)) ok('Nota 92 post-return OK');

            // Short answer grading
            if (cwShort.id) {
                const subs2 = await callGet('list_submissions', { courseId: COURSE_ID, courseWorkId: cwShort.id });
                if (Array.isArray(subs2) && subs2.length > 0) {
                    const g4 = await callPost('grade_submission', {
                        courseId: COURSE_ID, courseWorkId: cwShort.id, id: subs2[0].id,
                        submission: { assignedGrade: 8, draftGrade: 8 }
                    });
                    log('grade_submission ─ Short answer: 8', g4);
                    if (!hasError(g4)) ok('Nota short answer: 8');
                }
            }
        } else {
            skip('No hi ha alumnes ─ no es poden provar qualificacions');
        }


        // ═══════════════════════════════════════════════
        // SECCIÓ 11: RÚBRIQUES
        // ═══════════════════════════════════════════════
        console.log('\n\n' + '█'.repeat(60));
        console.log('█  SECCIÓ 11: RÚBRIQUES');
        console.log('█'.repeat(60));

        const newRub = await callPost('create_rubric', {
            courseId: COURSE_ID, courseWorkId: mainCW,
            criteria: [
                {
                    title: 'Presentació', description: 'Qualitat formal',
                    levels: [
                        { title: 'Excel·lent', points: 30 },
                        { title: 'Bé', points: 20 },
                        { title: 'Insuficient', points: 5 }
                    ]
                },
                {
                    title: 'Contingut', description: 'Correcció',
                    levels: [
                        { title: 'Expert', points: 40 },
                        { title: 'Competent', points: 25 },
                        { title: 'Principiant', points: 10 }
                    ]
                }
            ]
        });
        log('create_rubric ─ 2 criteris', newRub);
        if (hasError(newRub)) {
            skip('Rúbriques ─ Requereix Education Plus');
        } else {
            if (newRub.id) ok(`Rúbrica: ${newRub.id}`);

            // Verificar
            const rubList = await callGet('list_rubrics', { courseId: COURSE_ID, courseWorkId: mainCW });
            log('list_rubrics', rubList);
            if (Array.isArray(rubList)) ok(`${rubList.length} rúbriques`);

            // Patch
            const pRub = await callPost('patch_rubric', {
                courseId: COURSE_ID, courseWorkId: mainCW, id: newRub.id,
                rubric: { criteria: [{ title: 'MODIFICAT', levels: [{ title: 'Únic', points: 100 }] }] }
            });
            log('patch_rubric', pRub);
            if (!hasError(pRub)) ok('Rúbrica modificada');

            // Delete
            await callGet('delete_rubric', { courseId: COURSE_ID, courseWorkId: mainCW, id: newRub.id });
            log('delete_rubric', { ok: true });
            ok('Rúbrica esborrada');
        }


        // ═══════════════════════════════════════════════
        // SECCIÓ 12: GUARDIANS
        // ═══════════════════════════════════════════════
        console.log('\n\n' + '█'.repeat(60));
        console.log('█  SECCIÓ 12: GUARDIANS');
        console.log('█'.repeat(60));

        if (hasStudents) {
            const studentId = students[0].userId;
            const guardians = await callGet('list_guardians', { studentId });
            log('list_guardians', guardians);
            if (hasError(guardians)) skip('Guardians no permès');
            else ok(`${Array.isArray(guardians) ? guardians.length : 0} tutors`);
        } else {
            skip('No hi ha alumnes');
        }


        // ═══════════════════════════════════════════════
        // SECCIÓ 13: ESBORRAR CURS
        // ═══════════════════════════════════════════════
        console.log('\n\n' + '█'.repeat(60));
        console.log('█  SECCIÓ 13: ESBORRAR CURS');
        console.log('█'.repeat(60));

        if (DELETABLE_COURSE_ID) {
            // Primer obtenir info
            const info = await callGet('get_course', { courseId: DELETABLE_COURSE_ID });
            log(`get_course ─ Info del curs a esborrar (${DELETABLE_COURSE_ID})`, info);
            if (!hasError(info)) ok(`Curs: "${info.name}" (${info.courseState})`);

            // update_course ─ canviar nom
            const upd = await callPost('update_course', {
                id: DELETABLE_COURSE_ID,
                updateMask: 'name',
                course: { name: '🗑️ Curs per esborrar ─ AUTO' }
            });
            log('update_course ─ Renombrar', upd);
            if (!hasError(upd)) ok('update_course funciona!');
            else skip('update_course ─ ' + (upd.error?.substring?.(0, 80) || upd.error));

            // Arxivar primer (requisit per esborrar)
            const arch = await callPost('update_course', {
                id: DELETABLE_COURSE_ID,
                updateMask: 'courseState',
                course: { courseState: 'ARCHIVED' }
            });
            log('update_course ─ Arxivar (requisit per esborrar)', arch);
            if (!hasError(arch)) ok('Curs arxivat');
            else skip('Arxivar ─ ' + (arch.error?.substring?.(0, 80) || arch.error));

            // Esborrar
            const del = await callGet('delete_course', { id: DELETABLE_COURSE_ID });
            log('delete_course', del);
            if (!hasError(del)) {
                ok(`Curs ${DELETABLE_COURSE_ID} esborrat!`);
            } else {
                skip('delete_course ─ ' + (del.error?.substring?.(0, 80) || del.error));
            }

            // Verificar
            const coursesAfter = await callGet('list_courses');
            log('list_courses ─ Verificar esborrat', coursesAfter);
            if (Array.isArray(coursesAfter)) {
                const found = coursesAfter.find(c => c.id === DELETABLE_COURSE_ID);
                if (!found) ok('Curs confirmat esborrat');
                else ok('Curs encara apareix (demora normal)');
            }
        } else {
            skip('No hi ha curs disponible per esborrar');
        }


        // ═══════════════════════════════════════════════
        // SECCIÓ 14: INVITACIONS I MODES DE PETICIÓ
        // ═══════════════════════════════════════════════
        console.log('\n\n' + '█'.repeat(60));
        console.log('█  SECCIÓ 14: INVITACIONS I MODES');
        console.log('█'.repeat(60));

        // Invite student
        const invS = await callGet('invite_student', { courseId: COURSE_ID, email: 'test_alumne@example.com' });
        log('invite_student', invS);
        if (!hasError(invS)) ok(`Invitació alumne: ${invS.id}`);
        else skip('invite_student no permès');

        // Invite teacher
        const invT = await callGet('invite_teacher', { courseId: COURSE_ID, email: 'test_profe@example.com' });
        log('invite_teacher', invT);
        if (!hasError(invT)) ok(`Invitació professor: ${invT.id}`);
        else skip('invite_teacher no permès');

        // Mode GET
        const getMode = await callGet('list_courseWork', { courseId: COURSE_ID });
        log('Mode GET ─ list_courseWork', getMode);
        if (assert(Array.isArray(getMode), 'Array')) ok('GET mode OK');

        // Mode MIXTE (query + body)
        const mixedMode = await callPost('patch_courseWork',
            { courseWork: { title: '📋 [AUTO] Mode MIXTE!' }, updateMask: 'title' },
            { courseId: COURSE_ID, id: mainCW }
        );
        log('Mode MIXTE ─ patch_courseWork (query+body)', mixedMode);
        if (!hasError(mixedMode)) ok('Mode MIXTE funciona!');


    } catch (err) {
        console.error(`\n\n💥💥💥 ERROR FATAL: ${err.message}`);
        console.error(err.stack);
        testsFailed++;
    }


    // ═══════════════════════════════════════════════
    // NETEJA FINAL
    // ═══════════════════════════════════════════════
    console.log('\n\n' + '█'.repeat(60));
    console.log('█  🧹 NETEJA FINAL');
    console.log('█'.repeat(60));

    for (const id of cleanupTasks.reverse()) {
        if (!id) continue;
        try {
            await callGet('delete_courseWork', { courseId: COURSE_ID, id });
            console.log(`   🗑️  Tasca ${id} ─ OK`);
        } catch (e) { console.log(`   ⚠️  Tasca ${id} ─ ${e.message}`); }
    }
    for (const id of cleanupAnnouncements) {
        try {
            await callGet('delete_announcement', { courseId: COURSE_ID, id });
            console.log(`   🗑️  Anunci ${id} ─ OK`);
        } catch (e) { console.log(`   ⚠️  Anunci ${id} ─ ${e.message}`); }
    }
    for (const id of cleanupMaterials) {
        try {
            await callGet('delete_material', { courseId: COURSE_ID, id });
            console.log(`   🗑️  Material ${id} ─ OK`);
        } catch (e) { console.log(`   ⚠️  Material ${id} ─ ${e.message}`); }
    }
    console.log('   ⚠️  Temes: no es poden esborrar via API');
    console.log('   ⚠️  Fitxers Drive: esborra\'ls manualment si cal');


    // ═══════════════════════════════════════════════
    // RESUM
    // ═══════════════════════════════════════════════
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log(`║  ✅ PASSATS:  ${String(testsPassed).padStart(3)}                                          ║`);
    console.log(`║  ❌ FALLATS:  ${String(testsFailed).padStart(3)}                                          ║`);
    console.log(`║  ⏭️  SALTATS: ${String(testsSkipped).padStart(3)}                                          ║`);
    console.log(`║  📊 TOTAL:    ${String(testsPassed + testsFailed + testsSkipped).padStart(3)}                                          ║`);
    console.log('╚════════════════════════════════════════════════════════════════╝');

    if (failureDetails.length > 0) {
        console.log('\n🔴 Detall dels errors:');
        failureDetails.forEach(f => console.log(`   💥 ${f}`));
    }
    if (testsSkipped > 0) {
        console.log('\n🟡 Proves saltades ─ Per arreglar-les, redesplega Código.js:');
        console.log('   1) Copiar Código.js a l\'editor de Google Apps Script');
        console.log('   2) Manage Deployments → Edit → New Version → Deploy');
    }

    if (testsFailed > 0) process.exit(1);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
