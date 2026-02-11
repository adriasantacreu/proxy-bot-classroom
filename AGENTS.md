# 🤖 Agent Information (AGENTS.md)

Aquest fitxer conté informació crítica sobre l'estat i l'arquitectura del projecte per a futurs agents d'IA o col·laboradors humans.

## 📝 Resum del Projecte
**Proxy-Classroom-Bot-V2** és un middleware construït amb Google Apps Script que actua com a pont entre aplicacions externes (com un Bot de Telegram o un Tester Web) i l'API de Google Classroom. El seu objectiu és simplificar l'autenticació i oferir una interfície més neta i robusta.

## 🏛️ Arquitectura Actual (v55 - Feb 2026)
*   **Dispatcher (`handleRequest`)**: Centralitzat a `Código.js`. Rep totes les peticions `GET` i `POST`.
*   **Unified Params (`getParams`)**: Una funció clau que mergeja els paràmetres de l'URL amb el body JSON del `POST`. Això fa que l'API sigui "agnòstica" al mètode d'enviament.
*   **Grading System**: S'ha passat d'una lògica complexa de patches manuals a una funció simplificada que rep un sol valor `grade` i s'encarrega d'actualitzar tant el `draftGrade` com el `assignedGrade`.
*   **Frontend**: L'`index.html` actua com a client de referència i tester, utilitzant un sistema de `SCHEMAS` dinàmics per generar els formularis de l'API.

## 🚀 Desplegament
*   **Clasp**: S'utilitza per a la sincronització local -> GAS. 
*   **Versions**: Actualment a la **Versió 55**. 
*   **Deploy ID**: `AKfycbz5hvlbdd8vumKsAKQNrvwpxM4DUeHo1uMcAZE8vGKTfO4ZXnavqe4CEEGOqkTduMvAtw` (sempre s'ha de mantenir estable).
*   Consulteu **`DEPLOY_GUIDE.md`** per a instruccions detallades sobre com gestionar el límit de 20 desplegaments de Google.

## ⚠️ Notes de Seguretat i Permisos
*   **API_KEY**: Guardada a `PropertiesService`. Mai s'ha de hardcodejar al repositori.
*   **403 Forbidden**: Si una acció falla per permisos, sol ser per configuració de domini (Workspace for Education) o perquè el curs s'ha d'arxivar abans de ser esborrat.

## ✅ Estat del Repo
*   Net de fitxers temporals de prova (`*.json`, `*.tmp`).
*   Totes les funcions testeades i validades amb crides `curl` reals.

---
*Creat per l'Agent Antigravity el 11 de febrer de 2026.* 🦾
