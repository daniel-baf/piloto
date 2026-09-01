# Git Quest: del primer commit a chained PRs

Taller práctico de Git y GitHub para principiantes. Durante cuatro horas veremos
evolucionar una aplicación de consola escrita en C# mientras aprendemos a leer y
construir su historia.

La aplicación ya está preparada en ramas acumulativas. No hace falta programarla
en vivo: cada rama representa el siguiente paso del producto y cada commit explica
por qué cambió.

## Empezar

1. Abre [`TALLER.md`](TALLER.md) para seguir el recorrido completo.
2. Abre [`presentacion/index.html`](presentacion/index.html) para proyectar la guía visual.
3. Comprueba las ramas disponibles con `git branch --all`.
4. Cambia entre versiones con `git switch step/01-menu`.

## Ejecutar la aplicación

Con .NET 8 instalado:

```bash
dotnet run
```

Con Docker, sin instalar .NET:

```bash
docker run --rm -it \
  -v "$PWD:/app" -w /app \
  mcr.microsoft.com/dotnet/sdk:8.0 dotnet run
```

En PowerShell reemplaza `$PWD` por `${PWD}`.

## Evolución

```text
main
└── step/01-menu
    └── step/02-loop
        └── step/03-computer
            └── step/04-rules
                └── step/05-validation
                    └── step/06-score
                        └── step/07-refactor
```

Estas dependencias se convertirán al final en Pull Requests encadenadas.

## Autor

Taller preparado por [daniel-baf](https://github.com/daniel-baf).
