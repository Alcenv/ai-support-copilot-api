# AI Support Copilot

## 1. Descripción General

Este proyecto implementa un **AI-Powered Support Co-Pilot**, capaz de:

* Recibir tickets de soporte en tiempo real.
* Procesarlos automáticamente mediante un microservicio de IA.
* Clasificar cada ticket por **categoría** y **sentimiento** usando un LLM.
* Orquestar el flujo mediante **n8n**.
* Visualizar los resultados en un **dashboard React con Realtime** usando Supabase.

El sistema está diseñado como una arquitectura **end-to-end**, desacoplada, escalable y desplegada completamente en la nube.

---

## 2. URLs de Producción (Entregables Obligatorios)

### 🌐 Dashboard Frontend (React + Vite)

👉 **URL:**

```
https://ai-support-copilot-api.vercel.app/
```

### ⚙️ Microservicio de IA (FastAPI)

👉 **URL:**

```
https://ai-support-copilot-api-69jq.onrender.com
```

Endpoint principal:

```
POST /process-ticket
```

---

## 3. Arquitectura del Sistema

```text
[Frontend React]
        |
        | (Webhook HTTP)
        v
      [n8n]
        |
        | (POST /process-ticket)
        v
[FastAPI + LangChain]
        |
        | (Update)
        v
    [Supabase DB]
        |
        | (Realtime)
        v
[Frontend React]
```

---

## 4. Base de Datos (Supabase)

La base de datos utiliza **Supabase (PostgreSQL)** con Realtime habilitado.

### Tabla `tickets`

Campos principales:

* `id` (UUID, Primary Key)
* `created_at` (Timestamp)
* `description` (Text)
* `category` (Text)
* `sentiment` (Text)
* `processed` (Boolean, default `false`)

📄 El esquema completo y las políticas RLS se encuentran en:

```
/supabase/setup.sql
```

---

## 5. Microservicio de IA (FastAPI + LangChain)

El microservicio está desarrollado en **Python + FastAPI**, con las siguientes características:

* Endpoint `POST /process-ticket`
* Integración con **LangChain**
* Soporte para múltiples proveedores de LLM (Gemini, OpenAI, HuggingFace)
* Manejo de errores robusto
* Logging controlado (sin exponer trazas en producción)
* Despliegue en **Render.com** usando Docker

### Flujo del endpoint

1. Recibe `ticket_id` y `description`.
2. Ejecuta clasificación con un LLM.
3. Extrae **categoría** y **sentimiento** en JSON estructurado.
4. Actualiza el ticket en Supabase (`processed = true`).

---

## 6. Estrategia de Prompt Engineering

La clasificación se basa en un **prompt determinista y estructurado**, diseñado para:

* Forzar salida **exclusivamente en JSON válido**.
* Limitar ambigüedades del modelo.
* Reducir alucinaciones.
* Facilitar validación con `Pydantic`.

### Principios aplicados:

* **Instrucciones explícitas** sobre formato de salida.
* Enumeración clara de categorías permitidas.
* Separación entre contexto y output esperado.
* Validación estricta posterior al LLM.

Esto permite que el sistema sea **confiable en producción** y fácil de extender.

---

## 7. Automatización Low-Code (n8n)

El flujo de n8n cumple las siguientes funciones:

* Se activa mediante un **Webhook HTTP** al crear un ticket.
* Llama al microservicio FastAPI (`/process-ticket`).
* Evalúa el sentimiento retornado.
* Si el sentimiento es **Negativo**, dispara una **notificación simulada** (email).
* Permite extensión futura (Slack, CRM, alertas, etc.).

📄 El flujo exportado se encuentra en:

```
/n8n-workflow/

- `ticket-processing_dev.json`: 
  Pensado para ejecución local usando Docker, MailHog y URLs internas.

- `ticket-processing_prod.json`: 
  Flujo conectado a servicios en producción (Render + Supabase Cloud).
```

---

## 8. Dashboard Frontend (React + TypeScript)

El frontend fue construido con:

* **React 18**
* **TypeScript**
* **Vite**
* **Tailwind CSS**
* **Supabase Realtime**

### Funcionalidades clave:

* Creación de tickets.
* Listado en tiempo real sin refresh.
* Visualización de:

  * Categoría
  * Sentimiento
  * Estado (`Processed`)
* Integración directa con Supabase (Realtime Channels).

---

## 9. DevOps & Despliegue

* **Backend:** Render.com (Docker)
* **Frontend:** Vercel
* **Base de datos:** Supabase
* **Automatización:** n8n Cloud
* Variables de entorno gestionadas por plataforma.
* `.env` excluidos del repositorio (best practices).

---

## 10. Evaluación End-to-End

✔️ El sistema procesa un ticket desde su creación hasta su visualización final
✔️ Clasificación automática con IA
✔️ Realtime funcional
✔️ Integración completa Supabase + n8n + FastAPI + React
✔️ Despliegue cloud operativo

---

## 11. Estructura del Repositorio

```text
.
├── supabase/
│   └── setup.sql
├── python-api/
│   ├── app/
│   ├── requirements.txt
│   └── Dockerfile
├── n8n-workflow/
│   └── ticket-processing.json
├── frontend/
│   └── (React + Vite)
└── README.md
```

---
