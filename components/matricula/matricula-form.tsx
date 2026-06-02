'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, User, Phone, Mail, Baby, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface Turma { id: string; nome: string }

interface Props {
  escolaId: string
  escolaNome: string
  turmas: Turma[]
  slug: string
}

export function MatriculaForm({ escolaId, escolaNome, turmas, slug }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const [aluno, setAluno] = useState({ nome: '', nascimento: '', turma: '' })
  const [resp,  setResp]  = useState({ nome: '', telefone: '', email: '', parentesco: 'pai/mãe' })

  function validarStep1() {
    if (!aluno.nome.trim()) return 'Informe o nome do aluno.'
    if (!aluno.nascimento)  return 'Informe a data de nascimento.'
    return ''
  }

  function avancar() {
    const err = validarStep1()
    if (err) { setErro(err); return }
    setErro('')
    setStep(2)
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!resp.nome.trim())     { setErro('Informe o nome do responsável.'); return }
    if (!resp.telefone.trim()) { setErro('Informe o telefone do responsável.'); return }

    setSalvando(true)
    setErro('')
    try {
      const res = await fetch('/api/matriculas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escola_id:       escolaId,
          aluno_nome:      aluno.nome,
          aluno_nascimento: aluno.nascimento,
          turma_interesse: aluno.turma || null,
          resp_nome:       resp.nome,
          resp_email:      resp.email || null,
          resp_telefone:   resp.telefone,
          resp_parentesco: resp.parentesco,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      router.push(`/matricula/${slug}/sucesso`)
    } catch (err: any) {
      setErro(err.message ?? 'Erro ao enviar matrícula.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fff8f2] flex flex-col">
      {/* Header */}
      <header className="bg-[#1B3A6B] text-white px-6 py-5">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-9 h-9 bg-[#004ac6] rounded-md flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Pré-Matrícula</p>
            <p className="text-base font-bold">{escolaNome}</p>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b border-[#e8e1dc]">
        <div className="max-w-lg mx-auto px-6 py-3 flex items-center gap-3">
          <StepBadge n={1} active={step === 1} done={step === 2} label="Dados do Aluno" />
          <div className="flex-1 h-px bg-[#e8e1dc]" />
          <StepBadge n={2} active={step === 2} done={false} label="Responsável" />
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-lg mx-auto">
          {step === 1 ? (
            <div className="bg-white rounded-xl shadow-sm border border-[#e8e1dc] p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Baby className="w-5 h-5 text-[#004ac6]" />
                <h2 className="text-lg font-bold text-[#1B3A6B]">Dados do Aluno</h2>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="aluno_nome">Nome completo *</Label>
                <input
                  id="aluno_nome"
                  value={aluno.nome}
                  onChange={e => setAluno(p => ({ ...p, nome: e.target.value }))}
                  placeholder="Nome da criança"
                  className="flex h-12 w-full rounded-lg border border-[#e8e1dc] bg-white px-4 text-sm focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nascimento">Data de nascimento *</Label>
                <input
                  id="nascimento"
                  type="date"
                  value={aluno.nascimento}
                  onChange={e => setAluno(p => ({ ...p, nascimento: e.target.value }))}
                  className="flex h-12 w-full rounded-lg border border-[#e8e1dc] bg-white px-4 text-sm focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all"
                />
              </div>

              {turmas.length > 0 && (
                <div className="space-y-1.5">
                  <Label htmlFor="turma">Turma de interesse</Label>
                  <select
                    id="turma"
                    value={aluno.turma}
                    onChange={e => setAluno(p => ({ ...p, turma: e.target.value }))}
                    className="flex h-12 w-full rounded-lg border border-[#e8e1dc] bg-white px-4 text-sm focus:border-[#004ac6] outline-none transition-all"
                  >
                    <option value="">Selecione (opcional)</option>
                    {turmas.map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
                  </select>
                </div>
              )}

              {erro && <p className="text-sm text-red-500 bg-red-50 rounded px-3 py-2">{erro}</p>}

              <Button onClick={avancar} className="w-full gap-2 h-12">
                Próximo — Dados do Responsável
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <form onSubmit={enviar} className="bg-white rounded-xl shadow-sm border border-[#e8e1dc] p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-[#004ac6]" />
                <h2 className="text-lg font-bold text-[#1B3A6B]">Dados do Responsável</h2>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="resp_nome">Nome completo *</Label>
                <input
                  id="resp_nome"
                  value={resp.nome}
                  onChange={e => setResp(p => ({ ...p, nome: e.target.value }))}
                  placeholder="Nome do pai/mãe/responsável"
                  className="flex h-12 w-full rounded-lg border border-[#e8e1dc] bg-white px-4 text-sm focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="resp_tel">WhatsApp / Telefone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="resp_tel"
                    value={resp.telefone}
                    onChange={e => setResp(p => ({ ...p, telefone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                    className="flex h-12 w-full rounded-lg border border-[#e8e1dc] bg-white pl-10 pr-4 text-sm focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="resp_email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="resp_email"
                    type="email"
                    value={resp.email}
                    onChange={e => setResp(p => ({ ...p, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                    className="flex h-12 w-full rounded-lg border border-[#e8e1dc] bg-white pl-10 pr-4 text-sm focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="parentesco">Parentesco</Label>
                <select
                  id="parentesco"
                  value={resp.parentesco}
                  onChange={e => setResp(p => ({ ...p, parentesco: e.target.value }))}
                  className="flex h-12 w-full rounded-lg border border-[#e8e1dc] bg-white px-4 text-sm focus:border-[#004ac6] outline-none transition-all"
                >
                  <option>pai/mãe</option>
                  <option>avó/avô</option>
                  <option>tio/tia</option>
                  <option>responsável legal</option>
                  <option>outro</option>
                </select>
              </div>

              {erro && <p className="text-sm text-red-500 bg-red-50 rounded px-3 py-2">{erro}</p>}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 h-12 rounded-lg border border-[#e8e1dc] text-sm font-semibold hover:bg-[#f5f0eb] transition-colors">
                  Voltar
                </button>
                <Button type="submit" className="flex-1 h-12 gap-2" disabled={salvando}>
                  {salvando ? <><Loader2 className="w-4 h-4 animate-spin" />Enviando...</> : 'Enviar Solicitação'}
                </Button>
              </div>
            </form>
          )}

          <p className="text-center text-xs text-gray-400 mt-6">
            Após o envio, a escola entrará em contato para confirmar a matrícula.
          </p>
        </div>
      </div>
    </div>
  )
}

function StepBadge({ n, active, done, label }: { n: number; active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
        done ? 'bg-green-500 text-white' : active ? 'bg-[#004ac6] text-white' : 'bg-[#e8e1dc] text-gray-500'
      }`}>
        {done ? '✓' : n}
      </div>
      <span className={`text-xs font-semibold ${active ? 'text-[#1B3A6B]' : 'text-gray-400'}`}>{label}</span>
    </div>
  )
}
