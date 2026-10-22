-- 0001_extensions_and_types.sql
-- Prerequisites: pgcrypto for gen_random_uuid(); shared enums.

create extension if not exists pgcrypto;

create type public.admin_role as enum ('super_admin', 'content_admin', 'hr_admin', 'procurement_admin', 'viewer');
create type public.publish_status as enum ('draft', 'pending_review', 'published', 'archived');
create type public.appointment_status as enum ('new', 'confirmed', 'completed', 'cancelled');
create type public.feedback_status as enum ('new', 'in_review', 'resolved', 'closed');
