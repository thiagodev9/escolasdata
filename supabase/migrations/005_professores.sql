-- ============================================================
-- 005 — Módulo Professores: Currículo, Avisos Internos, Ausências
-- ============================================================

-- Planejamento semanal (um por turma por semana)
CREATE TABLE IF NOT EXISTS planejamentos_semanais (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id     uuid REFERENCES escolas(id) ON DELETE CASCADE,
  turma_id      uuid REFERENCES turmas(id) ON DELETE CASCADE,
  usuario_id    uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  semana_inicio date NOT NULL,
  status        text DEFAULT 'rascunho' CHECK (status IN ('rascunho','enviado','aprovado')),
  criado_em     timestamptz DEFAULT now(),
  UNIQUE(escola_id, turma_id, semana_inicio)
);

-- Atividades por dia dentro de um planejamento
CREATE TABLE IF NOT EXISTS planejamento_dias (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  planejamento_id uuid REFERENCES planejamentos_semanais(id) ON DELETE CASCADE,
  dia_semana      int NOT NULL CHECK (dia_semana BETWEEN 1 AND 5), -- 1=Seg 5=Sex
  objetivo        text DEFAULT '',
  atividades      text DEFAULT '',
  materiais       text DEFAULT '',
  UNIQUE(planejamento_id, dia_semana)
);

-- Avisos internos (diretora → professoras)
CREATE TABLE IF NOT EXISTS avisos_internos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id   uuid REFERENCES escolas(id) ON DELETE CASCADE,
  titulo      text NOT NULL,
  conteudo    text NOT NULL,
  prioridade  text DEFAULT 'normal' CHECK (prioridade IN ('normal','urgente')),
  criado_por  uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em   timestamptz DEFAULT now()
);

-- Controle de leitura dos avisos
CREATE TABLE IF NOT EXISTS avisos_lidos (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aviso_id   uuid REFERENCES avisos_internos(id) ON DELETE CASCADE,
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  lido_em    timestamptz DEFAULT now(),
  UNIQUE(aviso_id, usuario_id)
);

-- Ausências/faltas dos colaboradores
CREATE TABLE IF NOT EXISTS ausencias_professores (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id            uuid REFERENCES escolas(id) ON DELETE CASCADE,
  colaborador_id       uuid REFERENCES colaboradores(id) ON DELETE CASCADE,
  data                 date NOT NULL,
  motivo               text,
  substituido_por_nome text,
  criado_em            timestamptz DEFAULT now()
);

ALTER TABLE planejamentos_semanais ENABLE ROW LEVEL SECURITY;
ALTER TABLE planejamento_dias      ENABLE ROW LEVEL SECURITY;
ALTER TABLE avisos_internos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE avisos_lidos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE ausencias_professores  ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- planejamentos_semanais
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='planejamentos_semanais' AND policyname='escola ve planejamentos') THEN
    CREATE POLICY "escola ve planejamentos" ON planejamentos_semanais FOR SELECT USING (escola_id = auth_escola_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='planejamentos_semanais' AND policyname='staff gerencia planejamentos') THEN
    CREATE POLICY "staff gerencia planejamentos" ON planejamentos_semanais FOR ALL USING (escola_id = auth_escola_id() AND auth_role() IN ('professora','diretora','super_admin'));
  END IF;

  -- planejamento_dias
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='planejamento_dias' AND policyname='staff ve dias') THEN
    CREATE POLICY "staff ve dias" ON planejamento_dias FOR SELECT USING (
      EXISTS (SELECT 1 FROM planejamentos_semanais p WHERE p.id = planejamento_id AND p.escola_id = auth_escola_id())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='planejamento_dias' AND policyname='staff gerencia dias') THEN
    CREATE POLICY "staff gerencia dias" ON planejamento_dias FOR ALL USING (
      EXISTS (SELECT 1 FROM planejamentos_semanais p WHERE p.id = planejamento_id AND p.escola_id = auth_escola_id() AND auth_role() IN ('professora','diretora','super_admin'))
    );
  END IF;

  -- avisos_internos
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='avisos_internos' AND policyname='escola ve avisos internos') THEN
    CREATE POLICY "escola ve avisos internos" ON avisos_internos FOR SELECT USING (escola_id = auth_escola_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='avisos_internos' AND policyname='diretora gerencia avisos internos') THEN
    CREATE POLICY "diretora gerencia avisos internos" ON avisos_internos FOR ALL USING (escola_id = auth_escola_id() AND auth_role() IN ('diretora','super_admin'));
  END IF;

  -- avisos_lidos
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='avisos_lidos' AND policyname='usuario ve proprias leituras') THEN
    CREATE POLICY "usuario ve proprias leituras" ON avisos_lidos FOR SELECT USING (usuario_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='avisos_lidos' AND policyname='usuario marca lido') THEN
    CREATE POLICY "usuario marca lido" ON avisos_lidos FOR INSERT WITH CHECK (usuario_id = auth.uid());
  END IF;

  -- ausencias_professores
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ausencias_professores' AND policyname='escola ve ausencias') THEN
    CREATE POLICY "escola ve ausencias" ON ausencias_professores FOR SELECT USING (escola_id = auth_escola_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ausencias_professores' AND policyname='diretora gerencia ausencias') THEN
    CREATE POLICY "diretora gerencia ausencias" ON ausencias_professores FOR ALL USING (escola_id = auth_escola_id() AND auth_role() IN ('diretora','super_admin'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_planejamentos_escola_semana ON planejamentos_semanais(escola_id, semana_inicio DESC);
CREATE INDEX IF NOT EXISTS idx_planejamentos_turma        ON planejamentos_semanais(turma_id, semana_inicio DESC);
CREATE INDEX IF NOT EXISTS idx_avisos_internos_escola     ON avisos_internos(escola_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_avisos_lidos_usuario       ON avisos_lidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ausencias_escola           ON ausencias_professores(escola_id, data DESC);
