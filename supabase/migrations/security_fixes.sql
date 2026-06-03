-- ============================================================
-- SECURITY FIXES — Execute no Supabase SQL Editor
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 1. AUDIT_LOG — Append-only (bloquear UPDATE e DELETE)
--    Logs de auditoria nunca devem ser modificados ou apagados.
-- ──────────────────────────────────────────────────────────

-- Remove políticas anteriores que possam permitir UPDATE/DELETE
drop policy if exists "audit_escola"      on audit_log;
drop policy if exists "audit_log_escola"  on audit_log;

-- Apenas INSERT e SELECT permitidos via RLS
create policy "audit_log_insert" on audit_log
  for insert with check (
    escola_id = (select escola_id from usuarios where id = auth.uid())
  );

create policy "audit_log_select" on audit_log
  for select using (
    escola_id = (select escola_id from usuarios where id = auth.uid())
  );

-- Trigger que bloqueia UPDATE e DELETE no nível do banco
create or replace function fn_audit_log_readonly()
returns trigger language plpgsql security definer as $$
begin
  raise exception 'audit_log é append-only: UPDATE e DELETE não são permitidos.';
end;
$$;

drop trigger if exists trg_audit_log_readonly on audit_log;
create trigger trg_audit_log_readonly
  before update or delete on audit_log
  for each row execute function fn_audit_log_readonly();


-- ──────────────────────────────────────────────────────────
-- 2. LGPD_REQUESTS — Prevenir alteração de e-mail após criação
--    O e-mail do solicitante não deve ser editável depois de registrado.
-- ──────────────────────────────────────────────────────────

create or replace function fn_lgpd_protect_email()
returns trigger language plpgsql security definer as $$
begin
  if new.responsavel_email <> old.responsavel_email then
    raise exception 'responsavel_email não pode ser alterado após registro.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_lgpd_protect_email on lgpd_requests;
create trigger trg_lgpd_protect_email
  before update on lgpd_requests
  for each row execute function fn_lgpd_protect_email();


-- ──────────────────────────────────────────────────────────
-- 3. MENSALIDADES — Índice de performance + constraint
--    Garante que não existam duas mensalidades do mesmo aluno no mesmo mês.
-- ──────────────────────────────────────────────────────────

-- O unique index já foi criado na migration anterior, mas garantimos aqui
create unique index if not exists mensalidades_aluno_mes_unique
  on mensalidades(aluno_id, mes_referencia);


-- ──────────────────────────────────────────────────────────
-- 4. CONFIGURACOES_ESCOLA — Garantir uma config por escola
-- ──────────────────────────────────────────────────────────

-- Já tem UNIQUE na coluna escola_id, mas garantimos a policy de INSERT
drop policy if exists "config_escola_escrita" on configuracoes_escola;

create policy "config_escola_insert" on configuracoes_escola
  for insert with check (
    escola_id = (select escola_id from usuarios where id = auth.uid())
  );

create policy "config_escola_update" on configuracoes_escola
  for update using (
    escola_id = (select escola_id from usuarios where id = auth.uid())
  );

create policy "config_escola_delete" on configuracoes_escola
  for delete using (
    escola_id = (select escola_id from usuarios where id = auth.uid())
    and (select role from usuarios where id = auth.uid()) = 'super_admin'
  );
