// EduCare — Script de setup automático do Supabase
// Roda com: node setup.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const PROJECT_REF  = 'cgreissqlrreczxeswol'
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmVpc3NxbHJyZWN6eGVzd29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk3MDYyOCwiZXhwIjoyMDk1NTQ2NjI4fQ.n3J8gs7JN6rfD6KDQGvvNP_Ns5lT2vxgqxzRMCJtDus'

const ESCOLA_ID = '00000000-0000-0000-0000-000000000001'
const ADMIN_EMAIL = 'admin@starlight.com'
const ADMIN_SENHA = 'Educare@2024'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// ─── SQL da migration completa ─────────────────────────────────────────────
const MIGRATION_SQL = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS escolas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        text NOT NULL,
  slug        text UNIQUE NOT NULL,
  plano       text DEFAULT 'basico' CHECK (plano IN ('basico', 'profissional', 'enterprise')),
  ativo       boolean DEFAULT true,
  config      jsonb DEFAULT '{}',
  criado_em   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usuarios (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id   uuid REFERENCES escolas(id) ON DELETE CASCADE,
  nome        text NOT NULL,
  email       text UNIQUE NOT NULL,
  role        text CHECK (role IN ('super_admin','diretora','professora','responsavel')),
  ativo       boolean DEFAULT true,
  criado_em   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS turmas (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id     uuid REFERENCES escolas(id) ON DELETE CASCADE,
  nome          text NOT NULL,
  capacidade    int NOT NULL DEFAULT 20,
  ano_letivo    int NOT NULL DEFAULT EXTRACT(YEAR FROM now())::int,
  professor_id  uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em     timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alunos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id       uuid REFERENCES escolas(id) ON DELETE CASCADE,
  nome            text NOT NULL,
  dt_nascimento   date NOT NULL,
  foto_url        text,
  status          text DEFAULT 'ativo' CHECK (status IN ('ativo','inativo','pendente')),
  criado_em       timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS responsaveis (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id   uuid REFERENCES escolas(id) ON DELETE CASCADE,
  nome        text NOT NULL,
  email       text,
  telefone    text,
  criado_em   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alunos_turmas (
  aluno_id  uuid REFERENCES alunos(id) ON DELETE CASCADE,
  turma_id  uuid REFERENCES turmas(id) ON DELETE CASCADE,
  ativo     boolean DEFAULT true,
  PRIMARY KEY (aluno_id, turma_id)
);

CREATE TABLE IF NOT EXISTS alunos_responsaveis (
  aluno_id        uuid REFERENCES alunos(id) ON DELETE CASCADE,
  responsavel_id  uuid REFERENCES responsaveis(id) ON DELETE CASCADE,
  parentesco      text DEFAULT 'responsavel',
  PRIMARY KEY (aluno_id, responsavel_id)
);

CREATE TABLE IF NOT EXISTS registros_diarios (
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

CREATE TABLE IF NOT EXISTS feed_posts (
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

-- RLS
ALTER TABLE escolas             ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios            ENABLE ROW LEVEL SECURITY;
ALTER TABLE turmas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE responsaveis        ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos_turmas       ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos_responsaveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_diarios   ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_posts          ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION auth_escola_id() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT escola_id FROM usuarios WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION auth_role() RETURNS text LANGUAGE sql STABLE AS $$
  SELECT role FROM usuarios WHERE id = auth.uid()
$$;

-- Policies escolas
DROP POLICY IF EXISTS "super_admin tudo escolas" ON escolas;
CREATE POLICY "super_admin tudo escolas" ON escolas FOR ALL USING (auth_role() = 'super_admin');
DROP POLICY IF EXISTS "usuario propria escola" ON escolas;
CREATE POLICY "usuario propria escola" ON escolas FOR SELECT USING (id = auth_escola_id());

-- Policies usuarios
DROP POLICY IF EXISTS "super_admin tudo usuarios" ON usuarios;
CREATE POLICY "super_admin tudo usuarios" ON usuarios FOR ALL USING (auth_role() = 'super_admin');
DROP POLICY IF EXISTS "escola ve usuarios" ON usuarios;
CREATE POLICY "escola ve usuarios" ON usuarios FOR SELECT USING (escola_id = auth_escola_id());
DROP POLICY IF EXISTS "diretora gerencia usuarios" ON usuarios;
CREATE POLICY "diretora gerencia usuarios" ON usuarios FOR ALL USING (escola_id = auth_escola_id() AND auth_role() = 'diretora');

-- Policies turmas
DROP POLICY IF EXISTS "super_admin tudo turmas" ON turmas;
CREATE POLICY "super_admin tudo turmas" ON turmas FOR ALL USING (auth_role() = 'super_admin');
DROP POLICY IF EXISTS "escola ve turmas" ON turmas;
CREATE POLICY "escola ve turmas" ON turmas FOR SELECT USING (escola_id = auth_escola_id());
DROP POLICY IF EXISTS "diretora gerencia turmas" ON turmas;
CREATE POLICY "diretora gerencia turmas" ON turmas FOR ALL USING (escola_id = auth_escola_id() AND auth_role() = 'diretora');

-- Policies alunos
DROP POLICY IF EXISTS "super_admin tudo alunos" ON alunos;
CREATE POLICY "super_admin tudo alunos" ON alunos FOR ALL USING (auth_role() = 'super_admin');
DROP POLICY IF EXISTS "escola ve alunos" ON alunos;
CREATE POLICY "escola ve alunos" ON alunos FOR SELECT USING (escola_id = auth_escola_id());
DROP POLICY IF EXISTS "diretora gerencia alunos" ON alunos;
CREATE POLICY "diretora gerencia alunos" ON alunos FOR ALL USING (escola_id = auth_escola_id() AND auth_role() = 'diretora');
DROP POLICY IF EXISTS "professora ve alunos turma" ON alunos;
CREATE POLICY "professora ve alunos turma" ON alunos FOR SELECT USING (
  escola_id = auth_escola_id() AND auth_role() = 'professora'
  AND id IN (SELECT at2.aluno_id FROM alunos_turmas at2 JOIN turmas t ON t.id = at2.turma_id WHERE t.professor_id = auth.uid() AND at2.ativo = true)
);
DROP POLICY IF EXISTS "responsavel ve filhos" ON alunos;
CREATE POLICY "responsavel ve filhos" ON alunos FOR SELECT USING (
  escola_id = auth_escola_id() AND auth_role() = 'responsavel'
  AND id IN (SELECT ar.aluno_id FROM alunos_responsaveis ar JOIN responsaveis r ON r.id = ar.responsavel_id WHERE r.email = (SELECT email FROM usuarios WHERE id = auth.uid()))
);

-- Policies responsaveis
DROP POLICY IF EXISTS "escola ve responsaveis" ON responsaveis;
CREATE POLICY "escola ve responsaveis" ON responsaveis FOR SELECT USING (escola_id = auth_escola_id());
DROP POLICY IF EXISTS "diretora gerencia responsaveis" ON responsaveis;
CREATE POLICY "diretora gerencia responsaveis" ON responsaveis FOR ALL USING (escola_id = auth_escola_id() AND auth_role() = 'diretora');

-- Policies registros_diarios
DROP POLICY IF EXISTS "escola ve registros" ON registros_diarios;
CREATE POLICY "escola ve registros" ON registros_diarios FOR SELECT USING (escola_id = auth_escola_id());
DROP POLICY IF EXISTS "staff cria registros" ON registros_diarios;
CREATE POLICY "staff cria registros" ON registros_diarios FOR INSERT WITH CHECK (escola_id = auth_escola_id() AND auth_role() IN ('professora','diretora'));

-- Policies feed_posts
DROP POLICY IF EXISTS "escola ve feed" ON feed_posts;
CREATE POLICY "escola ve feed" ON feed_posts FOR SELECT USING (escola_id = auth_escola_id());
DROP POLICY IF EXISTS "staff cria posts" ON feed_posts;
CREATE POLICY "staff cria posts" ON feed_posts FOR INSERT WITH CHECK (escola_id = auth_escola_id() AND auth_role() IN ('professora','diretora'));
DROP POLICY IF EXISTS "diretora gerencia feed" ON feed_posts;
CREATE POLICY "diretora gerencia feed" ON feed_posts FOR ALL USING (escola_id = auth_escola_id() AND auth_role() = 'diretora');

-- Índices
CREATE INDEX IF NOT EXISTS idx_usuarios_escola_id   ON usuarios(escola_id);
CREATE INDEX IF NOT EXISTS idx_alunos_escola_id     ON alunos(escola_id);
CREATE INDEX IF NOT EXISTS idx_turmas_escola_id     ON turmas(escola_id);
CREATE INDEX IF NOT EXISTS idx_registros_aluno_data ON registros_diarios(aluno_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_feed_turma           ON feed_posts(turma_id, criado_em DESC);
`

// ─── Seed data ─────────────────────────────────────────────────────────────
const TURMAS_SEED = [
  { nome: 'Maternal I',   capacidade: 15 },
  { nome: 'Maternal II',  capacidade: 15 },
  { nome: 'Jardim I',     capacidade: 20 },
  { nome: 'Jardim II',    capacidade: 20 },
  { nome: 'Pré I',        capacidade: 22 },
  { nome: 'Pré II',       capacidade: 22 },
]

const ALUNOS_SEED = [
  { nome: 'Enzo Silva',    dt_nascimento: '2021-03-15', status: 'ativo'    },
  { nome: 'Ana Oliveira',  dt_nascimento: '2020-07-22', status: 'pendente' },
  { nome: 'Pedro Santos',  dt_nascimento: '2021-11-08', status: 'ativo'    },
  { nome: 'Letícia Souza', dt_nascimento: '2022-01-30', status: 'ativo'    },
  { nome: 'Lucas Pereira', dt_nascimento: '2020-05-12', status: 'ativo'    },
  { nome: 'Mariana Costa', dt_nascimento: '2021-09-03', status: 'ativo'    },
  { nome: 'Gabriel Lima',  dt_nascimento: '2022-04-18', status: 'inativo'  },
  { nome: 'Sofia Alves',   dt_nascimento: '2020-12-25', status: 'ativo'    },
]

// ─── Helpers ───────────────────────────────────────────────────────────────
function log(emoji, msg)  { console.log(`${emoji}  ${msg}`) }
function ok(msg)          { console.log(`  ✅ ${msg}`) }
function fail(msg, err)   { console.error(`  ❌ ${msg}:`, err?.message ?? err) }
function divider()        { console.log('\n' + '─'.repeat(50) + '\n') }

// ─── Rodar SQL via Management API ─────────────────────────────────────────
async function runSQL(sql) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    }
  )
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`${res.status} — ${body}`)
  }
  return res.json()
}

// ─── Verifica se as tabelas existem ───────────────────────────────────────
async function tabelasExistem() {
  const { error } = await supabase.from('escolas').select('id').limit(1)
  // error code 42P01 = tabela não existe
  return !error || error.code !== '42P01'
}

// ─── Main ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🎓  EduCare — Setup automático\n')

  // 1. Migration
  log('📊', 'Verificando schema do banco...')
  const jaTemTabelas = await tabelasExistem()

  if (jaTemTabelas) {
    ok('Tabelas já existem — pulando migration.')
  } else {
    log('📊', 'Tentando criar schema via API...')
    try {
      await runSQL(MIGRATION_SQL)
      ok('Schema criado com sucesso!')
    } catch (e) {
      console.log('\n  ┌─────────────────────────────────────────────────────────────┐')
      console.log('  │  AÇÃO NECESSÁRIA — 1 vez só, leva 30 segundos               │')
      console.log('  ├─────────────────────────────────────────────────────────────┤')
      console.log('  │  1. Abra: https://supabase.com/dashboard/project/cgreissqlrreczxeswol/sql/new')
      console.log('  │  2. Cole TODO o conteúdo do arquivo:                        │')
      console.log('  │     supabase/migrations/001_initial_schema.sql              │')
      console.log('  │  3. Clique em RUN                                           │')
      console.log('  │  4. Volte aqui e rode: node setup.mjs                       │')
      console.log('  └─────────────────────────────────────────────────────────────┘\n')
      process.exit(1)
    }
  }

  divider()

  // 2. Criar escola demo
  log('🏫', 'Criando escola "Starlight Academy"...')
  const { error: escolaErr } = await supabase
    .from('escolas')
    .upsert({ id: ESCOLA_ID, nome: 'Starlight Academy', slug: 'starlight-academy', plano: 'profissional' })
  if (escolaErr) { fail('Escola', escolaErr); process.exit(1) }
  ok('Escola criada!')

  // 3. Criar turmas seed
  log('📚', 'Criando turmas...')
  const turmasComEscola = TURMAS_SEED.map(t => ({ ...t, escola_id: ESCOLA_ID, ano_letivo: 2024 }))
  const { data: turmasCriadas, error: turmaErr } = await supabase
    .from('turmas')
    .insert(turmasComEscola)
    .select()
  if (turmaErr && turmaErr.code !== '23505') { fail('Turmas', turmaErr); process.exit(1) }
  if (turmaErr?.code === '23505') { ok('Turmas já existem — pulando.') }
  ok(`${TURMAS_SEED.length} turmas criadas!`)

  // 4. Criar usuário admin no Auth
  log('🔐', `Criando usuário admin (${ADMIN_EMAIL})...`)
  let adminId
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_SENHA,
    email_confirm: true,
  })

  if (authErr) {
    if (authErr.message.toLowerCase().includes('already been registered') ||
        authErr.message.toLowerCase().includes('already exists')) {
      ok('Usuário já existe — buscando id...')
      const { data: listData } = await supabase.auth.admin.listUsers()
      const existing = listData?.users?.find(u => u.email === ADMIN_EMAIL)
      adminId = existing?.id
      if (!adminId) { fail('Usuário não encontrado', authErr); process.exit(1) }
    } else {
      fail('Auth createUser', authErr); process.exit(1)
    }
  } else {
    adminId = authData.user.id
    ok('Usuário criado no Auth!')
  }

  // 5. Criar registro na tabela usuarios
  log('👩‍💼', 'Vinculando admin à escola como Diretora...')
  const { error: userErr } = await supabase
    .from('usuarios')
    .upsert({ id: adminId, escola_id: ESCOLA_ID, nome: 'Dra. Adriana Silva', email: ADMIN_EMAIL, role: 'diretora' })
  if (userErr) { fail('Usuarios', userErr); process.exit(1) }
  ok('Diretora vinculada!')

  // 6. Criar alunos seed
  log('👦', 'Criando alunos de exemplo...')
  const alunosComEscola = ALUNOS_SEED.map(a => ({ ...a, escola_id: ESCOLA_ID }))
  const { data: alunosCriados, error: alunosErr } = await supabase
    .from('alunos')
    .insert(alunosComEscola)
    .select()
  if (alunosErr) { fail('Alunos', alunosErr) }
  else { ok(`${ALUNOS_SEED.length} alunos criados!`) }

  // 7. Vincular alunos às turmas
  if (alunosCriados && turmasCriadas) {
    log('🔗', 'Vinculando alunos às turmas...')
    const turmaMap = Object.fromEntries(turmasCriadas.map(t => [t.nome, t.id]))
    const vinculos = [
      { aluno: 'Enzo Silva',    turma: 'Maternal I'  },
      { aluno: 'Ana Oliveira',  turma: 'Jardim II'   },
      { aluno: 'Pedro Santos',  turma: 'Maternal II' },
      { aluno: 'Letícia Souza', turma: 'Jardim I'    },
      { aluno: 'Lucas Pereira', turma: 'Jardim II'   },
      { aluno: 'Mariana Costa', turma: 'Maternal I'  },
      { aluno: 'Sofia Alves',   turma: 'Pré I'       },
    ]
    const alunoMap = Object.fromEntries(alunosCriados.map(a => [a.nome, a.id]))
    const alunoTurmaRows = vinculos
      .filter(v => alunoMap[v.aluno] && turmaMap[v.turma])
      .map(v => ({ aluno_id: alunoMap[v.aluno], turma_id: turmaMap[v.turma], ativo: true }))
    const { error: atErr } = await supabase.from('alunos_turmas').insert(alunoTurmaRows)
    if (atErr) { fail('Vínculos aluno-turma', atErr) }
    else { ok('Alunos vinculados às turmas!') }
  }

  divider()

  console.log('🎉  Setup concluído com sucesso!\n')
  console.log('  Acesse: http://localhost:3000')
  console.log('  Email : ' + ADMIN_EMAIL)
  console.log('  Senha : ' + ADMIN_SENHA)
  console.log('\n  Execute: npm run dev\n')
}

main().catch(err => {
  console.error('\n💥 Erro inesperado:', err.message)
  process.exit(1)
})
