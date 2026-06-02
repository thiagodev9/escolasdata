-- ============================================================
-- Sprint 1 — Presença, Comunicados, Diário em massa
-- Execute no Supabase SQL Editor
-- ============================================================

-- Tabela de presenças diárias
CREATE TABLE IF NOT EXISTS presencas (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id     uuid REFERENCES escolas(id) ON DELETE CASCADE,
  aluno_id      uuid REFERENCES alunos(id) ON DELETE CASCADE,
  data          date NOT NULL DEFAULT CURRENT_DATE,
  hora_entrada  time,
  hora_saida    time,
  status        text DEFAULT 'presente' CHECK (status IN ('presente','ausente','justificado')),
  observacao    text,
  registrado_por uuid REFERENCES usuarios(id),
  criado_em     timestamptz DEFAULT now(),
  UNIQUE(aluno_id, data)
);

-- Tabela de comunicados (histórico)
CREATE TABLE IF NOT EXISTS comunicados (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id   uuid REFERENCES escolas(id) ON DELETE CASCADE,
  titulo      text NOT NULL,
  mensagem    text NOT NULL,
  turma_id    uuid REFERENCES turmas(id) ON DELETE SET NULL,
  canal       text DEFAULT 'whatsapp' CHECK (canal IN ('whatsapp','push','email','todos')),
  enviado_por uuid REFERENCES usuarios(id),
  enviados    int DEFAULT 0,
  falhas      int DEFAULT 0,
  criado_em   timestamptz DEFAULT now()
);

-- Tabela de push subscriptions (PWA)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id   uuid REFERENCES escolas(id) ON DELETE CASCADE,
  usuario_id  uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  endpoint    text NOT NULL,
  p256dh      text NOT NULL,
  auth        text NOT NULL,
  criado_em   timestamptz DEFAULT now(),
  UNIQUE(usuario_id, endpoint)
);

-- RLS
ALTER TABLE presencas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunicados        ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies presencas
DROP POLICY IF EXISTS "escola ve presencas"      ON presencas;
DROP POLICY IF EXISTS "staff registra presencas" ON presencas;
DROP POLICY IF EXISTS "diretora gerencia presencas" ON presencas;
CREATE POLICY "escola ve presencas"         ON presencas FOR SELECT USING (escola_id = auth_escola_id());
CREATE POLICY "staff registra presencas"    ON presencas FOR INSERT WITH CHECK (escola_id = auth_escola_id() AND auth_role() IN ('professora','diretora'));
CREATE POLICY "diretora gerencia presencas" ON presencas FOR ALL    USING  (escola_id = auth_escola_id() AND auth_role() IN ('diretora','super_admin'));

-- Policies comunicados
DROP POLICY IF EXISTS "escola ve comunicados"   ON comunicados;
DROP POLICY IF EXISTS "diretora cria comunicado" ON comunicados;
CREATE POLICY "escola ve comunicados"    ON comunicados FOR SELECT USING (escola_id = auth_escola_id());
CREATE POLICY "diretora cria comunicado" ON comunicados FOR ALL    USING (escola_id = auth_escola_id() AND auth_role() IN ('diretora','super_admin'));

-- Policies push_subscriptions
DROP POLICY IF EXISTS "usuario ve propria sub" ON push_subscriptions;
DROP POLICY IF EXISTS "usuario gerencia sub"   ON push_subscriptions;
CREATE POLICY "usuario ve propria sub" ON push_subscriptions FOR SELECT USING (usuario_id = auth.uid());
CREATE POLICY "usuario gerencia sub"   ON push_subscriptions FOR ALL    USING (usuario_id = auth.uid());

-- Índices
CREATE INDEX IF NOT EXISTS idx_presencas_escola_data ON presencas(escola_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_presencas_aluno       ON presencas(aluno_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_comunicados_escola    ON comunicados(escola_id, criado_em DESC);
