-- ============================================================
-- EduCare — Sprint 2: Matrícula, Relatórios, Onboarding
-- Execute no Supabase SQL Editor
-- ============================================================

-- Campos adicionais na tabela escolas
ALTER TABLE escolas ADD COLUMN IF NOT EXISTS cnpj          text;
ALTER TABLE escolas ADD COLUMN IF NOT EXISTS endereco      text;
ALTER TABLE escolas ADD COLUMN IF NOT EXISTS telefone      text;
ALTER TABLE escolas ADD COLUMN IF NOT EXISTS logo_url      text;
ALTER TABLE escolas ADD COLUMN IF NOT EXISTS onboarding_completo boolean DEFAULT false;

-- ============================================================
-- TABELA: matrículas (formulário público de pré-matrícula)
-- ============================================================
CREATE TABLE IF NOT EXISTS matriculas (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id         uuid REFERENCES escolas(id) ON DELETE CASCADE,

  -- Dados do aluno
  aluno_nome        text NOT NULL,
  aluno_nascimento  date NOT NULL,
  turma_interesse   text,

  -- Dados do responsável
  resp_nome         text NOT NULL,
  resp_email        text,
  resp_telefone     text NOT NULL,
  resp_parentesco   text DEFAULT 'pai/mãe',

  -- Status
  status            text DEFAULT 'aguardando'
    CHECK (status IN ('aguardando', 'aprovada', 'rejeitada')),
  observacoes       text,
  criado_em         timestamptz DEFAULT now()
);

ALTER TABLE matriculas ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode enviar uma matrícula (formulário público)
CREATE POLICY "insert_matricula_publica" ON matriculas
  FOR INSERT WITH CHECK (true);

-- Escola vê suas próprias matrículas
CREATE POLICY "escola_ve_matriculas" ON matriculas
  FOR SELECT USING (escola_id = auth_escola_id());

-- Diretora/admin gerencia matrículas
CREATE POLICY "diretora_gerencia_matriculas" ON matriculas
  FOR ALL USING (escola_id = auth_escola_id() AND auth_role() IN ('diretora', 'super_admin'));

CREATE INDEX IF NOT EXISTS idx_matriculas_escola ON matriculas(escola_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_matriculas_status  ON matriculas(escola_id, status);
