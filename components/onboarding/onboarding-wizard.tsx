'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  GraduationCap, Building2, BookOpen, Users, CheckCircle2,
  ChevronRight, ChevronLeft, Plus, Trash2, Upload, Loader2, Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface Props {
  escolaId:   string
  escolaNome: string
}

const STEPS = [
  { n: 1, label: 'Escola',  icon: Building2  },
  { n: 2, label: 'Turmas',  icon: BookOpen   },
  { n: 3, label: 'Alunos',  icon: Users      },
  { n: 4, label: 'Pronto!', icon: CheckCircle2 },
]

interface TurmaInput { id: string; nome: string }
interface CsvRow { nome: string; nascimento: string; turma: string; responsavel: string; telefone: string; email: string }

export function OnboardingWizard({ escolaId, escolaNome }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  // Step 1 — Escola
  const [cnpj,     setCnpj]     = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')

  // Step 2 — Turmas
  const [turmas, setTurmas] = useState<TurmaInput[]>([
    { id: '1', nome: 'Berçário' },
    { id: '2', nome: 'Maternal I' },
    { id: '3', nome: 'Maternal II' },
  ])

  // Step 3 — CSV
  const [csvRows,    setCsvRows]    = useState<CsvRow[]>([])
  const [csvNome,    setCsvNome]    = useState('')
  const [csvErro,    setCsvErro]    = useState('')
  const [importando, setImportando] = useState(false)
  const [resultado,  setResultado]  = useState<{ criados: number; erros: number } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function addTurma() {
    setTurmas(p => [...p, { id: String(Date.now()), nome: '' }])
  }
  function removeTurma(id: string) {
    setTurmas(p => p.filter(t => t.id !== id))
  }
  function updateTurma(id: string, nome: string) {
    setTurmas(p => p.map(t => t.id === id ? { ...t, nome } : t))
  }

  async function salvarEscola() {
    setSalvando(true); setErro('')
    try {
      await fetch('/api/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cnpj, telefone, endereco }),
      })
      setStep(2)
    } catch (e: any) { setErro(e.message) }
    finally { setSalvando(false) }
  }

  async function salvarTurmas() {
    const validas = turmas.filter(t => t.nome.trim())
    if (!validas.length) { setErro('Adicione ao menos uma turma.'); return }
    setSalvando(true); setErro('')
    try {
      await fetch('/api/turmas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turmas: validas.map(t => t.nome.trim()) }),
      })
      setStep(3)
    } catch (e: any) { setErro(e.message) }
    finally { setSalvando(false) }
  }

  function parseCsv(text: string) {
    const lines = text.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    return lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      const row: Record<string, string> = {}
      headers.forEach((h, i) => { row[h] = vals[i] ?? '' })
      return {
        nome:        row['nome']        ?? row['aluno'] ?? '',
        nascimento:  row['nascimento']  ?? row['data_nascimento'] ?? row['dt_nascimento'] ?? '',
        turma:       row['turma']       ?? '',
        responsavel: row['responsavel'] ?? row['pai/mae'] ?? '',
        telefone:    row['telefone']    ?? row['whatsapp'] ?? '',
        email:       row['email']       ?? '',
      } as CsvRow
    }).filter(r => r.nome)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvNome(file.name)
    setCsvErro('')
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const rows = parseCsv(ev.target?.result as string)
        if (!rows.length) { setCsvErro('Nenhum aluno encontrado. Verifique o formato.'); return }
        setCsvRows(rows)
      } catch { setCsvErro('Erro ao ler o arquivo. Verifique o formato CSV.') }
    }
    reader.readAsText(file, 'UTF-8')
  }

  async function importarCsv() {
    if (!csvRows.length) { setCsvErro('Nenhum aluno carregado.'); return }
    setImportando(true); setCsvErro('')
    try {
      const res = await fetch('/api/onboarding/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: csvRows }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setResultado(json)
    } catch (e: any) {
      setCsvErro(e.message)
    } finally {
      setImportando(false)
    }
  }

  async function concluir() {
    setSalvando(true)
    await fetch('/api/onboarding', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onboarding_completo: true }),
    })
    setSalvando(false)
    router.push('/dashboard')
  }

  function baixarModelo() {
    const csv = [
      'nome,nascimento,turma,responsavel,telefone,email',
      'João Silva,15/03/2020,Maternal I,Maria Silva,(11)99999-9999,maria@email.com',
      'Ana Costa,22/07/2021,Berçário,Pedro Costa,(11)98888-8888,pedro@email.com',
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'modelo_alunos.csv' })
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#fff8f2]">
      {/* Header */}
      <header className="bg-[#1B3A6B] text-white px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 bg-[#004ac6] rounded-md flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Configuração Inicial</p>
            <p className="text-base font-bold">{escolaNome}</p>
          </div>
        </div>
      </header>

      {/* Steps */}
      <div className="bg-white border-b border-[#e8e1dc]">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const done   = step > s.n
              const active = step === s.n
              const Icon   = s.icon
              return (
                <div key={s.n} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      done ? 'bg-green-500 text-white' : active ? 'bg-[#004ac6] text-white' : 'bg-[#e8e1dc] text-gray-500'
                    }`}>
                      {done ? '✓' : <Icon className="w-4 h-4" />}
                    </div>
                    <span className={`text-xs font-semibold hidden sm:block ${active ? 'text-[#1B3A6B]' : 'text-gray-400'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-2 ${step > s.n ? 'bg-green-400' : 'bg-[#e8e1dc]'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* STEP 1 — Escola */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-[#e8e1dc] p-6 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-[#1B3A6B]">Perfil da Escola</h2>
              <p className="text-sm text-gray-500 mt-1">Complete as informações básicas. Pode editar depois em Configurações.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cnpj">CNPJ</Label>
              <input id="cnpj" value={cnpj} onChange={e => setCnpj(e.target.value)}
                placeholder="00.000.000/0001-00"
                className="flex h-12 w-full rounded-lg border border-[#e8e1dc] bg-white px-4 text-sm focus:border-[#004ac6] outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tel">Telefone / WhatsApp</Label>
              <input id="tel" value={telefone} onChange={e => setTelefone(e.target.value)}
                placeholder="(11) 3000-0000"
                className="flex h-12 w-full rounded-lg border border-[#e8e1dc] bg-white px-4 text-sm focus:border-[#004ac6] outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end">Endereço</Label>
              <input id="end" value={endereco} onChange={e => setEndereco(e.target.value)}
                placeholder="Rua Exemplo, 123 — São Paulo/SP"
                className="flex h-12 w-full rounded-lg border border-[#e8e1dc] bg-white px-4 text-sm focus:border-[#004ac6] outline-none transition-all" />
            </div>

            {erro && <p className="text-sm text-red-500 bg-red-50 rounded px-3 py-2">{erro}</p>}

            <div className="flex justify-between pt-2">
              <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-400 hover:text-gray-600">
                Pular por agora
              </button>
              <Button onClick={salvarEscola} className="gap-2" disabled={salvando}>
                {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Próximo <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2 — Turmas */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-[#e8e1dc] p-6 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-[#1B3A6B]">Turmas</h2>
              <p className="text-sm text-gray-500 mt-1">Adicione as turmas da escola. Pode criar mais depois.</p>
            </div>

            <div className="space-y-2">
              {turmas.map(t => (
                <div key={t.id} className="flex items-center gap-2">
                  <input
                    value={t.nome}
                    onChange={e => updateTurma(t.id, e.target.value)}
                    placeholder="Nome da turma (ex: Maternal I)"
                    className="flex-1 h-11 rounded-lg border border-[#e8e1dc] bg-white px-4 text-sm focus:border-[#004ac6] outline-none transition-all"
                  />
                  <button onClick={() => removeTurma(t.id)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button onClick={addTurma}
                className="flex items-center gap-2 text-sm font-semibold text-[#004ac6] hover:text-[#1B3A6B] transition-colors mt-1">
                <Plus className="w-4 h-4" />
                Adicionar turma
              </button>
            </div>

            {erro && <p className="text-sm text-red-500 bg-red-50 rounded px-3 py-2">{erro}</p>}

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-1">
                <ChevronLeft className="w-4 h-4" /> Voltar
              </Button>
              <Button onClick={salvarTurmas} className="gap-2" disabled={salvando}>
                {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Próximo <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3 — Importar alunos */}
        {step === 3 && (
          <div className="bg-white rounded-xl border border-[#e8e1dc] p-6 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-[#1B3A6B]">Importar Alunos</h2>
              <p className="text-sm text-gray-500 mt-1">Carregue uma planilha CSV com os dados dos alunos.</p>
            </div>

            {/* Modelo */}
            <div className="bg-blue-50 rounded-lg px-4 py-3 flex items-start gap-3">
              <Download className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-blue-700">Baixar modelo CSV</p>
                <p className="text-xs text-blue-600 mt-0.5">Colunas: nome, nascimento, turma, responsavel, telefone, email</p>
              </div>
              <button onClick={baixarModelo}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 shrink-0">
                Baixar
              </button>
            </div>

            {/* Upload */}
            <div>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full h-28 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#e8e1dc] rounded-xl hover:border-[#004ac6] hover:bg-blue-50/50 transition-colors"
              >
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="text-sm font-semibold text-gray-600">
                  {csvNome ? csvNome : 'Clique para selecionar o CSV'}
                </span>
                {csvRows.length > 0 && (
                  <span className="text-xs text-green-600 font-bold">{csvRows.length} alunos encontrados</span>
                )}
              </button>
            </div>

            {/* Preview */}
            {csvRows.length > 0 && !resultado && (
              <div className="max-h-48 overflow-y-auto rounded-lg border border-[#e8e1dc]">
                <table className="w-full text-xs">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      {['Nome', 'Nascimento', 'Turma', 'Responsável', 'Telefone'].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-bold text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvRows.slice(0, 10).map((r, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-muted/30'}>
                        <td className="px-3 py-1.5 font-medium">{r.nome}</td>
                        <td className="px-3 py-1.5 text-muted-foreground">{r.nascimento}</td>
                        <td className="px-3 py-1.5 text-muted-foreground">{r.turma || '-'}</td>
                        <td className="px-3 py-1.5 text-muted-foreground">{r.responsavel || '-'}</td>
                        <td className="px-3 py-1.5 text-muted-foreground">{r.telefone || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvRows.length > 10 && (
                  <p className="text-center text-xs text-muted-foreground py-2">
                    + {csvRows.length - 10} mais...
                  </p>
                )}
              </div>
            )}

            {resultado && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-bold text-green-700">
                  {resultado.criados} aluno{resultado.criados !== 1 ? 's' : ''} importado{resultado.criados !== 1 ? 's' : ''}!
                </p>
                {resultado.erros > 0 && (
                  <p className="text-xs text-amber-600 mt-1">{resultado.erros} linha{resultado.erros !== 1 ? 's' : ''} com erro foram ignoradas.</p>
                )}
              </div>
            )}

            {csvErro && <p className="text-sm text-red-500 bg-red-50 rounded px-3 py-2">{csvErro}</p>}

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(2)} className="gap-1">
                <ChevronLeft className="w-4 h-4" /> Voltar
              </Button>
              <div className="flex gap-2">
                {csvRows.length > 0 && !resultado && (
                  <Button onClick={importarCsv} disabled={importando} className="gap-2">
                    {importando ? <><Loader2 className="w-4 h-4 animate-spin" />Importando...</> : `Importar ${csvRows.length} alunos`}
                  </Button>
                )}
                <Button
                  onClick={() => setStep(4)}
                  variant={resultado ? 'default' : 'outline'}
                  className="gap-2"
                >
                  {resultado ? 'Concluir' : 'Pular'} <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 — Concluir */}
        {step === 4 && (
          <div className="bg-white rounded-xl border border-[#e8e1dc] p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#1B3A6B] mb-3">{escolaNome} está pronta!</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Configuração concluída. Você já pode usar todas as funcionalidades do EduCare.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 mb-8 text-left">
              {[
                { icon: Users, title: 'Alunos', desc: 'Gerencie cadastros e responsáveis', href: '/alunos' },
                { icon: BookOpen, title: 'Diário', desc: 'Lance registros diários em massa', href: '/diario-massa' },
                { icon: GraduationCap, title: 'Matrículas', desc: 'Receba pré-matrículas online', href: '/matriculas' },
              ].map(item => {
                const Icon = item.icon
                return (
                  <a key={item.href} href={item.href}
                    className="flex items-start gap-3 p-4 rounded-lg border border-[#e8e1dc] hover:border-[#004ac6] hover:bg-blue-50/50 transition-colors">
                    <div className="w-8 h-8 bg-[#004ac6]/10 rounded-md flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[#004ac6]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </a>
                )
              })}
            </div>

            <Button onClick={concluir} className="gap-2 h-12 px-8" disabled={salvando}>
              {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Ir para o Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
