# OTP Login — Segundo Portal

Flujo de autenticación sin contraseña para el segundo portal. El usuario ingresa su correo, recibe un código de 6 dígitos y lo usa para obtener sus tokens.

---

## Flujo general

```
1. Frontend solicita código  →  POST /auth/otp/request
2. Usuario recibe el código por correo (válido 10 minutos)
3. Frontend envía correo + código  →  POST /auth/otp/login
4. Backend responde con access_token, refresh_token y datos del usuario
```

---

## Endpoints

### 1. Solicitar código OTP

**`POST /auth/otp/request`**

Genera un código numérico de 6 dígitos y lo envía al correo indicado.
Si el correo no existe en el sistema devuelve `404`.

**Body**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Respuesta exitosa — `200 OK`**
```json
{
  "message": "Código enviado al correo"
}
```

**Errores posibles**

| Status | Motivo |
|--------|--------|
| `400`  | El campo `email` falta o no tiene formato de correo válido |
| `404`  | El correo no está registrado en el sistema |

---

### 2. Iniciar sesión con código OTP

**`POST /auth/otp/login`**

Valida el código recibido por correo y devuelve los tokens de sesión.

**Body**
```json
{
  "email": "usuario@ejemplo.com",
  "code": "382910"
}
```

> `code` debe ser exactamente 6 dígitos numéricos.

**Respuesta exitosa — `200 OK`**
```json
{
  "user": {
    "user": {
      "code": 42,
      "name": "Juan Pérez",
      "email": "usuario@ejemplo.com",
      "rolename": "vendedor"
    }
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": {
    "code": 42,
    "name": "Juan Pérez",
    "email": "usuario@ejemplo.com",
    "rolename": "vendedor"
  }
}
```

**Errores posibles**

| Status | Motivo |
|--------|--------|
| `400`  | Campos faltantes, email inválido, o `code` no tiene 6 dígitos |
| `401`  | Código incorrecto o ya fue utilizado |
| `401`  | Código expirado (más de 10 minutos desde que se solicitó) |

---

### 3. Refrescar tokens

**`POST /auth/otp/refresh`**

Genera un nuevo par de tokens a partir de un `refresh_token` válido, sin necesidad de volver a pedir el código OTP.

**Body**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta exitosa — `200 OK`**
```json
{
  "user": {
    "user": {
      "code": 42,
      "name": "Juan Pérez",
      "email": "usuario@ejemplo.com",
      "rolename": "vendedor"
    }
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": {
    "code": 42,
    "name": "Juan Pérez",
    "email": "usuario@ejemplo.com",
    "rolename": "vendedor"
  }
}
```

**Errores posibles**

| Status | Motivo |
|--------|--------|
| `401`  | Token inválido, malformado o expirado |
| `401`  | El usuario asociado al token ya no existe |

---

## Uso del access_token

Incluir el token en el header `Authorization` de cada petición autenticada:

```
Authorization: Bearer <access_token>
```

El `access_token` tiene vigencia de **1 día** (renovado tras refresh) o **1 año** (emitido en el login inicial).
El `refresh_token` tiene vigencia de **30 días**; usar `POST /auth/otp/refresh` para renovarlo.

---

## Notas

- Cada vez que se llama a `/auth/otp/request` los códigos anteriores del mismo correo quedan invalidados; solo el último código enviado es válido.
- El código expira a los **10 minutos** de haber sido solicitado.
- Un código solo puede usarse **una vez**; tras el login exitoso queda marcado como utilizado.
