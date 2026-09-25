# SecureDocs

Sistema de gestión documental con control de acceso **RBAC y ABAC**, desarrollado como parte del Laboratorio 06.

SecureDocs permite autenticar usuarios, administrar documentos y controlar qué operaciones puede realizar cada usuario según su rol, sus atributos y las características del recurso al que intenta acceder.

El sistema utiliza **JWT para autenticación**, **RBAC para permisos por rol**, **ABAC para evaluar atributos adicionales** y un **registro de auditoría** para almacenar las decisiones de acceso.

---

## 1. Objetivo del proyecto

El objetivo de SecureDocs es implementar un sistema de gestión documental en el que el acceso a la información no dependa únicamente de haber iniciado sesión.

Cada solicitud pasa por diferentes controles de seguridad:

1. El usuario inicia sesión.
2. El sistema genera un token JWT.
3. RBAC comprueba los permisos asociados al rol.
4. ABAC evalúa atributos del usuario, documento y contexto.
5. La solicitud puede ser permitida o denegada.
6. Las decisiones de acceso evaluadas son registradas en auditoría.

Esto permite aplicar un control de acceso más específico que utilizar solamente usuario y contraseña.

---

## 2. Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| Node.js | Ejecución del backend |
| Express | API REST |
| TypeScript | Desarrollo de la lógica del backend |
| PostgreSQL | Base de datos |
| Prisma ORM | Acceso y manejo de datos |
| JWT | Autenticación mediante tokens |
| bcrypt | Cifrado de contraseñas |
| HTML | Estructura del frontend |
| CSS | Diseño de la interfaz |
| JavaScript | Comunicación del frontend con la API |

---

# 3. Arquitectura de SecureDocs

La aplicación está organizada separando la interfaz, autenticación, autorización, lógica del sistema, auditoría y persistencia de datos.

```mermaid
flowchart LR
    U[Usuario] --> FE[Frontend SecureDocs]

    FE --> API[API REST Express]

    API --> JWT[Autenticación JWT]

    JWT -->|Token inválido| D[Acceso denegado]
    JWT -->|Token válido| RBAC[Control RBAC]

    RBAC -->|Sin permiso| D
    RBAC -->|Con permiso| ABAC[Evaluación ABAC]

    ABAC -->|No cumple políticas| D
    ABAC -->|Cumple políticas| S[Servicios SecureDocs]

    S --> DB[(PostgreSQL)]

    ABAC --> AUD[Auditoría]
    D --> AUD

    AUD --> DB
```

### Flujo general

El frontend realiza solicitudes a la API REST.

El backend valida primero la identidad mediante JWT. Después, RBAC determina si el rol posee el permiso necesario para realizar la operación.

Cuando la operación requiere una evaluación más específica, ABAC analiza atributos relacionados con el usuario, el documento y el contexto.

La decisión puede ser:

- **PERMITIDO**
- **DENEGADO**

Las decisiones evaluadas pueden almacenarse en el registro de auditoría.

---

# 4. Flujo de autenticación y autorización

```mermaid
flowchart TD
    A[Usuario ingresa correo y contraseña] --> B[POST /api/auth/login]

    B --> C{Credenciales correctas?}

    C -->|No| D[401 No autorizado]

    C -->|Sí| E[Generar JWT]

    E --> F[Usuario solicita una operación]

    F --> G[Validar JWT]

    G --> H{Token válido?}

    H -->|No| D
    H -->|Sí| I[Evaluar RBAC]

    I --> J{El rol tiene permiso?}

    J -->|No| K[403 Acceso denegado]
    J -->|Sí| L[Evaluar ABAC cuando corresponda]

    L --> M{Cumple las políticas?}

    M -->|No| K
    M -->|Sí| N[Ejecutar operación]

    K --> O[Registrar decisión]
    N --> O
```

RBAC y ABAC cumplen funciones diferentes.

**RBAC** responde principalmente:

> ¿El rol de este usuario tiene permiso para realizar esta operación?

**ABAC** permite evaluar:

> Aunque tenga el permiso, ¿las condiciones del usuario, recurso y contexto permiten realizar esta operación?

---

# 5. Modelo de base de datos

El modelo utilizado por SecureDocs relaciona usuarios, roles, permisos, departamentos, documentos y registros de auditoría.

