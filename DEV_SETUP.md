# 🛠 Developer Setup – AI Support Copilot

This guide explains how to run the **AI Support Copilot** stack locally using Docker.

The system is composed of **independent services**, each with its own Docker Compose file, connected through a shared Docker network.

---

## 🧩 Architecture Overview

### Services

| Service | Purpose | Location | Port |
|------|------|------|------|
| AI API | Ticket classification (LLM + FastAPI) | `python-api/docker-compose.yml` | 8000 |
| n8n | Workflow automation | `infra/docker-compose.n8n.yml` | 5678 |
| MailHog | Local email inbox (SMTP) | `infra/docker-compose.n8n.yml` | 8025 / 1025 |

---

### End-to-End Flow

1. A ticket is created in Supabase (`tickets` table).
2. n8n receives a webhook with `ticket_id` + `description`.
3. n8n calls the AI API `POST /process-ticket`.
4. The AI API classifies the ticket (category + sentiment).
5. Supabase is updated (`processed=true`).
6. If sentiment is `Negative`, n8n sends an email (captured by MailHog).

---

## 📋 Prerequisites

- Docker ≥ 24
- Docker Compose ≥ 2
- curl
- Supabase account (free tier)
- HuggingFace account + token (free tier)

---

## 🚀 Quick Start (Recommended)

From the project root:

```bash
make network
make up
````

That’s it.

Then open:

* **n8n UI** → [http://localhost:5678](http://localhost:5678)
* **MailHog UI** → [http://localhost:8025](http://localhost:8025)
* **API Health** → [http://localhost:8000/health](http://localhost:8000/health)

---

## 🌐 Docker Network (Required)

All services communicate via a shared Docker network.

Create it once:

```bash
docker network create shared_network
```

> If it already exists, Docker will show an error — safe to ignore.

---

## 1️⃣ Supabase Setup

Create a new Supabase project and run the following SQL:

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

---

## 2️⃣ Environment Variables

### 📌 AI API (`python-api/.env`)

Create:

```text
ai-support-copilot/python-api/.env
```

Example:

```env
ENVIRONMENT=development

SUPABASE_URL=https://<project-id>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<legacy-service-role-jwt>

LLM_PROVIDER=huggingface
HUGGINGFACE_API_TOKEN=hf_xxxxxxxxxxxxxxxxx
HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.2
```

⚠️ Never commit `.env` files.
Use `.env.example` as reference.

---

## 3️⃣ Running Services Manually (Optional)

### AI API

```bash
cd python-api
docker compose up --build
```

Health check:

```bash
curl http://localhost:8000/health
```

---

### n8n + MailHog

```bash
cd infra
docker compose -f docker-compose.n8n.yml up
```

---

## 4️⃣ n8n Configuration

### UI

```
http://localhost:5678
```

### Import Workflow

1. Import workflow JSON:

```
ai-support-copilot/n8n-workflow/ai-ticket-processing.json
```

2. Configure API request URL (Docker DNS):

```
http://ai-support-copilot-api:8000/process-ticket
```

3. SMTP Configuration (MailHog):

* Host: `mailhog`
* Port: `1025`
* Secure: OFF
* Username / Password: empty

4. Activate the workflow

Webhook endpoint:

```
POST http://localhost:5678/webhook/ticket-created
```

---

## 5️⃣ End-to-End Test

### Insert Ticket

```sql
INSERT INTO public.tickets (id, description, processed)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'No puedo acceder a mi cuenta y estoy muy molesto',
  false
);
```

### Trigger Webhook

```bash
curl -X POST http://localhost:5678/webhook/ticket-created \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_id": "00000000-0000-0000-0000-000000000001",
    "description": "No puedo acceder a mi cuenta y estoy muy molesto"
  }'
```

### Expected Result

* Ticket updated in Supabase
* `processed = true`
* `category` and `sentiment` filled
* Email appears in MailHog if sentiment is `Negative`

---

## 🧪 Useful Commands

```bash
make up
make down
make logs
make restart
```

---

## 🧠 Notes

* All services communicate through `shared_network`.
* The AI API is LLM-provider agnostic.
* MailHog is for local testing only (no real emails).
* The system is fully reproducible using Docker.

```