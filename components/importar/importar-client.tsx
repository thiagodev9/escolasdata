'use client'

import { useState, useRef } from 'react'
import { Download, Upload, FileSpreadsheet, Users, UserCog, CheckCircle2, AlertTriangle, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface Props { temAlunos: boolean; temColaboradores: boolean }

type Aba = 'alunos' | 'colaboradores'

// Templates CSV
const TEMPLATE_ALUNOS = `nome,nascimento,turma,status,responsavel,telefone,email_responsavel
Ana Silva,22/07/2020,Jardim I,ativo,Carlos Silva,(11) 98888-7777,carlos@email.com
Pedro Santos,15/03/2019,Maternal II,ativo,Maria Santos,(11) 97777-6666,maria@email.com`

const TEMPLATE_COLABORADORES = `nome,email,telefone,cpf,cargo,dt_admissao,salario,cep,rua,numero,bairro,cidade,estado,observacoes
Maria Souza,maria@escola.com,(11) 96666-5555,123.456.789-00,professora,01/03/2024,3500.00,01310-100,Av. Paulista,1000,Bela Vista,São Paulo,SP,
João Lima,joao@escola.com,(11) 95555-4444,987.654.321-00,auxiliar_classe,15/06/2023,2200.00,,,,,,, `

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n').filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  return lines.slice(1).map(line => {
    const vals = splitCsvLine(line)
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => { obj[h] = (vals[i] ?? '').trim().replace(/^"|"$/g, '') })
    return obj
  }).filter(r => Object.values(r).some(v => v))
}

function splitCsvLine(line: string): string[] {
  const result: string[] = []
  let cur = '', inQ = false
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') { inQ = !inQ }
    else if (line[i] === ',' && !inQ) { result.push(cur); cur = '' }
    else cur += line[i]
  }
  result.push(cur)
  return result
}

