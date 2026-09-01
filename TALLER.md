# Git Quest: taller guiado de Git y GitHub

> Cuatro horas, principiantes, trabajo en parejas y una aplicación C# que crece
> delante de nosotros.

## Objetivo

Al terminar podrás explicar y practicar:

- working tree, staging, commits y referencias;
- `amend`, Conventional Commits e issues;
- ramas con varios commits;
- historia lineal, merge, rebase y conflictos;
- fork, remotes, fetch, pull y push;
- Pull Requests, reviews y solicitudes de cambios;
- merge commit, squash y chained Pull Requests;
- cuándo investigar `cherry-pick`, `worktree`, `blame` y `bisect`.

## Antes del taller

### Participantes

- Git instalado: `git --version`.
- Cuenta de GitHub y editor de código.
- .NET 8 o Docker.
- Parejas definidas.

### Instructor

Publica este repositorio y sube todas las ramas:

```bash
git remote add origin https://github.com/daniel-baf/REPO.git
git push -u origin main
git push origin --all
```

Cada pareja hace fork. Una persona será propietaria del fork de equipo y agrega
a la otra como colaboradora en **Settings > Collaborators**. Así ambos pueden
crear ramas y solicitar cambios reales en las PRs.

### Ejecutar sin instalar .NET

```bash
docker run --rm -it \
  -v "$PWD:/app" -w /app \
  mcr.microsoft.com/dotnet/sdk:8.0 dotnet run
```

En PowerShell:

```powershell
docker run --rm -it `
  -v "${PWD}:/app" -w /app `
  mcr.microsoft.com/dotnet/sdk:8.0 dotnet run
```

## Cómo leer esta guía

- **Proyecta:** demostración del instructor.
- **Hazlo:** ejercicio de los participantes.
- **Checkpoint:** cómo comprobar el resultado.
- **Rescate:** cómo volver a un estado conocido.

No copies comandos sin leer `git status`. Git casi siempre explica qué ocurre y
qué espera de ti.

---

# Acto 1: una fotografía con contexto

## 1. Git no es GitHub · 10 min

Git guarda una historia local. GitHub hospeda una copia y añade colaboración,
issues, Pull Requests y reviews.

```text
archivos → staging → repositorio local → GitHub
           git add    git commit         git push
```

**Proyecta**

```bash
git status
git log --oneline --decorate -5
git branch --show-current
```

`HEAD` señala la posición actual. Una rama es una referencia móvil a un commit,
no una carpeta ni una copia completa del proyecto.

## 2. Primer commit · 15 min

Cada pareja crea un archivo local con sus nombres:

```bash
printf "Daniel y Ada\n" > equipo.txt
git status
git add equipo.txt
git status
git commit -m "Agregar equipo"
```

**Checkpoint**

```bash
git show --stat --oneline HEAD
git status
```

Pregunta: ¿por qué `git commit` no tomó archivos que nunca pasaron por staging?

## 3. Amend: corregir la última foto · 10 min

Faltó indicar quién revisará primero:

```bash
printf "Reviewer inicial: Ada\n" >> equipo.txt
git add equipo.txt
git commit --amend --no-edit
git log --oneline -2
```

El SHA cambió porque el commit completo cambió. No hagas amend sobre commits
que otras personas ya descargaron, salvo acuerdo explícito del equipo.

**Proyecta**

```bash
git log --oneline demo/amend/original -1
git log --oneline demo/amend/corrected -1
git diff demo/amend/original demo/amend/corrected
```

## 4. Mensajes, referencias e issues · 15 min

Formato de Conventional Commits:

```text
tipo(alcance opcional): descripción breve
```

- `feat`: capacidad nueva para el usuario.
- `fix`: corrige un comportamiento defectuoso.
- `docs`: solo documentación.
- `refactor`: reorganiza sin cambiar comportamiento.
- `test`: agrega o corrige pruebas.
- `chore`: mantenimiento del proyecto.

Crea un issue en el fork y referencia su número desde un commit:

```text
docs: identificar al equipo

Refs #1
```

