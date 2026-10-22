-- 0007_rls_auto_enable.sql
-- Records the dashboard "Enable automatic RLS" setting (rls_auto_enable +
-- ensure_rls event trigger) in version control, so every environment
-- (local, staging, production) behaves identically even when rebuilt from
-- migrations alone. Safe to run whether or not the dashboard checkbox was
-- ticked at project creation.

create or replace function public.rls_auto_enable()
returns event_trigger
language plpgsql
security definer
set search_path to 'pg_catalog'
as $function$
declare
  cmd record;
begin
  for cmd in
    select *
    from pg_event_trigger_ddl_commands()
    where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      and object_type in ('table', 'partitioned table')
  loop
    if cmd.schema_name = 'public' then
      begin
        execute format('alter table if exists %s enable row level security', cmd.object_identity);
        raise log 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      exception when others then
        raise log 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      end;
    else
      raise log 'rls_auto_enable: skip % (schema %)', cmd.object_identity, cmd.schema_name;
    end if;
  end loop;
end;
$function$;

drop event trigger if exists ensure_rls;
create event trigger ensure_rls
  on ddl_command_end
  when tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  execute function public.rls_auto_enable();

comment on function public.rls_auto_enable() is
  'Safety net: enables RLS on new public tables. Writes no policies - tables remain deny-all until policies are granted.';