function downloadCsv(content: string, filename: string) {
  const bom = '﻿' // BOM para Excel reconhecer UTF-8
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export function ImportarClient({ temAlunos, temColaboradores }: Props) {
  const [aba, setAba]             = useState<Aba>('alunos')
  const [arquivo, setArquivo]     = useState<File | null>(null)
  const [preview, setPreview]     = useState<Record<string, string>[]>([])
  const [importando, setImportando] = useState(false)
  const [resultado, setResultado] = useState<{ criados: number; erros: number } | null>(null)
  const [erro, setErro]           = useState('')
  const [exportando, setExportando] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router   = useRouter()

  function handleArquivo(file: File | null) {
    if (!file) return
    setArquivo(file); setResultado(null); setErro('')
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      const rows = parseCsv(text)
      setPreview(rows.slice(0, 5))
    }
    reader.readAsText(file, 'UTF-8')
  }

  async function importar() {
    if (!arquivo) return
    setImportando(true); setErro(''); setResultado(null)
    const reader = new FileReader()
    reader.onload = async e => {
      const text = e.target?.result as string
      const rows = parseCsv(text)
      const endpoint = aba === 'alunos' ? '/api/onboarding/import-csv' : '/api/importar/colaboradores'
      try {
        const res  = await fetch(endpoint, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ rows }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        setResultado(json)
        setArquivo(null); setPreview([])
        router.refresh()
      } catch (err: any) { setErro(err.message) }
      finally { setImportando(false) }
    }
    reader.readAsText(arquivo, 'UTF-8')
  }

  async function exportar() {
    setExportando(true)
    const endpoint = aba === 'alunos' ? '/api/exportar/alunos' : '/api/exportar/colaboradores'
    try {
      const res = await fetch(endpoint)
      if (!res.ok) throw new Error('Erro ao exportar')
      const text = await res.text()
      downloadCsv(text, aba === 'alunos' ? 'alunos.csv' : 'colaboradores.csv')
    } catch (err: any) { setErro(err.message) }
    finally { setExportando(false) }
  }

  const abaConfig = {
    alunos: {
      icon: Users,
      template: TEMPLATE_ALUNOS,
      filename: 'modelo_alunos.csv',
      colunas: ['nome','nascimento','turma','status','responsavel','telefone','email_responsavel'],
      dica: 'Status: ativo, pendente ou inativo. Nascimento: dd/mm/aaaa.',
    },
    colaboradores: {
      icon: UserCog,
      template: TEMPLATE_COLABORADORES,
      filename: 'modelo_colaboradores.csv',
      colunas: ['nome','email','telefone','cpf','cargo','dt_admissao','salario','cidade','estado'],
      dica: 'Cargo: professora, diretora, auxiliar_classe, monitora, cozinheira, faxineira, porteiro, outro.',
    },
  }

  const cfg = abaConfig[aba]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Importar / Exportar</h1>
        <p className="text-muted-foreground mt-1">Importe dados existentes ou exporte para planilha.</p>
      </div>

      {/* Abas */}
      <div className="flex gap-1 bg-white rounded-xl shadow-soft border border-slate-100 p-1 mb-6 w-fit">
        {(['alunos', 'colaboradores'] as Aba[]).map(a => {
          const Icon = abaConfig[a].icon
          return (
            <button key={a} onClick={() => { setAba(a); setArquivo(null); setPreview([]); setResultado(null); setErro('') }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all
                ${aba === a ? 'bg-primary text-white shadow-soft' : 'text-slate-500 hover:text-slate-700'}`}>
              <Icon className="w-4 h-4" />
              {a === 'alunos' ? 'Alunos' : 'Colaboradores'}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Exportar ── */}
        <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Download className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800">Exportar dados</h2>
              <p className="text-xs text-slate-400">Baixe os dados atuais em CSV</p>
            </div>
          </div>

          <p className="text-sm text-slate-600 mb-4">
            {aba === 'alunos'
              ? 'Exporta todos os alunos com turma e responsável principal.'
              : 'Exporta todos os colaboradores com dados completos.'}
          </p>

          <Button onClick={exportar} disabled={exportando} variant="outline" className="w-full gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
            {exportando ? <><Loader2 className="w-4 h-4 animate-spin" /> Exportando...</> : <><Download className="w-4 h-4" /> Exportar {aba === 'alunos' ? 'Alunos' : 'Colaboradores'}.csv</>}
          </Button>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 mb-2">Baixar modelo em branco:</p>
            <button onClick={() => downloadCsv(cfg.template, cfg.filename)}
              className="flex items-center gap-2 text-xs font-semibold text-primary hover:underline">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              {cfg.filename}
            </button>
          </div>
        </div>

        {/* ── Importar ── */}
        <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800">Importar dados</h2>
              <p className="text-xs text-slate-400">Envie um arquivo CSV preenchido</p>
            </div>
          </div>

          {/* Dica */}
          <div className="bg-blue-50 rounded-xl px-3 py-2 mb-4 text-xs text-blue-700">
            <strong>Dica:</strong> {cfg.dica}
          </div>

          {/* Drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleArquivo(e.dataTransfer.files[0]) }}
            className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
          >
            {arquivo ? (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileSpreadsheet className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm font-semibold text-slate-700 truncate">{arquivo.name}</span>
                </div>
                <button type="button" onClick={e => { e.stopPropagation(); setArquivo(null); setPreview([]) }}
                  className="text-slate-400 hover:text-red-500 shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">Clique ou arraste o arquivo CSV</p>
                <p className="text-xs text-slate-400 mt-1">Apenas .csv</p>
              </>
            )}
          </div>
          <input ref={inputRef} type="file" accept=".csv" className="hidden"
            onChange={e => handleArquivo(e.target.files?.[0] ?? null)} />

          {/* Preview */}
          {preview.length > 0 && (
            <div className="mt-3 bg-slate-50 rounded-xl p-3 overflow-x-auto">
              <p className="text-xs font-bold text-slate-500 mb-2">Prévia ({preview.length} linhas):</p>
              <table className="text-xs w-full">
                <thead>
                  <tr className="text-slate-500">
                    {cfg.colunas.slice(0,4).map(c => <th key={c} className="text-left pr-3 pb-1 font-semibold">{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      {cfg.colunas.slice(0,4).map(c => <td key={c} className="pr-3 py-1 truncate max-w-[80px]">{row[c] ?? ''}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {resultado && (
            <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div className="text-sm">
                <span className="font-black text-emerald-700">{resultado.criados} importados</span>
                {resultado.erros > 0 && <span className="text-amber-600 ml-2">{resultado.erros} com erro</span>}
              </div>
            </div>
          )}

          {erro && (
            <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-red-600">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {erro}
            </div>
          )}

          <Button onClick={importar} disabled={!arquivo || importando} className="w-full gap-2 mt-4">
            {importando ? <><Loader2 className="w-4 h-4 animate-spin" /> Importando...</> : <><Upload className="w-4 h-4" /> Importar agora</>}
          </Button>
        </div>
      </div>

      {/* Colunas do modelo */}
      <div className="mt-6 bg-white rounded-2xl shadow-soft border border-slate-100 p-6">
        <h3 className="text-sm font-black text-slate-800 mb-3">Colunas do modelo — {aba === 'alunos' ? 'Alunos' : 'Colaboradores'}</h3>
        <div className="flex flex-wrap gap-2">
          {abaConfig[aba].colunas.map(c => (
            <span key={c} className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">{c}</span>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3">
          A primeira linha do CSV deve conter exatamente esses nomes de coluna. Baixe o modelo para garantir o formato correto.
        </p>
      </div>
    </div>
  )
}