`Refs #1` relaciona. `Closes #1` también cerrará el issue cuando el commit llegue
a la rama predeterminada.

Referencias Git importantes:

```text
HEAD         posición actual
HEAD~1       padre del commit actual
main         punta de una rama local
origin/main  último estado conocido de la rama remota
a1b2c3d      SHA abreviado de un commit
```

### Solo teoría: commits verificados

El sello **Verified** significa que GitHub validó la firma criptográfica. No
significa que el código sea correcto ni seguro. Configurar GPG, SSH o S/MIME
queda fuera de esta práctica.

---

# Acto 2: la aplicación empieza a jugar

## 5. Leer una rama · 10 min

```bash
git switch step/01-menu
git diff main..step/01-menu
git log --oneline main..step/01-menu
dotnet run
```

La primera versión muestra un menú y lee una opción una sola vez. Si usas Docker,
sustituye `dotnet run` por el comando indicado al inicio.

## 6. Una rama puede tener varios commits · 15 min

```bash
git switch step/02-loop
git log --oneline step/01-menu..step/02-loop
git diff step/01-menu..step/02-loop
```

Esta rama agrega un loop y después corrige la salida. La rama representa una
unidad de trabajo; sus commits representan decisiones revisables.

**Hazlo**

```bash
git switch main
git switch -c practica/nombre-equipo
# Editar equipo.txt, agregar y commitear dos veces.
```

## 7. La computadora juega · 15 min

```bash
git switch step/03-computer
git log --oneline --graph --decorate --all --simplify-by-decoration
git diff step/02-loop..HEAD
dotnet run
```

Ahora `Random` elige una opción, pero el programa todavía no sabe quién ganó.
Pregunta: ¿este cambio debe ser un `feat`, un `fix` o un `refactor`?

## 8. Las reglas aparecen · 15 min

```bash
git switch step/04-rules
git diff --word-diff step/03-computer..HEAD -- Program.cs
dotnet run
```

Las condiciones están deliberadamente dentro del loop. Primero construimos un
comportamiento visible; más adelante discutiremos su estructura.

---

# Acto 3: integrar historias

## 9. Historia lineal vs merge commit · 15 min

```bash
git log --oneline --graph --decorate demo/merge/result
git show --summary demo/merge/result
```

Un fast-forward mueve una referencia. Un merge commit tiene dos padres y deja
visible dónde se integraron dos líneas de trabajo.

```text
Lineal:  A──B──C──D

Merge:   A──B────M
             ╲  ╱
              C──D
```

Una historia lineal facilita leer la secuencia; un merge commit conserva la
topología y el contexto de la rama.

## 10. Rebase vs merge · 15 min

```bash
git log --oneline --graph --decorate demo/rebase/before demo/rebase/after
git diff demo/rebase/before^..demo/rebase/before
git diff demo/rebase/after^..demo/rebase/after
```

Rebase reproduce commits sobre una base nueva. El contenido puede ser igual,
pero los SHA cambian.

- Rebasea tu rama local para actualizarla antes de compartirla.
- No rebasees sin coordinación una rama compartida.
- Usa merge cuando quieras preservar explícitamente la bifurcación.

## 11. Conflicto: Git necesita una decisión · 20 min

Las dos ramas cambian la misma línea:

```bash
git switch demo/conflict/player-message
git merge demo/conflict/computer-message
git status
```

Git insertará:

```text
 <<<<<<< HEAD
tu versión
 =======
la versión entrante
 >>>>>>> demo/conflict/computer-message
```

Edita `Program.cs`, combina las intenciones y elimina los marcadores:

```bash
git add Program.cs
git commit
git log --oneline --graph --decorate -6
```

**Rescate**

```bash
git merge --abort
git switch main
```

Consulta el resultado preparado con `git show demo/conflict/resolved:Program.cs`.

---

# Acto 4: colaborar en GitHub

## 12. Fork, origin y upstream · 15 min

```text
upstream: daniel-baf/REPO
      │ fork
      ▼
origin: TU_USUARIO/REPO
      │ clone, fetch, push
      ▼
repositorio local
```

