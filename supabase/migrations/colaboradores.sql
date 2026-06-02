-- Execute no Supabase SQL Editor

create table if not exists colaboradores (
  id             uuid default gen_random_uuid() primary key,
  escola_id      uuid references escolas(id) on delete cascade not null,
  nome           text not null,
  email          text,
  telefone       text,
  cpf            text,
  cargo          text not null default 'professora',
  -- endereço
  cep            text,
  rua            text,
  numero         text,
  complemento    text,
  bairro         text,
  cidade         text,
  estado         text,
  -- contrato
  dt_admissao    date,
  dt_venc_ferias date,
  salario        numeric(10,2),
  observacoes    text,
  ativo          boolean default true,
  criado_em      timestamptz default now()
);

alter table colaboradores enable row level security;

create policy "colaboradores_escola" on colaboradores
  for all using (
    escola_id = (select escola_id from usuarios where id = auth.uid())
  );
