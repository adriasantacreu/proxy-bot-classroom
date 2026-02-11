# Banc de Proves i Simulació (Stateful)

Aquesta suite de proves no només verifica que les funcions "no fallin", sinó que simula una base de dades en memòria per mostrar com canvien les dades a mesura que interactues amb l'API.

Pots veure la sortida "RAW" (el JSON que retornaria l'API) per a cada pas.

## Com executar-ho

1. Des de la carpeta del projecte:

```bash
node tests/stateful_test_suite.js
```

## Escenaris Coberts

L'script executa automàticament els següents fluxos d'usuaris (User Stories):

### 1. Gestió de Cursos
- **Llistar cursos**: Mostra els cursos inicials.
- **Crear curs**: Crea un nou curs de "Physics 101".
- **Verificar creació**: Torna a llistar per demostrar que el nou curs existeix amb el seu ID generat.
- **Actualitzar curs**: Canvia el nom del curs.

### 2. Gestió de Tasques (Assignments)
- **Llistar buit**: Verifica que el curs nou no té tasques.
- **Crear tasca**: Afegeix una "Lab Report".
- **Crear tema**: Afegeix el tema "Labs".
- **Moure a tema**: Assigna la tasca creada al tema "Labs" i mostra l'objecte actualitzat.

### 3. Qualificacions (Grading)
- **Simulació d'entrega**: El sistema injecta una entrega d'alumne simulada (`TURNED_IN`).
- **Llistar entregues**: Recupera l'entrega de l'alumne.
- **Posar nota**: Actualitza la nota (95) sense retornar la tasca.
- **Retornar tasca**: Canvia l'estat a `RETURNED` perquè l'alumne vegi la nota.

### 4. Anuncis del Tauler
- Crea un anunci "Welcome".
- L'esborra immediatament.
- Verifica que ja no existeix al lllistat.

### 5. Gestió d'Errors
- **API Key incorrecta**: Mostra el missatge d'error de seguretat.
- **Curs no existent**: Mostra com l'API gestiona un ID invàlid (`Course not found`).

---
_Aquest script és ideal per entendre què retorna exactament cada funció sense haver de fer peticions reals a Google Classroom i gastar quota o fer proves amb dades reals._
