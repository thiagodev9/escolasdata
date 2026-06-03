export type Role = 'super_admin' | 'diretora' | 'professora' | 'responsavel'
export type MatriculaStatus = 'aguardando' | 'aprovada' | 'rejeitada'
export type Plano = 'basico' | 'profissional' | 'enterprise'
export type AlunoStatus = 'ativo' | 'inativo' | 'pendente'

export interface Escola {
  id: string
  nome: string
  slug: string
  plano: Plano
  ativo: boolean
  config: Record<string, unknown>
  criado_em: string
}

export interface Usuario {
  id: string
  escola_id: string
  nome: string
  email: string
  role: Role
  ativo: boolean
  criado_em: string
}

export interface Aluno {
  id: string
  escola_id: string
  nome: string
  dt_nascimento: string
  foto_url: string | null
  status: AlunoStatus
  criado_em: string
  // joined
  turma?: Turma
  responsaveis?: Responsavel[]
}

export interface Turma {
  id: string
  escola_id: string
  nome: string
  capacidade: number
  ano_letivo: number
  professor_id: string | null
  criado_em: string
  // joined
  professor?: Usuario
  total_alunos?: number
}

export interface Responsavel {
  id: string
  escola_id: string
  nome: string
  email: string
  telefone: string
  criado_em: string
}

export interface AlunoTurma {
  aluno_id: string
  turma_id: string
  ativo: boolean
}

export interface AlunoResponsavel {
  aluno_id: string
  responsavel_id: string
  parentesco: string
}

export interface Matricula {
  id: string
  escola_id: string
  aluno_nome: string
  aluno_nascimento: string
  turma_interesse: string | null
  resp_nome: string
  resp_email: string | null
  resp_telefone: string
  resp_parentesco: string
  status: MatriculaStatus
  observacoes: string | null
  criado_em: string
}

export type NfseStatus   = 'pendente' | 'emitida' | 'cancelada' | 'erro'
export type LgpdTipo     = 'exportacao' | 'exclusao' | 'correcao' | 'portabilidade'
export type LgpdStatus   = 'pendente' | 'processando' | 'concluido' | 'rejeitado'
export type RegimeTrib   = 'simples' | 'lucro_presumido' | 'lucro_real'

export interface NfseConfig {
  id: string
  escola_id: string
  prestador_cnpj: string | null
  prestador_im: string | null
  regime_tributario: RegimeTrib
  iss_aliquota: number
  codigo_servico: string
  municipio_ibge: string | null
  municipio_nome: string | null
  ambiente: 'homologacao' | 'producao'
  nfeio_api_key: string | null
  criado_em: string
}

export interface NfseEmitida {
  id: string
  escola_id: string
  aluno_id: string | null
  responsavel_id: string | null
  valor: number
  competencia: string
  descricao: string | null
  status: NfseStatus
  nfse_numero: string | null
  nfse_codigo_verificacao: string | null
  xml_url: string | null
  pdf_url: string | null
  erro_msg: string | null
  criado_por: string | null
  criado_em: string
}

export interface LgpdRequest {
  id: string
  escola_id: string
  responsavel_email: string
  responsavel_nome: string | null
  tipo: LgpdTipo
  status: LgpdStatus
  observacoes: string | null
  resposta: string | null
  processado_por: string | null
  criado_em: string
  processado_em: string | null
}

export type MensalidadeStatus = 'pendente' | 'pago' | 'vencido' | 'isento'

export interface Mensalidade {
  id: string
  escola_id: string
  aluno_id: string
  mes_referencia: string
  valor: number
  status: MensalidadeStatus
  dt_vencimento: string | null
  dt_pagamento: string | null
  forma_pagamento: string | null
  observacoes: string | null
  criado_por: string | null
  criado_em: string
}

export interface ConfiguracaoEscola {
  id: string
  escola_id: string
  nome_fantasia: string | null
  razao_social: string | null
  cnpj: string | null
  logo_url: string | null
  cor_primaria: string | null
  telefone: string | null
  whatsapp: string | null
  email_contato: string | null
  site: string | null
  cep: string | null
  rua: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  horario_entrada: string | null
  horario_saida: string | null
  valor_mensalidade: number | null
  dia_vencimento: number | null
  diretor_nome: string | null
  diretor_cpf: string | null
  atualizado_em: string
}

export interface CardapioItem {
  id: string
  escola_id: string
  semana_inicio: string
  dia_semana: number
  refeicao: string
  descricao: string
  criado_em: string
}

export interface AuditLog {
  id: string
  escola_id: string
  usuario_id: string | null
  acao: string
  tabela: string | null
  registro_id: string | null
  detalhes: Record<string, unknown>
  ip: string | null
  criado_em: string
}

export interface Database {
  public: {
    Tables: {
      escolas: { Row: Escola; Insert: Omit<Escola, 'id' | 'criado_em'>; Update: Partial<Escola> }
      usuarios: { Row: Usuario; Insert: Omit<Usuario, 'id' | 'criado_em'>; Update: Partial<Usuario> }
      alunos: { Row: Aluno; Insert: Omit<Aluno, 'id' | 'criado_em'>; Update: Partial<Aluno> }
      turmas: { Row: Turma; Insert: Omit<Turma, 'id' | 'criado_em'>; Update: Partial<Turma> }
      responsaveis: { Row: Responsavel; Insert: Omit<Responsavel, 'id' | 'criado_em'>; Update: Partial<Responsavel> }
      alunos_turmas: { Row: AlunoTurma; Insert: AlunoTurma; Update: Partial<AlunoTurma> }
      alunos_responsaveis: { Row: AlunoResponsavel; Insert: AlunoResponsavel; Update: Partial<AlunoResponsavel> }
    }
  }
}
