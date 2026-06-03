-- Execute no Supabase SQL Editor
-- Mensalidades, Configurações da Escola, Cardápio Semanal

-- ──────────────────────────────────────────
-- 1. MENSALIDADES
-- ──────────────────────────────────────────
create table if not exists mensalidades (
  id               uuid default gen_random_uuid() primary key,
  escola_id        uuid references escolas(id) on delete cascade not null,
  aluno_id         uuid references alunos(id) on delete cascade not null,
  mes_referencia   text not null,           -- formato: YYYY-MM
  valor            numeric(10,2) not null,
  status           text not null default 'pendente', -- pendente | pago | vencido | isento
  dt_vencimento    date,
  dt_pagamento     date,
  forma_pagamento  text,                    -- pix | dinheiro | transferencia | boleto | cartao
  observacoes      text,
  criado_por       uuid references auth.users(id),
  criado_em        timestamptz default now()
);

create unique index if not exists mensalidades_aluno_mes
  on mensalidades(aluno_id, mes_referencia);

create index if not exists mensalidades_escola_mes
  on mensalidades(escola_id, mes_referencia desc);

alter table mensalidades enable row level security;

create policy "mensalidades_escola" on mensalidades
  for all using (
    escola_id = (select escola_id from usuarios where id = auth.uid())
  );

-- ──────────────────────────────────────────
-- 2. CONFIGURAÇÕES DA ESCOLA
-- ──────────────────────────────────────────
create table if not exists configuracoes_escola (
  id                uuid default gen_random_uuid() primary key,
  escola_id         uuid references escolas(id) on delete cascade not null unique,
  -- identidade
  nome_fantasia     text,
  razao_social      text,
  cnpj              text,
  logo_url          text,
  cor_primaria      text default '#2563EB',
  -- contato
  telefone          text,
  whatsapp          text,
  email_contato     text,
  site              text,
  -- endereço
  cep               text,
  rua               text,
  numero            text,
  complemento       text,
  bairro            text,
  cidade            text,
  estado            text,
  -- operação
  horario_entrada   text default '07:00',
  horario_saida     text default '17:00',
  valor_mensalidade numeric(10,2) default 0,
  dia_vencimento    int default 10,         -- dia do mês para vencimento
  -- diretor responsável
  diretor_nome      text,
  diretor_cpf       text,
  -- atualização
  atualizado_em     timestamptz default now()
);

alter table configuracoes_escola enable row level security;

create policy "config_escola_leitura" on configuracoes_escola
  for select using (
    escola_id = (select escola_id from usuarios where id = auth.uid())
  );

create policy "config_escola_escrita" on configuracoes_escola
  for all using (
    escola_id = (select escola_id from usuarios where id = auth.uid())
  );

-- ──────────────────────────────────────────
-- 3. CARDÁPIO SEMANAL
-- ──────────────────────────────────────────
create table if not exists cardapio (
  id             uuid default gen_random_uuid() primary key,
  escola_id      uuid references escolas(id) on delete cascade not null,
  semana_inicio  date not null,             -- sempre segunda-feira da semana
  dia_semana     int not null,              -- 1=seg, 2=ter, 3=qua, 4=qui, 5=sex
  refeicao       text not null,             -- cafe_manha | almoco | lanche_tarde
  descricao      text not null,
  criado_em      timestamptz default now()
);

create unique index if not exists cardapio_unique
  on cardapio(escola_id, semana_inicio, dia_semana, refeicao);

alter table cardapio enable row level security;

create policy "cardapio_escola" on cardapio
  for all using (
    escola_id = (select escola_id from usuarios where id = auth.uid())
  );
