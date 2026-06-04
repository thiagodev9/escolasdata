-- ============================================================
-- 007 — Diário visualizado pelos pais + Aviso antecipado de falta
-- ============================================================

-- Garantir que responsaveis tem campo de telefone
ALTER TABLE responsaveis ADD COLUMN IF NOT EXISTS telefone text;

-- Registro de quando o responsável visualizou um registro do diário
CREATE TABLE IF NOT EXISTS diario_visualizacoes (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registro_id    uuid REFERENCES registros_diarios(id) ON DELETE CASCADE,
  responsavel_id uuid REFERENCES responsaveis(id)      ON DELETE CASCADE,
  visto_em       timestamptz DEFAULT now(),
  UNIQUE(registro_id, responsavel_id)
);

-- Aviso antecipado de falta enviado pelo responsável
CREATE TABLE IF NOT EXISTS avisos_falta (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id      uuid REFERENCES escolas(id)       ON DELETE CASCADE,
  aluno_id       uuid REFERENCES alunos(id)        ON DELETE CASCADE,
  responsavel_id uuid REFERENCES responsaveis(id)  ON DELETE CASCADE,
  data           date NOT NULL,
  motivo         text,
  criado_em      timestamptz DEFAULT now(),
  UNIQUE(aluno_id, data)
);

ALTER TABLE diario_visualizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE avisos_falta         ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- diario_visualizacoes: só o próprio responsável vê/cria suas visualizações
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='diario_visualizacoes' AND policyname='responsavel gerencia visualizacoes') THEN
    CREATE POLICY "responsavel gerencia visualizacoes" ON diario_visualizacoes
      FOR ALL USING (responsavel_id IN (
        SELECT id FROM responsaveis WHERE email = auth.email()
      ));
  END IF;
  -- staff da escola pode ver visualizações dos registros da sua escola
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='diario_visualizacoes' AND policyname='staff ve visualizacoes') THEN
    CREATE POLICY "staff ve visualizacoes" ON diario_visualizacoes
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM registros_diarios r
          WHERE r.id = registro_id AND r.escola_id = auth_escola_id()
        )
      );
  END IF;

  -- avisos_falta: responsável cria/ve os seus; escola ve os da escola
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='avisos_falta' AND policyname='escola ve avisos falta') THEN
    CREATE POLICY "escola ve avisos falta" ON avisos_falta
      FOR SELECT USING (escola_id = auth_escola_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='avisos_falta' AND policyname='responsavel gerencia avisos falta') THEN
    CREATE POLICY "responsavel gerencia avisos falta" ON avisos_falta
      FOR ALL USING (responsavel_id IN (
        SELECT id FROM responsaveis WHERE email = auth.email()
      ));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_diario_vis_registro ON diario_visualizacoes(registro_id);
CREATE INDEX IF NOT EXISTS idx_avisos_falta_escola  ON avisos_falta(escola_id, data);
CREATE INDEX IF NOT EXISTS idx_avisos_falta_aluno   ON avisos_falta(aluno_id, data);
