'use client'

import { useState, useTransition, useRef } from 'react'
import {
  Building2, Phone, MapPin, Clock,
  Loader2, CheckCircle2, AlertTriangle, Upload, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export interface ConfigEscola {
  id?: string
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
}

interface Props { config: ConfigEscola; escolaNome: string }
type Aba = 'identidade' | 'contato' | 'endereco' | 'operacao'

const ABAS: { key: Aba; label: string; icon: React.ElementType }[] = [
  { key: 'identidade', label: 'Identidade', icon: Building2 },
  { key: 'contato',    label: 'Contato',    icon: Phone },
  { key: 'endereco',   label: 'Endereço',   icon: MapPin },
  { key: 'operacao',   label: 'Operação',   icon: Clock },
]

const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
                 'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

export function ConfiguracoesClient({ config: configInicial, escolaNome }: Props) {
  const router   = useRouter()
  const supabase = createClient()
  const [, start] = useTransition()
  const fileRef  = useRef<HTMLInputElement>(null)

  const [aba, setAba]           = useState<Aba>('identidade')
  const [form, setForm]         = useState<ConfigEscola>(configInicial)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso]   = useState(false)
  const [erro, setErro]         = useState('')
  const [uploading, setUploading] = useState(false)

  function set(f: keyof ConfigEscola, v: any) { setForm(p => ({ ...p, [f]: v })) }

  async function uploadLogo(file: File) {
    setUploading(true); setErro('')
    try {
      const ext  = file.name.split('.').pop()
      const path = `logos/${form.escola_id}/logo.${ext}`
      const { error: upErr } = await supabase.storage
        .from('escola-assets').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('escola-assets').getPublicUrl(path)
      set('logo_url', data.publicUrl + `?t=${Date.now()}`)
    } catch (e: any) { setErro('Erro no upload: ' + e.message) }
    finally { setUploading(false) }
  }

  async function salvar() {
    setSalvando(true); setErro(''); setSucesso(false)
    try {
      const payload = {
        escola_id:         form.escola_id,
        nome_fantasia:     form.nome_fantasia    || null,
        razao_social:      form.razao_social     || null,
        cnpj:              form.cnpj             || null,
        logo_url:          form.logo_url         || null,
        cor_primaria:      form.cor_primaria     || '#2563EB',
        telefone:          form.telefone         || null,
        whatsapp:          form.whatsapp         || null,
        email_contato:     form.email_contato    || null,
        site:              form.site             || null,
        cep:               form.cep              || null,
        rua:               form.rua              || null,
        numero:            form.numero           || null,
        complemento:       form.complemento      || null,
        bairro:            form.bairro           || null,
        cidade:            form.cidade           || null,
        estado:            form.estado           || null,
        horario_entrada:   form.horario_entrada  || '07:00',
        horario_saida:     form.horario_saida    || '17:00',
        valor_mensalidade: form.valor_mensalidade ?? 0,
        dia_vencimento:    form.dia_vencimento   ?? 10,
        diretor_nome:      form.diretor_nome     || null,
        diretor_cpf:       form.diretor_cpf      || null,
        atualizado_em:     new Date().toISOString(),
      }

      if (form.id) {
        const { error } = await (supabase as any).from('configuracoes_escola').update(payload).eq('id', form.id)
        if (error) throw error
      } else {
        const { data, error } = await (supabase as any).from('configuracoes_escola').insert(payload).select().single()
        if (error) throw error
        set('id', (data as any).id)
      }
      setSucesso(true); setTimeout(() => setSucesso(false), 3000)
      start(() => router.refresh())
    } catch (e: any) { setErro(e.message) }
    finally { setSalvando(false) }
  }

  const F = ({ label, field, type = 'text', placeholder, cls }: {
    label: string; field: keyof ConfigEscola; type?: string; placeholder?: string; cls?: string
  }) => (
    <div className={cls}>
      <Label className="text-sm font-bold text-slate-700">{label}</Label>
      <Input type={type} value={(form[field] as string) ?? ''} placeholder={placeholder}
        onChange={e => set(field, e.target.value)} className="mt-1" />
    </div>
  )

  return (
    <div className="max-w-3xl">
      {/* Abas */}
      <div className="flex gap-1 bg-white rounded-xl shadow-soft border border-slate-100 p-1 mb-6 w-fit flex-wrap">
        {ABAS.map(a => {
          const Icon = a.icon
          return (
            <button key={a.key} onClick={() => setAba(a.key)}
              className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all',
                aba === a.key ? 'bg-primary text-white shadow-soft' : 'text-slate-500 hover:text-slate-700')}>
              <Icon className="w-4 h-4" />{a.label}
            </button>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-6">

        {/* ── IDENTIDADE ── */}
        {aba === 'identidade' && (
          <div className="space-y-5">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Identidade da Escola</h3>

            <div>
              <Label className="text-sm font-bold text-slate-700">Logo da escola</Label>
              <div className="mt-2 flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 shrink-0">
                  {form.logo_url
                    ? <img src={form.logo_url} alt="Logo" className="w-full h-full object-contain" />
                    : <Building2 className="w-8 h-8 text-slate-300" />}
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading} className="gap-2">
                    {uploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Enviando...</> : <><Upload className="w-3.5 h-3.5" />Enviar logo</>}
                  </Button>
                  {form.logo_url && (
                    <button onClick={() => set('logo_url', null)} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                      <X className="w-3 h-3" /> Remover
                    </button>
                  )}
                  <p className="text-xs text-slate-400">PNG ou JPG até 2MB. Ideal: 200×200px.</p>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(f) }} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <F label="Nome Fantasia" field="nome_fantasia" placeholder={escolaNome} />
              <F label="Razão Social"  field="razao_social"  placeholder="Escola LTDA" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <F label="CNPJ" field="cnpj" placeholder="00.000.000/0001-00" />
              <div>
                <Label className="text-sm font-bold text-slate-700">Cor principal</Label>
                <div className="mt-1 flex items-center gap-3">
                  <input type="color" value={form.cor_primaria ?? '#2563EB'}
                    onChange={e => set('cor_primaria', e.target.value)}
                    className="h-10 w-16 rounded-xl border border-slate-200 cursor-pointer p-1" />
                  <Input value={form.cor_primaria ?? '#2563EB'}
                    onChange={e => set('cor_primaria', e.target.value)}
                    placeholder="#2563EB" className="flex-1" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <F label="Diretor(a)"   field="diretor_nome" placeholder="Nome completo" />
              <F label="CPF diretor"  field="diretor_cpf"  placeholder="000.000.000-00" />
            </div>
          </div>
        )}

        {/* ── CONTATO ── */}
        {aba === 'contato' && (
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Dados de Contato</h3>
            <div className="grid grid-cols-2 gap-4">
              <F label="Telefone"  field="telefone"      placeholder="(11) 3333-4444" />
              <F label="WhatsApp"  field="whatsapp"      placeholder="(11) 99999-8888" />
            </div>
            <F label="E-mail de contato" field="email_contato" type="email" placeholder="contato@escola.com.br" />
            <F label="Site" field="site" placeholder="https://escola.com.br" />
          </div>
        )}

        {/* ── ENDEREÇO ── */}
        {aba === 'endereco' && (
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Endereço</h3>
            <div className="grid grid-cols-3 gap-4">
              <F label="CEP"            field="cep"  placeholder="00000-000" />
              <F label="Rua / Avenida"  field="rua"  placeholder="Rua das Flores" cls="col-span-2" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <F label="Número"       field="numero"      placeholder="123" />
              <F label="Complemento"  field="complemento" placeholder="Apto, Bloco..." cls="col-span-2" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <F label="Bairro" field="bairro" placeholder="Centro" />
              <F label="Cidade" field="cidade" placeholder="São Paulo" />
              <div>
                <Label className="text-sm font-bold text-slate-700">Estado</Label>
                <select value={form.estado ?? ''} onChange={e => set('estado', e.target.value)}
                  className="mt-1 w-full h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white">
                  <option value="">—</option>
                  {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── OPERAÇÃO ── */}
        {aba === 'operacao' && (
          <div className="space-y-5">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Horários e Financeiro</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-bold text-slate-700">Entrada</Label>
                <Input type="time" value={form.horario_entrada ?? '07:00'}
                  onChange={e => set('horario_entrada', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-bold text-slate-700">Saída</Label>
                <Input type="time" value={form.horario_saida ?? '17:00'}
                  onChange={e => set('horario_saida', e.target.value)} className="mt-1" />
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 space-y-4">
              <p className="text-xs font-black text-blue-700 uppercase tracking-widest">Mensalidades</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-bold text-slate-700">Valor padrão (R$)</Label>
                  <Input type="number" step="0.01" min="0"
                    value={form.valor_mensalidade ?? ''}
                    onChange={e => set('valor_mensalidade', Number(e.target.value))}
                    placeholder="0,00" className="mt-1" />
                  <p className="text-xs text-slate-400 mt-1">Usado ao gerar cobranças em lote.</p>
                </div>
                <div>
                  <Label className="text-sm font-bold text-slate-700">Dia de vencimento</Label>
                  <Input type="number" min={1} max={28}
                    value={form.dia_vencimento ?? 10}
                    onChange={e => set('dia_vencimento', parseInt(e.target.value))}
                    className="mt-1" />
                  <p className="text-xs text-slate-400 mt-1">Dia do mês (1 a 28).</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback */}
        {erro && (
          <div className="mt-4 flex items-center gap-2 bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {erro}
          </div>
        )}
        {sucesso && (
          <div className="mt-4 flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-xl px-4 py-3 text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> Configurações salvas!
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={salvar} disabled={salvando} className="gap-2 px-8">
            {salvando ? <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</> : 'Salvar configurações'}
          </Button>
        </div>
      </div>
    </div>
  )
}
