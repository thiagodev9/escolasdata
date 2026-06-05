import {
  pgTable, uuid, text, boolean, integer, numeric, date, timestamp, time, jsonb,
} from 'drizzle-orm/pg-core'

export const escolas = pgTable('escolas', {
  id:                  uuid('id').primaryKey(),
  nome:                text('nome').notNull(),
  slug:                text('slug').notNull(),
  plano:               text('plano').default('basico'),
  ativo:               boolean('ativo').default(true),
  config:              jsonb('config'),
  cnpj:                text('cnpj'),
  endereco:            text('endereco'),
  telefone:            text('telefone'),
  logoUrl:             text('logo_url'),
  onboardingCompleto:  boolean('onboarding_completo').default(false),
  criadoEm:            timestamp('criado_em', { withTimezone: true }).defaultNow(),
})

export const usuarios = pgTable('usuarios', {
  id:        uuid('id').primaryKey(),
  escolaId:  uuid('escola_id'),
  nome:      text('nome').notNull(),
  email:     text('email').notNull(),
  role:      text('role'),
  ativo:     boolean('ativo').default(true),
  criadoEm:  timestamp('criado_em', { withTimezone: true }).defaultNow(),
})

export const alunos = pgTable('alunos', {
  id:             uuid('id').primaryKey(),
  escolaId:       uuid('escola_id'),
  nome:           text('nome').notNull(),
  dtNascimento:   date('dt_nascimento').notNull(),
  fotoUrl:        text('foto_url'),
  status:         text('status').default('ativo'),
  criadoEm:       timestamp('criado_em', { withTimezone: true }).defaultNow(),
})

export const turmas = pgTable('turmas', {
  id:          uuid('id').primaryKey(),
  escolaId:    uuid('escola_id'),
  nome:        text('nome').notNull(),
  capacidade:  integer('capacidade').notNull().default(20),
  anoLetivo:   integer('ano_letivo').notNull(),
  professorId: uuid('professor_id'),
  criadoEm:   timestamp('criado_em', { withTimezone: true }).defaultNow(),
})

export const alunosTurmas = pgTable('alunos_turmas', {
  alunoId:  uuid('aluno_id').notNull(),
  turmaId:  uuid('turma_id').notNull(),
  ativo:    boolean('ativo').default(true),
})

export const responsaveis = pgTable('responsaveis', {
  id:        uuid('id').primaryKey(),
  escolaId:  uuid('escola_id'),
  nome:      text('nome').notNull(),
  email:     text('email'),
  telefone:  text('telefone'),
  criadoEm:  timestamp('criado_em', { withTimezone: true }).defaultNow(),
})

export const alunosResponsaveis = pgTable('alunos_responsaveis', {
  alunoId:       uuid('aluno_id').notNull(),
  responsavelId: uuid('responsavel_id').notNull(),
  parentesco:    text('parentesco').default('responsavel'),
})

export const presencas = pgTable('presencas', {
  id:            uuid('id').primaryKey(),
  escolaId:      uuid('escola_id'),
  alunoId:       uuid('aluno_id'),
  data:          date('data').notNull(),
  horaEntrada:   time('hora_entrada'),
  horaSaida:     time('hora_saida'),
  status:        text('status').default('presente'),
  observacao:    text('observacao'),
  registradoPor: uuid('registrado_por'),
  criadoEm:      timestamp('criado_em', { withTimezone: true }).defaultNow(),
})

export const mensalidades = pgTable('mensalidades', {
  id:            uuid('id').primaryKey(),
  escolaId:      uuid('escola_id').notNull(),
  alunoId:       uuid('aluno_id').notNull(),
  mesReferencia: text('mes_referencia').notNull(),
  valor:         numeric('valor').notNull(),
  status:        text('status').notNull().default('pendente'),
  dtVencimento:  date('dt_vencimento'),
  dtPagamento:   date('dt_pagamento'),
  formaPagamento: text('forma_pagamento'),
  observacoes:   text('observacoes'),
  criadoPor:     uuid('criado_por'),
  criadoEm:      timestamp('criado_em', { withTimezone: true }).defaultNow(),
})

export const feedPosts = pgTable('feed_posts', {
  id:        uuid('id').primaryKey(),
  escolaId:  uuid('escola_id'),
  turmaId:   uuid('turma_id'),
  autorId:   uuid('autor_id'),
  categoria: text('categoria').default('geral'),
  conteudo:  text('conteudo').notNull(),
  fotoUrl:   text('foto_url'),
  curtidas:  integer('curtidas').default(0),
  criadoEm:  timestamp('criado_em', { withTimezone: true }).defaultNow(),
})

export const configuracoesEscola = pgTable('configuracoes_escola', {
  id:              uuid('id').primaryKey(),
  escolaId:        uuid('escola_id').notNull(),
  nomeFantasia:    text('nome_fantasia'),
  razaoSocial:     text('razao_social'),
  cnpj:            text('cnpj'),
  logoUrl:         text('logo_url'),
  corPrimaria:     text('cor_primaria').default('#2563EB'),
  telefone:        text('telefone'),
  whatsapp:        text('whatsapp'),
  emailContato:    text('email_contato'),
  site:            text('site'),
  horarioEntrada:  text('horario_entrada').default('07:00'),
  horarioSaida:    text('horario_saida').default('17:00'),
  valorMensalidade: numeric('valor_mensalidade').default('0'),
  diaVencimento:   integer('dia_vencimento').default(10),
  diretorNome:     text('diretor_nome'),
  diretorCpf:      text('diretor_cpf'),
  atualizadoEm:    timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
})

export const avisosFalta = pgTable('avisos_falta', {
  id:            uuid('id').primaryKey(),
  escolaId:      uuid('escola_id'),
  alunoId:       uuid('aluno_id'),
  responsavelId: uuid('responsavel_id'),
  data:          date('data').notNull(),
  motivo:        text('motivo'),
  criadoEm:      timestamp('criado_em', { withTimezone: true }).defaultNow(),
})

export const colaboradores = pgTable('colaboradores', {
  id:           uuid('id').primaryKey(),
  escolaId:     uuid('escola_id').notNull(),
  nome:         text('nome').notNull(),
  email:        text('email'),
  telefone:     text('telefone'),
  cpf:          text('cpf'),
  cargo:        text('cargo').notNull().default('professora'),
  cep:          text('cep'),
  rua:          text('rua'),
  numero:       text('numero'),
  complemento:  text('complemento'),
  bairro:       text('bairro'),
  cidade:       text('cidade'),
  estado:       text('estado'),
  dtAdmissao:   date('dt_admissao'),
  dtVencFerias: date('dt_venc_ferias'),
  salario:      numeric('salario'),
  observacoes:  text('observacoes'),
  ativo:        boolean('ativo').default(true),
  criadoEm:     timestamp('criado_em', { withTimezone: true }).defaultNow(),
})
