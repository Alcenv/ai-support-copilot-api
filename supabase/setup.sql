-- =========================================================
-- Extensions
-- =========================================================
-- Required for UUID generation
create extension if not exists "uuid-ossp";

-- =========================================================
-- Table: tickets
-- =========================================================
-- Stores raw support tickets and their AI-enriched metadata.
-- The database is intentionally kept schema-light:
-- semantic validation is handled at the API / AI layer.
create table if not exists public.tickets (
    id uuid primary key default uuid_generate_v4(),
    created_at timestamptz not null default now(),

    -- Raw user input
    description text not null,

    -- AI-enriched fields (populated asynchronously)
    category text,
    sentiment text,

    -- Processing state
    processed boolean not null default false
);

-- =========================================================
-- Indexes (performance & common access patterns)
-- =========================================================

-- Optimized for dashboard ordering (latest first)
create index if not exists idx_tickets_created_at
    on public.tickets (created_at desc);

-- Optimized for automation and background processing
create index if not exists idx_tickets_processed
    on public.tickets (processed);

-- Optimized for filtering and analytics
create index if not exists idx_tickets_sentiment
    on public.tickets (sentiment);

-- =========================================================
-- Row Level Security (RLS)
-- =========================================================
-- RLS is enabled to ensure strict separation of responsibilities
-- between frontend users and backend services.
alter table public.tickets enable row level security;

-- ---------------------------------------------------------
-- Policy: Read access (Dashboard)
-- ---------------------------------------------------------
-- Authenticated users can read tickets for visualization purposes.
create policy "tickets_read_authenticated"
on public.tickets
for select
to authenticated
using (true);

-- ---------------------------------------------------------
-- Policy: Insert access (Frontend)
-- ---------------------------------------------------------
-- Authenticated users can only create new tickets.
-- Classification fields are intentionally excluded from client control.
create policy "tickets_insert_authenticated"
on public.tickets
for insert
to authenticated
with check (
    description is not null
);

-- ---------------------------------------------------------
-- Policy: Update access (Backend / AI processor)
-- ---------------------------------------------------------
-- Only the service_role is allowed to enrich tickets
-- with AI-generated metadata and update processing state.
create policy "tickets_update_service_role"
on public.tickets
for update
to service_role
using (true)
with check (true);
