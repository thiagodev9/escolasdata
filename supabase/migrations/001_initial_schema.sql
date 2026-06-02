-- ============================================================
-- EduCare — Schema inicial
-- Execute no Supabase SQL Editor ou via supabase db push
-- ============================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELAS PRINCIPAIS
-- ============================================================

CREATE TABLE escolas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        text NOT NULL,
  slug        text UNIQUE NOT NULL,
  plano       text DEFAULT 'basico' CHECK (plano IN ('basico', 'profissional', 'enterprise')),
  ativo       boolean DEFAULT true,
  config      jsonb DEFAULT '{}',
  criado_em   timestamptz DEFAULT now()
);

CREATE TABLE usuarios (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id   uuid REFERENCES escolas(id) ON DELETE CASCADE,
  nome        text NOT NULL,
  email       text UNIQUE NOT NULL,
  role        text CHECK (role IN ('super_admin','diretora','professora','responsavel')),
  ativo       boolean DEFAULT true,
  criado_em   timestamptz DEFAULT now()
);

CREATE TABLE turmas (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id     uuid REFERENCES escolas(id) ON DELETE CASCADE,
  nome          text NOT NULL,
  capacidade    int NOT NULL DEFAULT 20,
  ano_letivo    int NOT NULL DEFAULT EXTRACT(YEAR FROM now())::int,
  professor_id  uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em     timestamptz DEFAULT now()
);

CREATE TABLE alunos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id       uuid REFERENCES escolas(id) ON DELETE CASCADE,
  nome            text NOT NULL,
  dt_nascimento   date NOT NULL,
  foto_url        text,
  status          text DEFAULT 'ativo' CHECK (status IN ('ativo','inativo','pendente')),
  criado_em       timestamptz DEFAULT now()
);

CREATE TABLE responsaveis (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id   uuid REFERENCES escolas(id) ON DELETE CASCADE,
  nome        text NOT NULL,
  email       text,
  telefone    text,
  criado_em   timestamptz DEFAULT now()
);

-- Relações N:N
CREATE TABLE alunos_turmas (
  aluno_id  uuid REFERENCES alunos(id) ON DELETE CASCADE,
  turma_id  uuid REFERENCES turmas(id) ON DELETE CASCADE,
  ativo     boolean DEFAULT true,
  PRIMARY KEY (aluno_id, turma_id)
);

CREATE TABLE alunos_responsaveis (
  aluno_id        uuid REFERENCES alunos(id) ON DELETE CASCADE,
  responsavel_id  uuid REFERENCES responsaveis(id) ON DELETE CASCADE,
  parentesco      text DEFAULT 'responsavel',
  PRIMARY KEY (aluno_id, responsavel_id)
);

-- Diário do aluno (refeições, sono, fraldas, atividades)
CREATE TABLE registros_diarios (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id   uuid REFERENCES escolas(id) ON DELETE CASCADE,
  aluno_id    uuid REFERENCES alunos(id) ON DELETE CASCADE,
  tipo        text NOT NULL CHECK (tipo IN ('refeicao','sono','fralda','atividade','recado')),
  titulo      text NOT NULL,
  descricao   text,
  hora        time,
  data        date NOT NULL DEFAULT CURRENT_DATE,
  criado_por  uuid REFERENCES usuarios(id),
  criado_em   timestamptz DEFAULT now()
);

-- Feed da turma (posts com foto/texto)
CREATE TABLE feed_posts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id   uuid REFERENCES escolas(id) ON DELETE CASCADE,
  turma_id    uuid REFERENCES turmas(id) ON DELETE CASCADE,
  autor_id    uuid REFERENCES usuarios(id),
  categoria   text DEFAULT 'geral' CHECK (categoria IN ('artes','lazer','refeicao','pedagogico','geral')),
  conteudo    text NOT NULL,
  foto_url    text,
  curtidas    int DEFAULT 0,
  criado_em   timestamptz DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE escolas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios             ENABLE ROW LEVEL SECURITY;
ALTER TABLE turmas               ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos               ENABLE ROW LEVEL SECURITY;
ALTER TABLE responsaveis         ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos_turmas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos_responsaveis  ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_diarios    ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_posts           ENABLE ROW LEVEL SECURITY;

-- Helper: retorna escola_id do usuário logado
CREATE OR REPLACE FUNCTION auth_escola_id()
RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT escola_id FROM usuarios WHERE id = auth.uid()
$$;

-- Helper: retorna role do usuário logado
CREATE OR REPLACE FUNCTION auth_role()
RETURNS text LANGUAGE sql STABLE AS $$
  SELECT role FROM usuarios WHERE id = auth.uid()
$$;

-- ---- escolas ----
CREATE POLICY "super_admin vê tudo" ON escolas
  FOR ALL USING (auth_role() = 'super_admin');

CREATE POLICY "usuario vê própria escola" ON escolas
  FOR SELECT USING (id = auth_escola_id());

