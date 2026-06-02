-- ============================================================
-- EduCare — Sprint 3: NFS-e, LGPD, Multi-unidade
-- Execute no Supabase SQL Editor
-- ============================================================

-- ============================================================
-- NFS-e — Configuração e emissão
-- ============================================================

CREATE TABLE IF NOT EXISTS nfse_config (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id           uuid UNIQUE REFERENCES escolas(id) ON DELETE CASCADE,
  prestador_cnpj      text,
  prestador_im        text,           -- Inscrição Municipal
  regime_tributario   text DEFAULT 'simples' CHECK (regime_tributario IN ('simples','lucro_presumido','lucro_real')),
  iss_aliquota        numeric(5,2) DEFAULT 5.00,
  codigo_servico      text DEFAULT '8.01',
  municipio_ibge      text,
  municipio_nome      text,
  ambiente            text DEFAULT 'homologacao' CHECK (ambiente IN ('homologacao','producao')),
  nfeio_api_key       text,           -- NFe.io API key (encrypted idealmente)
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

ALTER TABLE nfse_config   ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfse_emitidas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "escola_gerencia_nfse_config" ON nfse_config
  FOR ALL USING (escola_id = auth_escola_id() AND auth_role() IN ('diretora','super_admin'));

CREATE POLICY "escola_ve_nfse_emitidas" ON nfse_emitidas
  FOR SELECT USING (escola_id = auth_escola_id());

CREATE POLICY "diretora_gerencia_nfse" ON nfse_emitidas
  FOR ALL USING (escola_id = auth_escola_id() AND auth_role() IN ('diretora','super_admin'));

CREATE INDEX IF NOT EXISTS idx_nfse_escola_competencia ON nfse_emitidas(escola_id, competencia DESC);

-- ============================================================
-- LGPD — Consentimentos, Solicitações, Audit Log
-- ============================================================

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

ALTER TABLE lgpd_consents  ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "escola_ve_consents" ON lgpd_consents
  FOR SELECT USING (escola_id = auth_escola_id());

CREATE POLICY "diretora_gerencia_consents" ON lgpd_consents
  FOR ALL USING (escola_id = auth_escola_id() AND auth_role() IN ('diretora','super_admin'));

-- Qualquer pessoa pode criar uma solicitação LGPD (sem autenticação)
CREATE POLICY "insert_lgpd_request" ON lgpd_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "escola_ve_requests" ON lgpd_requests
  FOR SELECT USING (escola_id = auth_escola_id());

CREATE POLICY "diretora_gerencia_requests" ON lgpd_requests
  FOR ALL USING (escola_id = auth_escola_id() AND auth_role() IN ('diretora','super_admin'));

CREATE POLICY "escola_ve_audit" ON audit_log
  FOR SELECT USING (escola_id = auth_escola_id() AND auth_role() IN ('diretora','super_admin'));

CREATE INDEX IF NOT EXISTS idx_audit_escola     ON audit_log(escola_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_lgpd_req_escola  ON lgpd_requests(escola_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_lgpd_con_resp    ON lgpd_consents(responsavel_id, escola_id);
