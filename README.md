# TicoAutos Frontend

Frontend web de TicoAutos construido con Angular. Esta aplicación consume el API REST para autenticación, registros, publicaciones y acciones de escritura. También consume GraphQL para consultas de vehículos y preguntas.

URLs usadas en desarrollo:

- Frontend: `http://localhost:4200`
- API REST: `http://localhost:5105`
- GraphQL: `http://localhost:5268/graphql`
- API del padrón electoral: `http://localhost:8000`

Para que el frontend funcione completo, el backend REST y GraphQL deben estar corriendo.

## Requisitos

Instalar antes de empezar:

- Node.js LTS, recomendado Node 20 o Node 22
- npm
- Angular CLI, opcional porque el proyecto usa scripts de npm
- Git
- Backend de TicoAutos corriendo
- API del padrón corriendo si se va a probar registro

Verificar versiones:

node -v
npm -v

Si usa una versión impar de Node como 25, Angular puede mostrar advertencias. Puede compilar, pero para entrega es mejor usar una versión LTS.

## Descargar el repositorio

## Instalar dependencias

Desde la raíz del frontend:

npm install

Si npm falla por dependencias viejas o caché, limpiar e instalar de nuevo:

Remove-Item -Recurse -Force .\node_modules
Remove-Item -Force .\package-lock.json

Use ese bloque solo si la instalación normal falla.

## Levantar servicios antes del frontend

El frontend espera que estos servicios estén activos:

Terminal 1, padrón electoral:

cd C:...\cedulas-costa-rica

python -m uvicorn api.main:app --host 127.0.0.1 --port 8000

Terminal 2, API REST:

cd C:...\ticoautos-backend2.0
dotnet run --project .\TicoAutos.WebApi\TicoAutos.WebApi.csproj --launch-profile http

Terminal 3, GraphQL:

cd C:...ticoautos-backend2.0

dotnet run --project .\TicoAutos.GraphQL\TicoAutos.GraphQL.csproj --launch-profile http

Comprobar rápido:

```powershell
Invoke-RestMethod "http://localhost:5105/api/auth/cedula/901150261"
```

```powershell
$body = @{ query = "{ vehiclesTest { id brand model year price } }" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5268/graphql" -Method Post -ContentType "application/json" -Body $body
```

## Levantar Angular

Terminal 4:

cd C:...\ticoAutos-frontend2.0

npm run start

Abrir en el navegador:

http://localhost:4200

## Estructura principal

```text
src/app/core
  guards          Protección de rutas
  interceptors    Agrega el JWT a las peticiones
  models          Tipos usados por la app
  services        Auth, vehículos, preguntas y GraphQL

src/app/features/auth
  login           Login tradicional y botón de Google
  register        Registro tradicional con cédula y teléfono
  google-callback Flujo de Google y cédula
  verify-email    Confirmación de correo

src/app/features/vehicles
  vehicle-list       Lista de vehículos
  vehicle-detail     Detalle del vehículo
  publish-vehicle    Publicación
  edit-vehicle       Edición
  my-vehicles        Vehículos del usuario
  vehicle-questions  Preguntas y respuestas
```

## Qué consume cada parte

REST se usa para:

- Registro tradicional
- Login tradicional
- Verificación de correo
- Google OAuth
- Verificación de cédula
- 2FA
- Crear, editar y eliminar vehículos
- Crear preguntas y respuestas
- Validación de mensajes con reglas locales y OpenAI

GraphQL se usa para:

- Listar vehículos
- Ver detalle de vehículo
- Consultar preguntas de un vehículo
- Consultar preguntas del usuario autenticado

El endpoint GraphQL está en:

```text
src/app/core/services/graphql.service.ts
```

Actualmente apunta a:

```text
http://localhost:5268/graphql
```

Si Google muestra `redirect_uri_mismatch`, el problema se corrige en Google Cloud Console. El redirect URI debe ser:

```text
http://localhost:5105/api/auth/google/remote-callback
```