```mermaid
erDiagram

    ROL ||--o{ USUARIO : posee
    ROL ||--o{ ROL_PERMISO : contiene
    PERMISO ||--o{ ROL_PERMISO : asignado
    DEPARTAMENTO ||--o{ USUARIO : pertenece
    DEPARTAMENTO ||--o{ DOCUMENTO : clasifica
    USUARIO ||--o{ DOCUMENTO : propietario
    USUARIO ||--o{ AUDITORIA : genera
    DOCUMENTO ||--o{ AUDITORIA : relacionado

    ROL {
        int id PK
        string nombre
        string descripcion
    }

    PERMISO {
        int id PK
        string nombre
        string descripcion
    }

    ROL_PERMISO {
        int id PK
        int rolId FK
        int permisoId FK
    }

    DEPARTAMENTO {
        int id PK
    }

    USUARIO {
        int id PK
        string nombre
        string correo
        string password
        int rolId FK
        int departamentoId FK
        int nivelSeguridad
        string pais
        string tipoContrato
        string estado
    }

    DOCUMENTO {
        int id PK
        string titulo
        string descripcion
        int propietarioId FK
        int departamentoId FK
        int nivelConfidencialidad
        string pais
        string estado
    }

    AUDITORIA {
        int id PK
        int usuarioId FK
        int documentoId FK
        string accion
        string recurso
        string resultado
        string motivo
        string direccionIp
        string ubicacion
        string dispositivo
    }
```

> El diagrama representa de forma simplificada las entidades y relaciones utilizadas por SecureDocs.

---

# 6. Control de acceso RBAC

SecureDocs implementa **Role-Based Access Control (RBAC)**.

El funcionamiento general es:

```text
Usuario → Rol → Permisos → Operación
```

Se configuraron seis roles:

- ADMINISTRADOR
- GERENTE
- SUPERVISOR
- EMPLEADO
- AUDITOR
- INVITADO

## Matriz RBAC

| Permiso | Administrador | Gerente | Supervisor | Empleado | Auditor | Invitado |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Crear documento | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Consultar documento | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Modificar documento | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Eliminar documento | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Aprobar documento | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ver auditoría | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Gestionar usuarios | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Asignar roles | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

En total se registraron **24 relaciones entre roles y permisos**.

### Ejemplo

Un usuario con rol `EMPLEADO` posee:

```text
CREAR_DOCUMENTO
CONSULTAR_DOCUMENTO
MODIFICAR_DOCUMENTO
```

pero no posee:

```text
ELIMINAR_DOCUMENTO
APROBAR_DOCUMENTO
VER_AUDITORIA
GESTIONAR_USUARIOS
ASIGNAR_ROLES
```

Por lo tanto, aunque el usuario tenga una sesión válida, el backend puede responder con `403` cuando intenta ejecutar una operación no autorizada.

---

# 7. Control de acceso ABAC

SecureDocs también implementa **Attribute-Based Access Control (ABAC)**.

A diferencia de RBAC, ABAC no toma una decisión únicamente utilizando el rol.

El motor puede trabajar con atributos de cuatro grupos:

### Sujeto

Información relacionada con el usuario:

- ID
- rol
- departamento
- nivel de seguridad
- país
- tipo de contrato

### Recurso

Información relacionada con el documento:

- propietario
- departamento
- nivel de confidencialidad
- país

### Acción

Operación que el usuario intenta ejecutar.

Por ejemplo:

```text
CONSULTAR_DOCUMENTO
```

### Contexto

Información relacionada con la solicitud:

- hora
- dirección IP

El flujo utilizado es:

```mermaid
flowchart LR
    S[Atributos del usuario] --> P[Motor ABAC]
    R[Atributos del documento] --> P
    A[Acción solicitada] --> P
    C[Contexto] --> P

    P --> E{Evaluar políticas}

    E -->|Cumple| OK[PERMITIDO]
    E -->|No cumple| NO[DENEGADO]

    OK --> AUD[Auditoría]
    NO --> AUD
```

---

# 8. Matriz ABAC

La siguiente matriz resume los atributos utilizados por el sistema para evaluar el acceso a los documentos.

| Elemento | Atributo | Uso |
|---|---|---|
| Sujeto | `id` | Identifica al usuario |
| Sujeto | `rol` | Identifica el rol autenticado |
| Sujeto | `departamentoId` | Departamento del usuario |
| Sujeto | `nivelSeguridad` | Nivel de acceso del usuario |
| Sujeto | `pais` | País asociado al usuario |
| Sujeto | `tipoContrato` | Tipo de relación del usuario |
| Recurso | `propietarioId` | Propietario del documento |
| Recurso | `departamentoId` | Departamento del documento |
| Recurso | `nivelConfidencialidad` | Clasificación del documento |
| Recurso | `pais` | País asociado al documento |
| Acción | `accion` | Operación solicitada |
| Contexto | `hora` | Hora en que se realiza la solicitud |
| Contexto | `direccionIp` | Dirección IP de la solicitud |

