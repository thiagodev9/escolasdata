-- ============================================================
-- EduCare — TODAS as migrations (002 + 003 + 004)
-- Cole este arquivo inteiro no Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 002 — Sprint 1: Presença, Comunicados, Push
-- ============================================================

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

ALTER TABLE presencas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunicados        ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='presencas' AND policyname='escola ve presencas') THEN
    CREATE POLICY "escola ve presencas" ON presencas FOR SELECT USING (escola_id = auth_escola_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='presencas' AND policyname='staff registra presencas') THEN
    CREATE POLICY "staff registra presencas" ON presencas FOR INSERT WITH CHECK (escola_id = auth_escola_id() AND auth_role() IN ('professora','diretora'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='presencas' AND policyname='diretora gerencia presencas') THEN
    CREATE POLICY "diretora gerencia presencas" ON presencas FOR ALL USING (escola_id = auth_escola_id() AND auth_role() IN ('diretora','super_admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='comunicados' AND policyname='escola ve comunicados') THEN
    CREATE POLICY "escola ve comunicados" ON comunicados FOR SELECT USING (escola_id = auth_escola_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='comunicados' AND policyname='diretora cria comunicado') THEN
    CREATE POLICY "diretora cria comunicado" ON comunicados FOR ALL USING (escola_id = auth_escola_id() AND auth_role() IN ('diretora','super_admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='push_subscriptions' AND policyname='usuario ve propria sub') THEN
    CREATE POLICY "usuario ve propria sub" ON push_subscriptions FOR SELECT USING (usuario_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='push_subscriptions' AND policyname='usuario gerencia sub') THEN
    CREATE POLICY "usuario gerencia sub" ON push_subscriptions FOR ALL USING (usuario_id = auth.uid());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_presencas_escola_data ON presencas(escola_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_presencas_aluno       ON presencas(aluno_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_comunicados_escola    ON comunicados(escola_id, criado_em DESC);

-- ============================================================
-- 003 — Sprint 2: Matrícula, Colunas Escola, Onboarding
-- ============================================================

ALTER TABLE escolas ADD COLUMN IF NOT EXISTS cnpj                 text;
ALTER TABLE escolas ADD COLUMN IF NOT EXISTS endereco             text;
ALTER TABLE escolas ADD COLUMN IF NOT EXISTS telefone             text;
ALTER TABLE escolas ADD COLUMN IF NOT EXISTS logo_url             text;
ALTER TABLE escolas ADD COLUMN IF NOT EXISTS onboarding_completo  boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS matriculas (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id         uuid REFERENCES escolas(id) ON DELETE CASCADE,
  aluno_nome        text NOT NULL,
  aluno_nascimento  date NOT NULL,
  turma_interesse   text,
  resp_nome         text NOT NULL,
  resp_email        text,
  resp_telefone     text NOT NULL,
  resp_parentesco   text DEFAULT 'pai/mãe',
  status            text DEFAULT 'aguardando'
    CHECK (status IN ('aguardando', 'aprovada', 'rejeitada')),
  observacoes       text,
  criado_em         timestamptz DEFAULT now()
);

ALTER TABLE matriculas ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='matriculas' AND policyname='insert_matricula_publica') THEN
    CREATE POLICY "insert_matricula_publica" ON matriculas FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='matriculas' AND policyname='escola_ve_matriculas') THEN
    CREATE POLICY "escola_ve_matriculas" ON matriculas FOR SELECT USING (escola_id = auth_escola_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='matriculas' AND policyname='diretora_gerencia_matriculas') THEN
    CREATE POLICY "diretora_gerencia_matriculas" ON matriculas FOR ALL USING (escola_id = auth_escola_id() AND auth_role() IN ('diretora', 'super_admin'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_matriculas_escola ON matriculas(escola_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_matriculas_status ON matriculas(escola_id, status);

-- ============================================================
-- 004 — Sprint 3: NFS-e, LGPD, Audit Log
-- ============================================================

CREATE TABLE IF NOT EXISTS nfse_config (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id           uuid UNIQUE REFERENCES escolas(id) ON DELETE CASCADE,
  prestador_cnpj      text,
  prestador_im        text,
  regime_tributario   text DEFAULT 'simples' CHECK (regime_tributario IN ('simples','lucro_presumido','lucro_real')),
  iss_aliquota        numeric(5,2) DEFAULT 5.00,
  codigo_servico      text DEFAULT '8.01',
  municipio_ibge      text,
  municipio_nome      text,
  ambiente            text DEFAULT 'homologacao' CHECK (ambiente IN ('homologacao','producao')),
  nfeio_api_key       text,
  criado_em           timestamptz DEFAULT now(),
  atualizado_em       timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nfse_emitidas (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id       uuid REFERENCES escolas(id) ON DELETE CASCADE,
  aluno_id        uuid REFERENCES alunos(id),
  responsavel_id  uuid REFERENCES responsaveis(id),
  valor           numeric(10,2) NOT NULL,
  competencia     date NOT NULL,
  descricao       text,
  status          text DEFAULT 'pendente'
    CHECK (status IN ('pendente','emitida','cancelada','erro')),
  nfse_numero     text,
  nfse_codigo_verificacao text,
  xml_url         text,
  pdf_url         text,
  erro_msg        text,
  criado_por      uuid REFERENCES usuarios(id),
  criado_em       timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lgpd_consents (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id       uuid REFERENCES escolas(id) ON DELETE CASCADE,
  responsavel_id  uuid REFERENCES responsaveis(id) ON DELETE CASCADE,
  tipo            text NOT NULL
    CHECK (tipo IN ('dados_pessoais','comunicacao','foto_crianca','compartilhamento_dados')),
  aceito          boolean NOT NULL DEFAULT false,
  ip              text,
  criado_em       timestamptz DEFAULT now(),
  atualizado_em   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lgpd_requests (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id           uuid REFERENCES escolas(id) ON DELETE CASCADE,
  responsavel_email   text NOT NULL,
  responsavel_nome    text,
  tipo                text NOT NULL
    CHECK (tipo IN ('exportacao','exclusao','correcao','portabilidade')),
  status              text DEFAULT 'pendente'
    CHECK (status IN ('pendente','processando','concluido','rejeitado')),
  observacoes         text,
  resposta            text,
  processado_por      uuid REFERENCES usuarios(id),
  criado_em           timestamptz DEFAULT now(),
  processado_em       timestamptz
);

CREATE TABLE IF NOT EXISTS audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id   uuid REFERENCES escolas(id) ON DELETE CASCADE,
  usuario_id  uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  acao        text NOT NULL,
  tabela      text,
  registro_id text,
  detalhes    jsonb DEFAULT '{}',
  ip          text,
  criado_em   timestamptz DEFAULT now()
);

ALTER TABLE nfse_config   ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfse_emitidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_consents  ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log      ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='nfse_config' AND policyname='escola_gerencia_nfse_config') THEN
    CREATE POLICY "escola_gerencia_nfse_config" ON nfse_config FOR ALL USING (escola_id = auth_escola_id() AND auth_role() IN ('diretora','super_admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='nfse_emitidas' AND policyname='escola_ve_nfse_emitidas') THEN
    CREATE POLICY "escola_ve_nfse_emitidas" ON nfse_emitidas FOR SELECT USING (escola_id = auth_escola_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='nfse_emitidas' AND policyname='diretora_gerencia_nfse') THEN
    CREATE POLICY "diretora_gerencia_nfse" ON nfse_emitidas FOR ALL USING (escola_id = auth_escola_id() AND auth_role() IN ('diretora','super_admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='lgpd_consents' AND policyname='escola_ve_consents') THEN
    CREATE POLICY "escola_ve_consents" ON lgpd_consents FOR SELECT USING (escola_id = auth_escola_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='lgpd_consents' AND policyname='diretora_gerencia_consents') THEN
    CREATE POLICY "diretora_gerencia_consents" ON lgpd_consents FOR ALL USING (escola_id = auth_escola_id() AND auth_role() IN ('diretora','super_admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='lgpd_requests' AND policyname='insert_lgpd_request') THEN
    CREATE POLICY "insert_lgpd_request" ON lgpd_requests FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='lgpd_requests' AND policyname='escola_ve_requests') THEN
    CREATE POLICY "escola_ve_requests" ON lgpd_requests FOR SELECT USING (escola_id = auth_escola_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='lgpd_requests' AND policyname='diretora_gerencia_requests') THEN
    CREATE POLICY "diretora_gerencia_requests" ON lgpd_requests FOR ALL USING (escola_id = auth_escola_id() AND auth_role() IN ('diretora','super_admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='audit_log' AND policyname='escola_ve_audit') THEN
    CREATE POLICY "escola_ve_audit" ON audit_log FOR SELECT USING (escola_id = auth_escola_id() AND auth_role() IN ('diretora','super_admin'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_nfse_escola_competencia ON nfse_emitidas(escola_id, competencia DESC);
CREATE INDEX IF NOT EXISTS idx_audit_escola            ON audit_log(escola_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_lgpd_req_escola         ON lgpd_requests(escola_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_lgpd_con_resp           ON lgpd_consents(responsavel_id, escola_id);

-- Fix SECURITY DEFINER nas funções (necessário para evitar recursão RLS)
CREATE OR REPLACE FUNCTION auth_escola_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT escola_id FROM usuarios WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION auth_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM usuarios WHERE id = auth.uid()
$$;
