-- Execute no Supabase SQL Editor

create table if not exists gastos (
  id              uuid default gen_random_uuid() primary key,
  escola_id       uuid references escolas(id) on delete cascade not null,
  descricao       text not null,
  categoria       text not null,
  valor           numeric(10,2) not null,
  dt_pagamento    date not null,
  forma_pagamento text,
  fornecedor      text,
  observacoes     text,
  criado_por      uuid references usuarios(id),
  criado_em       timestamptz default now()
);

alter table gastos enable row level security;

create policy "gastos_escola" on gastos
  for all using (
    escola_id = (select escola_id from usuarios where id = auth.uid())
  );

-- índice para filtros por mês
create index gastos_escola_dt on gastos (escola_id, dt_pagamento desc);