-- ---- usuarios ----
CREATE POLICY "super_admin vê tudo" ON usuarios
  FOR ALL USING (auth_role() = 'super_admin');

CREATE POLICY "usuario vê própria escola" ON usuarios
  FOR SELECT USING (escola_id = auth_escola_id());

CREATE POLICY "diretora gerencia usuarios" ON usuarios
  FOR ALL USING (escola_id = auth_escola_id() AND auth_role() = 'diretora');

-- ---- turmas ----
CREATE POLICY "super_admin vê tudo" ON turmas
  FOR ALL USING (auth_role() = 'super_admin');

CREATE POLICY "escola vê próprias turmas" ON turmas
  FOR SELECT USING (escola_id = auth_escola_id());

CREATE POLICY "professora vê suas turmas" ON turmas
  FOR SELECT USING (
    escola_id = auth_escola_id()
    AND (professor_id = auth.uid() OR auth_role() IN ('diretora','super_admin'))
  );

CREATE POLICY "diretora gerencia turmas" ON turmas
  FOR ALL USING (escola_id = auth_escola_id() AND auth_role() = 'diretora');

-- ---- alunos ----
CREATE POLICY "super_admin vê tudo" ON alunos
  FOR ALL USING (auth_role() = 'super_admin');

CREATE POLICY "escola vê próprios alunos" ON alunos
  FOR SELECT USING (escola_id = auth_escola_id());

CREATE POLICY "diretora gerencia alunos" ON alunos
  FOR ALL USING (escola_id = auth_escola_id() AND auth_role() = 'diretora');

CREATE POLICY "professora vê alunos da turma" ON alunos
  FOR SELECT USING (
    escola_id = auth_escola_id()
    AND auth_role() = 'professora'
    AND id IN (
      SELECT at.aluno_id FROM alunos_turmas at
      JOIN turmas t ON t.id = at.turma_id
      WHERE t.professor_id = auth.uid() AND at.ativo = true
    )
  );

CREATE POLICY "responsavel vê filhos" ON alunos
  FOR SELECT USING (
    escola_id = auth_escola_id()
    AND auth_role() = 'responsavel'
    AND id IN (
      SELECT ar.aluno_id FROM alunos_responsaveis ar
      JOIN responsaveis r ON r.id = ar.responsavel_id
      WHERE r.email = (SELECT email FROM usuarios WHERE id = auth.uid())
    )
  );

-- ---- responsaveis ----
CREATE POLICY "escola vê responsaveis" ON responsaveis
  FOR SELECT USING (escola_id = auth_escola_id());

CREATE POLICY "diretora gerencia responsaveis" ON responsaveis
  FOR ALL USING (escola_id = auth_escola_id() AND auth_role() = 'diretora');

-- ---- registros_diarios ----
CREATE POLICY "escola vê registros" ON registros_diarios
  FOR SELECT USING (escola_id = auth_escola_id());

CREATE POLICY "professora cria registros" ON registros_diarios
  FOR INSERT WITH CHECK (escola_id = auth_escola_id() AND auth_role() IN ('professora','diretora'));

CREATE POLICY "responsavel vê registros dos filhos" ON registros_diarios
  FOR SELECT USING (
    escola_id = auth_escola_id()
    AND auth_role() = 'responsavel'
    AND aluno_id IN (
      SELECT ar.aluno_id FROM alunos_responsaveis ar
      JOIN responsaveis r ON r.id = ar.responsavel_id
      WHERE r.email = (SELECT email FROM usuarios WHERE id = auth.uid())
    )
  );

-- ---- feed_posts ----
CREATE POLICY "escola vê feed" ON feed_posts
  FOR SELECT USING (escola_id = auth_escola_id());

CREATE POLICY "professora cria posts" ON feed_posts
  FOR INSERT WITH CHECK (escola_id = auth_escola_id() AND auth_role() IN ('professora','diretora'));

CREATE POLICY "diretora gerencia feed" ON feed_posts
  FOR ALL USING (escola_id = auth_escola_id() AND auth_role() = 'diretora');

-- ============================================================
-- ÍNDICES DE PERFORMANCE
-- ============================================================

CREATE INDEX idx_usuarios_escola_id     ON usuarios(escola_id);
CREATE INDEX idx_alunos_escola_id       ON alunos(escola_id);
CREATE INDEX idx_turmas_escola_id       ON turmas(escola_id);
CREATE INDEX idx_turmas_professor       ON turmas(professor_id);
CREATE INDEX idx_registros_aluno_data   ON registros_diarios(aluno_id, data DESC);
CREATE INDEX idx_feed_turma             ON feed_posts(turma_id, criado_em DESC);

-- ============================================================
-- DADOS SEED (escola demo)
-- ============================================================

INSERT INTO escolas (id, nome, slug, plano) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Starlight Academy', 'starlight-academy', 'profissional');

-- Nota: usuários devem ser criados via Supabase Auth,
-- depois inseridos em public.usuarios com o mesmo UUID do auth.users.
