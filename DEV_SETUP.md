# 🛠️ Guía de Configuración Local – AI Support Copilot

Este documento explica cómo ejecutar **AI Support Copilot** en entorno local utilizando **Docker**, permitiendo reproducir el flujo completo end-to-end sin depender de servicios en producción.

El sistema está compuesto por **servicios desacoplados**, cada uno con su propio `docker-compose`, comunicándose mediante una **red Docker compartida**.

---

## 🧩 Visión General de la Arquitectura

### Servicios involucrados

| Servicio | Descripción                              | Ubicación                       | Puerto      |
| -------- | ---------------------------------------- | ------------------------------- | ----------- |
| AI API   | Clasificación de tickets (FastAPI + LLM) | `python-api/docker-compose.yml` | 8000        |
| n8n      | Orquestación y automatización de flujos  | `infra/docker-compose.n8n.yml`  | 5678        |
| MailHog  | Captura local de emails (SMTP fake)      | `infra/docker-compose.n8n.yml`  | 1025 / 8025 |

---

### 🔁 Flujo End-to-End

1. Se crea un ticket en Supabase (`tickets`).
2. n8n recibe un **webhook** con `ticket_id` y `description`.
3. n8n invoca la API de IA (`POST /process-ticket`).
4. El microservicio clasifica el ticket (categoría + sentimiento).
5. Supabase se actualiza (`processed = true`).
6. Si el sentimiento es **Negativo**, n8n envía una notificación por email (capturada por MailHog).

---

## 📋 Requisitos Previos

Antes de iniciar, asegúrate de tener:

* Docker ≥ 24
* Docker Compose ≥ 2
* `curl`
* Cuenta en Supabase (free tier)
* Token de HuggingFace (free tier)

---

## 🚀 Inicio Rápido (Recomendado)

Desde la raíz del proyecto ejecuta:

```bash
make network
make up
```

Esto levantará **todos los servicios necesarios**.

### Accesos locales

* **n8n UI:** [http://localhost:5678](http://localhost:5678)
* **MailHog UI:** [http://localhost:8025](http://localhost:8025)
* **Health Check API:** [http://localhost:8000/health](http://localhost:8000/health)

---

## 🌐 Red Docker Compartida (Obligatoria)

Todos los servicios se comunican mediante una red Docker común.

Crear una sola vez:

```bash
docker network create shared_network
```

> Si la red ya existe, Docker mostrará un error. Es seguro ignorarlo.

---

## 1️⃣ Configuración de Supabase

Crea un proyecto en Supabase y ejecuta el siguiente SQL:

```sql
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP DEFAULT now(),
  description TEXT NOT NULL,
  category TEXT,
  sentiment TEXT,
  processed BOOLEAN DEFAULT false
);
```

Este esquema completo también está disponible en:

```
/supabase/setup.sql
```

---

## 2️⃣ Variables de Entorno

### 📌 Microservicio de IA (`python-api/.env`)

Crea el archivo:

```
python-api/.env
```

Ejemplo:

```env
ENVIRONMENT=development

SUPABASE_URL=https://<project-id>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

LLM_PROVIDER=huggingface
HUGGINGFACE_API_TOKEN=hf_xxxxxxxxxxxxxxxxx
HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.2
```

⚠️ **Nunca** subas archivos `.env` al repositorio.
Usa `.env.example` como referencia.

---

## 3️⃣ Ejecución Manual de Servicios (Opcional)

### ▶️ API de IA

```bash
cd python-api
docker compose up --build
```

Verificar estado:

```bash
curl http://localhost:8000/health
```

---

### ▶️ n8n + MailHog

```bash
cd infra
docker compose -f docker-compose.n8n.yml up
```

---

## 4️⃣ Configuración de n8n

### Acceso a la UI

```
http://localhost:5678
```

### Importar Workflow

1. Importa el archivo:

```
/n8n-workflow/ticket-processing.json
```

2. Configura la URL del microservicio (DNS Docker):

```
http://ai-support-copilot-api:8000/process-ticket
```

3. Configuración SMTP (MailHog):

| Campo    | Valor     |
| -------- | --------- |
| Host     | `mailhog` |
| Puerto   | `1025`    |
| Secure   | ❌         |
| Usuario  | vacío     |
| Password | vacío     |

4. Activa el workflow

### Webhook disponible

```
POST http://localhost:5678/webhook/ticket-created
```

---

## 5️⃣ Prueba End-to-End

### Insertar ticket manualmente

```sql
INSERT INTO public.tickets (id, description, processed)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'No puedo acceder a mi cuenta y estoy muy molesto',
  false
);
```

---

### Disparar webhook

```bash
curl -X POST http://localhost:5678/webhook/ticket-created \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_id": "00000000-0000-0000-0000-000000000001",
    "description": "No puedo acceder a mi cuenta y estoy muy molesto"
  }'
```

---

### Resultado esperado

* Ticket actualizado en Supabase
* `processed = true`
* `category` y `sentiment` completados
* Email visible en MailHog si el sentimiento es **Negativo**

---

## 🧪 Comandos Útiles

```bash
make up
make down
make logs
make restart
```

---

## 🧠 Notas Importantes

* Todos los servicios usan la red `shared_network`.
* El microservicio es **agnóstico al proveedor de LLM**.
* MailHog es solo para testing local (no envía correos reales).
* El stack completo es **reproducible vía Docker**.

---