```bash
git remote -v
git remote add upstream https://github.com/daniel-baf/REPO.git
git fetch upstream
```

- `fetch` descarga referencias sin modificar tus archivos.
- `pull` equivale normalmente a fetch más merge o rebase.
- `push` publica commits locales.

## 13. Push y Pull Request · 10 min

```bash
git switch practica/nombre-equipo
git push -u origin practica/nombre-equipo
```

Abre una PR hacia `main`. La rama base es el destino; compare es la propuesta.
Incluye qué cambió, por qué y cómo lo verificaste.

## 14. Code review · 20 min

El reviewer abre **Files changed** y deja un comentario específico, una
suggestion y un review con **Request changes**.

El autor responde en la misma rama:

```bash
# Editar según el review.
git add equipo.txt
git commit -m "docs: aplicar cambios solicitados"
git push
```

La PR se actualiza automáticamente. Después se resuelven conversaciones, se
solicita re-review y el reviewer aprueba. Una buena revisión explica impacto y
motivo; “está mal” no da una acción útil.

## 15. Estrategias de integración · 10 min

- **Create a merge commit:** conserva commits y agrega un nodo de merge.
- **Squash and merge:** crea un solo commit nuevo con el contenido de la PR.
- **Rebase and merge:** reproduce los commits sobre la rama base.

La estrategia depende del objetivo: trazabilidad, historia compacta o lineal.

---

# Final: chained Pull Requests

## 16. Una PR que depende de otra · 20 min

```text
step/07-refactor    → step/06-score
step/06-score       → step/05-validation
step/05-validation  → step/04-rules
step/04-rules       → step/03-computer
step/03-computer    → step/02-loop
step/02-loop        → step/01-menu
step/01-menu        → main
```

```bash
git push origin step/01-menu step/02-loop step/03-computer
git push origin step/04-rules step/05-validation step/06-score step/07-refactor
```

Al crear cada PR, selecciona como base la rama anterior. Así cada diff muestra
solo su incremento.

```text
[1/7] feat: mostrar menú del juego
[2/7] feat: repetir menú hasta salir
[3/7] feat: generar jugada de la computadora
[4/7] feat: determinar ganador
[5/7] fix: validar entradas
[6/7] feat: agregar marcador
[7/7] refactor: separar responsabilidades
```

## 17. La trampa del squash · 10 min

Si la PR 1 se integra con squash, GitHub crea un commit nuevo en `main`. La PR 2
todavía desciende de los commits originales de `step/01-menu`. Al cambiar su base
a `main`, pueden reaparecer cambios ya integrados.

La pila debe reorganizarse desde abajo hacia arriba mediante rebase. Esto se
conoce como **restack**. Para publicar historia reescrita:

```bash
git push --force-with-lease
```

`--force-with-lease` comprueba que no estás pisando trabajo remoto desconocido.
En este taller observamos el problema; no restackeamos siete ramas en vivo.

---

# Para investigar después

- `git cherry-pick`: trae un commit puntual. ¿Por qué cambia su SHA?
- `git worktree`: abre varias ramas en carpetas diferentes.
- `git blame`: llega al commit y al contexto, no busca culpables.
- `git bisect`: busca binariamente el commit que introdujo un fallo.
- `.gitignore`: evita empezar a seguir; no deja de seguir archivos existentes.

# Chuleta de rescate

```bash
git status                              # ¿Qué está pasando?
git diff                                # Cambios sin staging.
git diff --staged                       # Cambios preparados.
git log --oneline --graph --all         # ¿Dónde estoy en la historia?
git restore --staged ARCHIVO            # Sacar de staging, conservar edición.
git merge --abort                       # Cancelar un merge conflictivo.
git rebase --abort                      # Cancelar un rebase conflictivo.
git reflog                              # Posiciones recientes de HEAD.
```

Git no es una lista de comandos para memorizar. Es un modelo de snapshots,
referencias y colaboración. Cuando dudes: ejecuta `git status`, dibuja el grafo
y decide qué historia quieres construir.
