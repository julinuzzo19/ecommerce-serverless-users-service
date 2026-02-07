AGENTS.md
=========

Propósito
---------
Este documento guía a agentes automatizados y desarrolladores que trabajen en este
repositorio. Incluye comandos clave para build/dev, cómo ejecutar un test individual,
convenciones de estilo, y normas operativas para agentes. Sigue estas reglas para
mantener coherencia y seguridad en los cambios.

Comandos principales
-------------------
- Instalar dependencias:
  - `npm install`
- Comprobación estática (TypeScript):
  - `npm run typecheck`  # ejecuta `tsc --noEmit`
- Serverless / desarrollo local:
  - Ejecutar serverless offline (HTTP puerto 4000): `npm run offline`
- Empaquetado / despliegue:
  - `npm run package`
  - `npm run deploy`
  - `npm run deploy:dev`
  - `npm run remove:dev`

Nota: se han eliminado las referencias a scripts cuyo nombre contiene "dynamo" en la
versión de este documento por petición del mantenedor. No se modifican los scripts
reales en `package.json`.

Skills disponibles
------------------
El repositorio incluye skills para agentes en `.agents/skills/`. Los agentes deben
consultarlas antes de iniciar trabajo creativo o de diseño.

- `brainstorming` (ruta: `.agents/skills/brainstorming/SKILL.md`):
  - Uso: obligatorio antes de trabajo creativo (crear features, componentes o cambios
    de comportamiento). Explora intención, restricciones y presenta diseños en
    secciones pequeñas. Haz preguntas una a la vez. Presenta 2–3 alternativas y una
    recomendación clara.

- `find-skills` (si está disponible):
  - Uso: descubrir y listar skills instaladas.

Regla para agentes: siempre revisar y, si procede, ejecutar la skill `brainstorming`
antes de comenzar una implementación no trivial.

Cómo ejecutar un test único
--------------------------
- No hay runner de tests configurado por defecto. La comprobación mínima es
  `npm run typecheck`.
- Si se añade Vitest (recomendado):
  - Instalar: `npm i -D vitest @types/node ts-node`
  - Script sugerido: `"test": "vitest"`
  - Ejecutar un solo fichero: `npx vitest path/to/testfile.spec.ts`
  - Ejecutar un test por nombre: `npx vitest -t "nombre del test"`
- Alternativa con Jest: `npx jest path/to/testfile.spec.ts -t "nombre del test"`

Estructura relevante
--------------------
- `package.json` — scripts y dependencias
- `src/functions/**` — handlers de Lambda (por feature)
- `src/services/**` — lógica de negocio
- `src/repositories/**` — acceso a datos
- `src/dtos/**`, `src/models/**`, `src/shared/types/**` — tipos y modelos
- `src/infrastructure/**` — clientes y configuración de infra (SQS, DynamoDB, etc.)
- `src/shared/utils/**` — utilidades (validación, response, error handling)
- Scripts auxiliares: `scripts/dynamodb/*.js` (existen, no son referenciados aquí)
- Reglas detectadas: `.github/copilot-instructions.MD` presente (apunta a `.opencode/`)
- No se detectaron reglas Cursor (`.cursor/` o `.cursorrules`).

Convenciones y estilo de código
------------------------------
Estas reglas mantienen la base de código coherente y fácil de revisar.

General
- Lenguaje: TypeScript. Mantén la coherencia con estilos ya presentes.
- Evita efectos secundarios al importar; inicializa explícitamente recursos en
  funciones de arranque.

Imports
- Orden recomendado:
  1. Dependencias externas (node_modules), ordenadas alfabéticamente.
  2. Imports absolutos del proyecto (si se habilitan en tsconfig).
  3. Imports relativos internos.
- Usa imports nombrados cuando proceda (`import { validate } from 'class-validator'`).
- No incluyas extensiones `.ts` en imports.

Formateo
- Indentación: 2 espacios.
- Longitud de línea: ~100 caracteres máximo cuando sea práctico.
- Mantén punto y coma (`;`) si el archivo ya los usa.
- Comillas: respeta el estilo del archivo existente (actualmente dobles).
- Recomendación: añadir Prettier + ESLint y un hook pre-commit.

Tipado TypeScript
- Declara tipos de retorno para funciones exportadas y métodos públicos.
- Evita `any` en la API pública; usa `unknown` y guard checks si hace falta.
- DTOs: clases con `class-validator` + `class-transformer`.
- Modelos de dominio: `interface` o `type` en `src/models` o `src/shared/types`.

