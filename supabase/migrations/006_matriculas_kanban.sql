-- ============================================================
-- 006 — Kanban de Matrículas: novas etapas + observação interna
-- ============================================================

-- Remove constraint antiga
ALTER TABLE matriculas DROP CONSTRAINT IF EXISTS matriculas_status_check;

-- Migra registros antigos: 'aguardando' → 'nova'
UPDATE matriculas SET status = 'nova' WHERE status = 'aguardando';

-- Nova constraint com todas as etapas do funil
ALTER TABLE matriculas ADD CONSTRAINT matriculas_status_check
  CHECK (status IN ('nova','contato','visita','documentacao','aprovada','rejeitada'));

-- Campos adicionais
ALTER TABLE matriculas ADD COLUMN IF NOT EXISTS observacao_interna text;
ALTER TABLE matriculas ADD COLUMN IF NOT EXISTS atualizado_em      timestamptz DEFAULT now();

-- Índice para ordenar por etapa
CREATE INDEX IF NOT EXISTS idx_matriculas_escola_status ON matriculas(escola_id, status);