La evaluación sigue el siguiente principio:

```text
Usuario + Recurso + Acción + Contexto
                  ↓
           Políticas ABAC
                  ↓
        PERMITIR / DENEGAR
```

De esta forma, tener un permiso RBAC no significa automáticamente que el usuario pueda acceder a cualquier documento.

---

# 9. Autenticación JWT

SecureDocs utiliza JSON Web Tokens para mantener la autenticación.

Después de iniciar sesión correctamente, el backend genera un token que contiene información básica del usuario:

```json
{
  "id": 1,
  "correo": "admin@securedocs.com",
  "rol": "ADMINISTRADOR"
}
```

El token tiene una duración configurada de:

```text
8 horas
```

Para acceder a rutas protegidas se utiliza:

```text
Authorization: Bearer <TOKEN>
```

El backend verifica el token antes de ejecutar los controles RBAC y ABAC.

---

# 10. Seguridad de contraseñas

Las contraseñas no se almacenan directamente en PostgreSQL.

SecureDocs utiliza **bcrypt** para generar el hash antes de guardar un usuario.

El proceso es:

```text
Contraseña
    ↓
bcrypt
    ↓
Hash
    ↓
PostgreSQL
```

Durante el inicio de sesión se compara la contraseña proporcionada con el hash almacenado.

---

# 11. API REST

## Autenticación

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Iniciar sesión |

## Usuarios

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/usuarios` | Listar usuarios |
| GET | `/api/usuarios/:id` | Consultar usuario |
| POST | `/api/usuarios` | Registrar usuario |
| PUT | `/api/usuarios/:id` | Modificar usuario |
| PATCH | `/api/usuarios/:id/activar` | Activar usuario |
| PATCH | `/api/usuarios/:id/desactivar` | Desactivar usuario |

Las operaciones administrativas de usuarios requieren el permiso correspondiente.

## Documentos

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/documentos` | Listar documentos |
| GET | `/api/documentos/:id` | Consultar documento |
| POST | `/api/documentos` | Crear documento |
| PUT | `/api/documentos/:id` | Modificar documento |
| DELETE | `/api/documentos/:id` | Eliminar documento |
| PATCH | `/api/documentos/:id/aprobar` | Aprobar documento |

## Auditoría

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/auditoria` | Consultar registros de auditoría |

El acceso a auditoría también está protegido mediante RBAC.

---

# 12. Registro de auditoría

SecureDocs dispone de un módulo de auditoría para registrar las decisiones de autorización evaluadas por el sistema.

Entre los datos considerados se encuentran:

- usuario
- documento
- acción
- recurso
- resultado
- motivo
- dirección IP
- dispositivo

Los resultados utilizados son:

```text
PERMITIDO
DENEGADO
```

Esto permite revisar posteriormente por qué una determinada operación fue permitida o rechazada.

---

# 13. Frontend

SecureDocs incluye una interfaz web sencilla conectada directamente con la API.

La interfaz contiene:

- inicio de sesión
- dashboard
- resumen del usuario
- listado de documentos
- creación de documentos
- consulta de documentos
- aprobación según el rol
- visualización de auditoría para roles autorizados
- cierre de sesión

La interfaz también adapta las opciones visibles de acuerdo con el rol.

Por ejemplo, un `INVITADO` no visualiza las mismas opciones que un `ADMINISTRADOR`.

> La ocultación de botones en el frontend mejora la experiencia del usuario, pero no constituye la seguridad principal. Los permisos vuelven a comprobarse en el backend mediante RBAC y ABAC.

---

# 14. Usuarios de demostración

El proyecto dispone de usuarios asociados a los diferentes roles para demostrar el funcionamiento del control de acceso.

| Rol | Correo |
|---|---|
| ADMINISTRADOR | `admin@securedocs.com` |
| GERENTE | `gerente@securedocs.com` |
| SUPERVISOR | `supervisor@securedocs.com` |
| EMPLEADO | `empleado@securedocs.com` |
| AUDITOR | `auditor@securedocs.com` |
| INVITADO | `invitado@securedocs.com` |

Las contraseñas de producción no deben almacenarse en el repositorio.

---

# 15. Instalación

## Requisitos

Antes de ejecutar SecureDocs se necesita:

- Node.js
- npm
- PostgreSQL 15 o superior
- Git

---

## 15.1 Clonar el repositorio

```bash
git clone https://github.com/faviosolorzano/Lab06_Solorzano.git
```

Ingresar al proyecto:

```bash
cd Lab06_Solorzano
```

---

## 15.2 Instalar dependencias

```bash
npm install
```

---

## 15.3 Configurar variables de entorno

Crear un archivo:

```text
.env
```

en la raíz del proyecto.

Configurar:

```env
DATABASE_URL="postgresql://USUARIO:CONTRASENA@localhost:5432/BASE_DE_DATOS"