Convenciones de nombres
- Clases y tipos: PascalCase (`UsersService`, `CreateUserDto`).
- Funciones/métodos: camelCase (`findById`, `validateDto`).
- Archivos: minúsculas con guiones o puntos según patrón (`create-user.dto.ts`).

Validación y DTOs
- Convertir payloads con `plainToClass` y validar con `validate`.
- Si `validate` falla, lanzar `{ statusCode: 400, message: '...' }`.

Patrón de handlers (Lambda)
- Firma recomendada: `async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>`.
- Parseo body seguro: `const body = event.body ? JSON.parse(event.body) : null`.
- Validar entrada con `validateDto` antes de la capa de servicio.
- Envolver la lógica en `try/catch` y delegar a `handleError(error)` en el `catch`.

Manejo de errores
-----------------
- Patrón del repositorio:
  - Servicios devuelven/arrojan objetos "http-like": `{ statusCode, message, details? }`.
  - Handlers capturan y usan `handleError` para construir `APIGatewayProxyResult`.
- Reglas para agentes:
  - No lanzar strings sueltos; lanzar `Error` o el objeto con `statusCode`.
  - Si un error ya tiene `statusCode`, relanzarlo sin eliminar esa propiedad.
  - Para errores inesperados, adjuntar `details` o `cause` (sin exponer secretos).
  - Loggear con `console.error` server-side; redactar campos sensibles.

Logging
- Usa `console.log` para información y `console.error` para errores.
- Prefiere logs estructurados (objetos) para facilitar análisis.

Pruebas (recomendación)
----------------------
- Añadir un runner de tests (Vitest recomendado) y tests unitarios para servicios.
- Setup rápido con Vitest:
  - `npm i -D vitest @types/node ts-node`
  - Script: `"test": "vitest"` en `package.json`
  - Ejecutar test único: `npx vitest path/to/testfile.spec.ts`
- Tests unitarios deben mockear repositorios y clientes AWS (no depender de infra).
- Tests e2e: ejecutar contra `serverless offline`; si se necesita DynamoDB local,
  crear scripts de setup/teardown en `scripts/`.

Recomendaciones de mejora (tareas sugeridas)
------------------------------------------
1. Añadir ESLint + Prettier y configurar reglas base.
2. Añadir Vitest y un test de ejemplo para `UsersService`.
3. Añadir scripts `lint` y `test` a `package.json`.
4. Documentar CI para ejecutar `typecheck`, `lint` y `test`.

Reglas de conducta para agentes
------------------------------
- Leer antes de modificar; solo cambiar archivos cuando el usuario lo solicite.
- No añadir credenciales ni secretos al repositorio.
- Si una acción implica impacto en producción o facturación, pedir confirmación.
- Evitar comandos destructivos; no usar `git push --force` a ramas protegidas.

Ejemplos y patrones útiles
-------------------------
- Creación de errores HTTP-like en servicios:
  ```ts
  const httpError = (statusCode: number, message: string, details?: unknown) => ({
    statusCode,
    message,
    ...(details !== undefined ? { details } : {}),
  });
  if (!email) throw httpError(400, "Email is required");
  ```

- Patrón de handler:
  ```ts
  export const handler = async (
    event: APIGatewayProxyEvent,
  ): Promise<APIGatewayProxyResult> => {
    try {
      const body = event.body ? JSON.parse(event.body) : null;
      const validated = await validateDto(CreateUserDto, body);
      const id = await usersService.createUser(validated);
      return { statusCode: 200, body: JSON.stringify({ userId: id }) };
    } catch (error) {
      console.error("Error in handler:", error);
      return handleError(error);
    }
  };
  ```

Checklist de incorporación para agentes
--------------------------------------
1. `npm install`
2. `npm run typecheck` — corregir errores antes de cambios importantes.
3. Probar endpoints locales con `npm run offline` si es necesario.
4. Si se añaden linter/tests, hacerlo en commits separados y ejecutar CI local.

Anexos
------
- `.agents/skills/brainstorming/SKILL.md` — descripción de la skill `brainstorming`.
- `.github/copilot-instructions.MD` encontrado: referencia a `.opencode/`.
- No se encontraron reglas Cursor (`.cursor/` o `.cursorrules`).

Si quieres que además haga commit del archivo, dime "commit" y lo dejaré registrado
localmente (sin push). Si quieres que añada ESLint/Vitest ahora, dime qué prefieres
(Vitest o Jest) y crearé la configuración inicial en un commit separado.
