# Prompt para Agente n8n — Workflow Campus de Verano 2025

## Contexto
El formulario `campus.html` del CDE Fuenlabrada Falcons envía un **POST webhook** con los datos de inscripción al Campus de Verano. Necesito que crees el workflow completo en n8n.

---

## Webhook de entrada

**URL del trigger:** Crear un nodo `Webhook` con método POST. Copiar la URL generada y reemplazar `PENDIENTE_CONFIGURAR` en la variable `WEBHOOK_URL` del archivo `campus.html`.

**Estructura del JSON recibido:**
```json
{
  "alumno": {
    "nombre": "string",
    "apellido1": "string",
    "apellido2": "string",
    "dni": "string",
    "fechaNacimiento": "YYYY-MM-DD",
    "email": "string",
    "telefono": "string",
    "direccion": "string",
    "localidad": "string",
    "provincia": "string",
    "codigoPostal": "string"
  },
  "madre": {
    "nombre": "string",
    "apellidos": "string",
    "dni": "string",
    "telefono": "string",
    "email": "string"
  },
  "padre": {
    "nombre": "string",
    "apellidos": "string",
    "dni": "string",
    "telefono": "string",
    "email": "string"
  },
  "adicional": {
    "alergias": "string",
    "medicacion": "string",
    "miedos": "string",
    "talla": "string",
    "semanas": [{ "semana": "1", "nombre": "Semana 1" }],
    "totalEuros": 150
  },
  "firmas": {
    "madre": "data:image/png;base64,...",
    "padre": "data:image/png;base64,...",
    "alumno": "data:image/png;base64,..."
  },
  "fechaEnvio": "ISO 8601 timestamp"
}
```

---

## Nodos del workflow

### Nodo 1 — Webhook (trigger)
- Tipo: `Webhook`
- Método: POST
- Responder con: `{ "status": "ok" }` al recibir

---

### Nodo 2 — Google Sheets: Guardar inscripción
- Tipo: `Google Sheets`
- Operación: `Append Row`
- Spreadsheet: **Campus_Inscripciones** (crear si no existe)
- Sheet: `Inscripciones_2025`

Columnas en orden:
| Columna | Valor (expresión n8n) |
|---|---|
| Fecha envío | `{{ $json.fechaEnvio }}` |
| Nombre alumno | `{{ $json.alumno.nombre }}` |
| Apellido 1 | `{{ $json.alumno.apellido1 }}` |
| Apellido 2 | `{{ $json.alumno.apellido2 }}` |
| DNI alumno | `{{ $json.alumno.dni }}` |
| Fecha nacimiento | `{{ $json.alumno.fechaNacimiento }}` |
| Email alumno | `{{ $json.alumno.email }}` |
| Teléfono | `{{ $json.alumno.telefono }}` |
| Dirección | `{{ $json.alumno.direccion }}` |
| Localidad | `{{ $json.alumno.localidad }}` |
| Provincia | `{{ $json.alumno.provincia }}` |
| Código postal | `{{ $json.alumno.codigoPostal }}` |
| Nombre madre | `{{ $json.madre.nombre }}` |
| Apellidos madre | `{{ $json.madre.apellidos }}` |
| Teléfono madre | `{{ $json.madre.telefono }}` |
| Email madre | `{{ $json.madre.email }}` |
| Nombre padre | `{{ $json.padre.nombre }}` |
| Apellidos padre | `{{ $json.padre.apellidos }}` |
| Teléfono padre | `{{ $json.padre.telefono }}` |
| Email padre | `{{ $json.padre.email }}` |
| Alergias | `{{ $json.adicional.alergias }}` |
| Medicación | `{{ $json.adicional.medicacion }}` |
| Miedos | `{{ $json.adicional.miedos }}` |
| Talla | `{{ $json.adicional.talla }}` |
| Semanas | `{{ $json.adicional.semanas.map(s => s.nombre).join(', ') }}` |
| Total € | `{{ $json.adicional.totalEuros }}` |

---

### Nodo 3 — Email de confirmación (alumno + padres)
- Tipo: `Send Email` (o Gmail/SMTP según configuración)
- **Para:** construir lista dinámica con todos los emails que existan:
  ```
  {{ [$json.alumno.email, $json.madre.email, $json.padre.email].filter(e => e && e.trim()).join(',') }}
  ```
- **Asunto:** `✅ Inscripción Campus de Verano 2025 confirmada — {{ $json.alumno.nombre }} {{ $json.alumno.apellido1 }}`
- **Cuerpo (HTML):**

```html
<h2>¡Inscripción recibida!</h2>
<p>Hemos recibido correctamente la inscripción de <strong>{{ $json.alumno.nombre }} {{ $json.alumno.apellido1 }}</strong> al Campus de Verano 2025 del CDE Fuenlabrada Falcons.</p>

<h3>Semanas seleccionadas:</h3>
<ul>
{{ $json.adicional.semanas.map(s => '<li>' + s.nombre + ' — 50 €</li>').join('') }}
</ul>
<p><strong>Total: {{ $json.adicional.totalEuros }} €</strong></p>

<h3>Datos de pago:</h3>
<p>
  Titular: C.D.E. Fuenlabrada FALCONS<br>
  IBAN: ES13 0081 1387 8000 0132 3533<br>
  Concepto: CAMPUS + {{ $json.alumno.nombre }} {{ $json.alumno.apellido1 }}
</p>

<p style="margin-top:16px">¿Dudas? Escríbenos a <a href="mailto:fuenlabradafalcons@gmail.com">fuenlabradafalcons@gmail.com</a></p>
```