JWT_SECRET="COLOCA_AQUI_UN_SECRETO_SEGURO"

PORT=3000
```

El archivo `.env` está excluido mediante `.gitignore` y **no debe subirse al repositorio**, porque contiene información sensible.

---

## 15.4 Preparar Prisma

Cuando se modifica el contrato de datos:

```bash
npx prisma contract emit
```

Para inicializar las tablas según la configuración del proyecto:

```bash
npx prisma db init
```

---

## 15.5 Datos iniciales RBAC

El proyecto incluye el script de inicialización utilizado para registrar roles, permisos y relaciones RBAC.

```bash
node --experimental-strip-types src/prisma/seed.ts
```

---

## 15.6 Ejecutar SecureDocs

```bash
node --experimental-strip-types server.js
```

Si el servidor inicia correctamente se mostrará:

```text
SecureDocs API ejecutándose en http://localhost:3000
```

Abrir en el navegador:

```text
http://localhost:3000
```

---

# 16. Estructura principal

```text
SecureDocs/
│
├── public/
│   ├── index.html
│   ├── dashboard.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── login.js
│       └── dashboard.js
│
├── src/
│   ├── authorization/
│   │   ├── rbac/
│   │   └── abac/
│   │
│   ├── middleware/
│   │   └── auth.middleware.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── documents/
│   │   └── audit/
│   │
│   ├── prisma/
│   │   ├── contract.prisma
│   │   ├── db.ts
│   │   └── seed.ts
│   │
│   └── app.js
│
├── prisma.config.ts
├── server.js
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

---

# 17. Casos de prueba

Para demostrar el funcionamiento de SecureDocs se deben comprobar escenarios de autenticación, RBAC, ABAC y auditoría.

Entre las evidencias se consideran:

- inicio de sesión correcto
- inicio de sesión incorrecto
- acceso mediante token JWT
- acceso sin token
- creación de documentos con un rol autorizado
- consulta de documentos
- aprobación con un rol autorizado
- intento de aprobación sin permiso
- intento de acceso a auditoría sin permiso
- acceso a auditoría mediante un rol autorizado
- acceso permitido por las políticas ABAC
- acceso denegado por las políticas ABAC

Las capturas y resultados obtenidos durante estas pruebas constituyen las evidencias del laboratorio.

---

# 18. Resumen de seguridad

SecureDocs aplica diferentes niveles de control:

```mermaid
flowchart TD
    A[Credenciales] --> B[bcrypt]
    B --> C[Autenticación]
    C --> D[JWT]
    D --> E[RBAC]
    E --> F[ABAC]
    F --> G[Documento]
    F --> H[Auditoría]
```

Cada mecanismo tiene una responsabilidad:

| Mecanismo | Responsabilidad |
|---|---|
| bcrypt | Protección de contraseñas |
| JWT | Identificación de la sesión |
| RBAC | Permisos según el rol |
| ABAC | Restricciones según atributos |
| Auditoría | Registro de decisiones de acceso |
| PostgreSQL | Persistencia de la información |

---

# 19. Entregables

El proyecto contempla los siguientes entregables:

- [x] Código fuente
- [x] Repositorio Git
- [x] README e instrucciones de instalación
- [x] Diagrama de arquitectura
- [x] Modelo de base de datos
- [x] Matriz RBAC
- [x] Matriz ABAC
- [x] Evidencias finales de casos de prueba
- [x] Evidencia final del registro de auditoría
- [x] Video de demostración

---

# 20. Autor

**Favio Solorzano**

Diseño y Desarrollo de Software  
TECSUP

---

## SecureDocs

**Autenticación + RBAC + ABAC + Auditoría**

Sistema de gestión documental orientado al control seguro de acceso a recursos.