---

### Nodo 4 — Email de notificación al administrador
- Tipo: `Send Email`
- **Para:** `[EMAIL_ADMIN_CONFIGURABLE]` (definir como variable de entorno en n8n: `ADMIN_EMAIL`)
- **Asunto:** `🏕️ Nueva inscripción Campus — {{ $json.alumno.nombre }} {{ $json.alumno.apellido1 }}`
- **Cuerpo (HTML):**

```html
<h2>Nueva inscripción al Campus de Verano 2025</h2>
<table border="1" cellpadding="6" style="border-collapse:collapse">
  <tr><td><strong>Alumno/a</strong></td><td>{{ $json.alumno.nombre }} {{ $json.alumno.apellido1 }} {{ $json.alumno.apellido2 }}</td></tr>
  <tr><td><strong>Fecha nacimiento</strong></td><td>{{ $json.alumno.fechaNacimiento }}</td></tr>
  <tr><td><strong>Teléfono</strong></td><td>{{ $json.alumno.telefono }}</td></tr>
  <tr><td><strong>Email alumno</strong></td><td>{{ $json.alumno.email }}</td></tr>
  <tr><td><strong>Madre</strong></td><td>{{ $json.madre.nombre }} {{ $json.madre.apellidos }} — {{ $json.madre.telefono }}</td></tr>
  <tr><td><strong>Padre</strong></td><td>{{ $json.padre.nombre }} {{ $json.padre.apellidos }} — {{ $json.padre.telefono }}</td></tr>
  <tr><td><strong>Alergias</strong></td><td>{{ $json.adicional.alergias }}</td></tr>
  <tr><td><strong>Medicación</strong></td><td>{{ $json.adicional.medicacion }}</td></tr>
  <tr><td><strong>Semanas</strong></td><td>{{ $json.adicional.semanas.map(s => s.nombre).join(', ') }}</td></tr>
  <tr><td><strong>Total</strong></td><td>{{ $json.adicional.totalEuros }} €</td></tr>
  <tr><td><strong>Fecha envío</strong></td><td>{{ $json.fechaEnvio }}</td></tr>
</table>
```

---

### Nodo 5 — Guardar firmas en Google Drive

Para cada firma (madre, alumno — padre es opcional), crear 3 sub-nodos:

**5a. Convertir base64 a binario** (nodo `Code` en JavaScript):
```javascript
// Para la firma de la madre (repetir para padre y alumno):
const base64 = $json.firmas.madre;
const base64Data = base64.replace(/^data:image\/png;base64,/, '');
const buffer = Buffer.from(base64Data, 'base64');

return [{
  json: { alumnoNombre: $json.alumno.nombre + '_' + $json.alumno.apellido1 },
  binary: {
    firma_madre: {
      data: base64Data,
      mimeType: 'image/png',
      fileName: 'firma_madre.png'
    }
  }
}];
```

**5b. Crear carpeta en Drive** (nodo `Google Drive` → Create Folder):
- Nombre carpeta: `{{ $json.alumno.nombre }}_{{ $json.alumno.apellido1 }}`
- Carpeta padre: `Firmas_Campus_2025` (crear esta carpeta raíz manualmente en Drive antes)

**5c. Subir cada firma** (nodo `Google Drive` → Upload File):
- Archivo binario: firma_madre / firma_padre / firma_alumno
- Nombre archivo: `firma_madre.png` / `firma_padre.png` / `firma_alumno.png`
- Carpeta destino: ID de la carpeta creada en 5b

---

## Configuración requerida antes de activar

1. **Google Sheets:** Crear spreadsheet "Campus_Inscripciones" y conectar cuenta Google en n8n
2. **Google Drive:** Crear carpeta raíz "Firmas_Campus_2025" y conectar cuenta Google
3. **Email:** Configurar credenciales SMTP o Gmail en n8n
4. **Variable admin:** Configurar `ADMIN_EMAIL` con el email del administrador del club
5. **Webhook URL:** Copiar URL del trigger y pegarla en `WEBHOOK_URL` en `campus.html`

---

## Diagrama del workflow

```
[Webhook POST]
      |
      ├──→ [Google Sheets: Append Row]
      |
      ├──→ [Email confirmación → alumno + padres]
      |
      ├──→ [Email notificación → admin]
      |
      └──→ [Code: base64 → binary]
                  |
                  └──→ [Drive: Crear carpeta alumno]
                              |
                              ├──→ [Drive: Subir firma madre]
                              ├──→ [Drive: Subir firma padre (si existe)]
                              └──→ [Drive: Subir firma alumno]
```
