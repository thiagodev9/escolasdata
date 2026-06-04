'use client'

import { useState, useTransition, useRef, useEffect, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  QrCode, Camera, CheckCircle2, XCircle, Clock,
  Filter, Download, X, Users, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import jsQR from 'jsqr'

interface Aluno {
  id: string; nome: string; foto_url: string | null
  turma_nome: string | null; turma_id: string | null
}
interface Turma  { id: string; nome: string }
interface Presenca { id: string; aluno_id: string; status: string; hora_entrada?: string; hora_saida?: string }

interface Props {
  alunos: Aluno[]
  turmas: Turma[]
  presencasHoje: Record<string, Presenca>
  escolaId: string
  dataHoje: string
}

const STATUS_CFG = {
  presente:   { label: 'Presente',    cls: 'bg-green-100 text-green-700',  icon: CheckCircle2 },
  ausente:    { label: 'Ausente',     cls: 'bg-red-100   text-red-600',    icon: XCircle      },
  justificado:{ label: 'Justificado', cls: 'bg-blue-100  text-blue-700',   icon: AlertCircle  },
}

export function PresencaClient({ alunos, turmas, presencasHoje, escolaId, dataHoje }: Props) {
  const [presencas,  setPresencas]  = useState<Record<string, Presenca>>(presencasHoje)
  const [filtroTurma, setFiltroTurma] = useState('todas')
  const [showQR,     setShowQR]     = useState<Aluno | null>(null)
  const [showScanner,setShowScanner]= useState(false)
  const [scanMsg,    setScanMsg]    = useState('')
  const [loading,    setLoading]    = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const videoRef   = useRef<HTMLVideoElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const scanRef    = useRef<number | null>(null)
  const streamRef  = useRef<MediaStream | null>(null)
  const router = useRouter()
  const sb = createClient() as any

  const filtrados = alunos.filter(a =>
    filtroTurma === 'todas' || a.turma_id === filtroTurma
  )

  const presentes   = Object.values(presencas).filter(p => p.status === 'presente').length
  const ausentes    = filtrados.length - presentes
  const pct         = filtrados.length ? Math.round((presentes / filtrados.length) * 100) : 0

  async function registrar(alunoId: string, status: 'presente' | 'ausente' | 'justificado') {
    setLoading(alunoId)
    const hora = new Date().toTimeString().slice(0, 5)
    const existing = presencas[alunoId]
    try {
      if (existing) {
        await sb.from('presencas').update({ status, hora_entrada: hora }).eq('id', existing.id)
      } else {
        const { data } = await sb.from('presencas').insert({
          aluno_id: alunoId, escola_id: escolaId,
          data: dataHoje, status, hora_entrada: hora,
        }).select().single()
        if (data) setPresencas(p => ({ ...p, [alunoId]: data }))
      }
      setPresencas(p => ({ ...p, [alunoId]: { ...p[alunoId], aluno_id: alunoId, status, hora_entrada: hora } as Presenca }))
    } finally {
      setLoading(null)
    }
  }

  async function handleQRScan(alunoId: string) {
    const aluno = alunos.find(a => a.id === alunoId)
    if (!aluno) { setScanMsg('❌ Aluno não encontrado'); return }
    const jaPresente = presencas[alunoId]?.status === 'presente'
    if (jaPresente) {
      // Check-out
      const hora = new Date().toTimeString().slice(0, 5)
      await sb.from('presencas').update({ hora_saida: hora }).eq('aluno_id', alunoId).eq('data', dataHoje)
      setPresencas(p => ({ ...p, [alunoId]: { ...p[alunoId], hora_saida: hora } as Presenca }))
      setScanMsg(`✅ Saída registrada: ${aluno.nome} às ${hora}`)
    } else {
      await registrar(alunoId, 'presente')
      setScanMsg(`✅ Check-in: ${aluno.nome} às ${new Date().toTimeString().slice(0,5)}`)
    }
    setTimeout(() => setScanMsg(''), 3000)
  }

  const startScanner = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      const scan = () => {
        if (!videoRef.current || !canvasRef.current) return
        const v = videoRef.current
        if (v.readyState !== v.HAVE_ENOUGH_DATA) { scanRef.current = requestAnimationFrame(scan); return }
        const ctx = canvasRef.current.getContext('2d')!
        canvasRef.current.width  = v.videoWidth
        canvasRef.current.height = v.videoHeight
        ctx.drawImage(v, 0, 0)
        const img = ctx.getImageData(0, 0, v.videoWidth, v.videoHeight)
        const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' })
        if (code?.data?.startsWith('EduNest://aluno/')) {
          const alunoId = code.data.replace('EduNest://aluno/', '')
          handleQRScan(alunoId)
        }
        scanRef.current = requestAnimationFrame(scan)
      }
      scanRef.current = requestAnimationFrame(scan)
    } catch {
      setScanMsg('❌ Câmera não disponível. Verifique as permissões.')
    }
  }, [])

  function stopScanner() {
    if (scanRef.current) cancelAnimationFrame(scanRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  useEffect(() => {
    if (showScanner) startScanner()
    else stopScanner()
    return stopScanner
  }, [showScanner])

  async function marcarTodos(status: 'presente' | 'ausente') {
    for (const aluno of filtrados) {
      await registrar(aluno.id, status)
    }
    startTransition(() => router.refresh())
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Controle de Presença</h1>
          <p className="text-muted-foreground mt-1">
            {new Date(dataHoje + 'T12:00').toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long' })}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setShowScanner(true)} className="gap-2">
            <Camera className="w-4 h-4" /> Scanner QR
          </Button>
          <Button onClick={() => marcarTodos('presente')} className="gap-2">
            <CheckCircle2 className="w-4 h-4" /> Todos Presentes
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-soft p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{presentes}</p>
          <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase">Presentes</p>
        </div>
        <div className="bg-white rounded-lg shadow-soft p-4 text-center">
          <p className="text-3xl font-bold text-red-500">{ausentes}</p>
          <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase">Ausentes</p>
        </div>
        <div className="bg-white rounded-lg shadow-soft p-4 text-center">
          <p className="text-3xl font-bold text-primary">{pct}%</p>
          <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase">Frequência</p>
        </div>
      </div>

      {/* Filtro turma */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFiltroTurma('todas')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filtroTurma === 'todas' ? 'bg-primary text-white' : 'border border-border hover:bg-muted'}`}>
          Todas as turmas
        </button>
        {turmas.map(t => (
          <button key={t.id} onClick={() => setFiltroTurma(t.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filtroTurma === t.id ? 'bg-primary text-white' : 'border border-border hover:bg-muted'}`}>
            {t.nome}
          </button>
        ))}
      </div>

      {/* Lista de alunos */}
      <div className="bg-white rounded-lg shadow-soft divide-y divide-border/30">
        {filtrados.map(aluno => {
          const p   = presencas[aluno.id]
          const st  = p ? STATUS_CFG[p.status as keyof typeof STATUS_CFG] : null
          const ini = aluno.nome.split(' ').slice(0,2).map((n:string)=>n[0]).join('')
          return (
            <div key={aluno.id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/20 transition-colors">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                {aluno.foto_url
                  ? <img src={aluno.foto_url} className="w-full h-full object-cover" alt={aluno.nome} />
                  : <span className="text-sm font-bold text-primary">{ini}</span>
                }
              </div>
              {/* Nome */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{aluno.nome}</p>
                <p className="text-xs text-muted-foreground">{aluno.turma_nome ?? '—'}</p>
              </div>
              {/* Hora */}
              {p?.hora_entrada && (
                <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" /> {p.hora_entrada}
                  {p.hora_saida && <> → {p.hora_saida}</>}
                </div>
              )}
              {/* Status badge */}
              {st && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
              )}
              {/* Ações */}
              <div className="flex gap-1 shrink-0">
                <button onClick={() => registrar(aluno.id, 'presente')} disabled={loading === aluno.id}
                  title="Presente"
                  className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                    p?.status === 'presente' ? 'bg-green-100 text-green-600' : 'hover:bg-green-50 text-muted-foreground hover:text-green-600'
                  }`}>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button onClick={() => registrar(aluno.id, 'ausente')} disabled={loading === aluno.id}
                  title="Ausente"
                  className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                    p?.status === 'ausente' ? 'bg-red-100 text-red-600' : 'hover:bg-red-50 text-muted-foreground hover:text-red-500'
                  }`}>
                  <XCircle className="w-4 h-4" />
                </button>
                <button onClick={() => setShowQR(aluno)} title="Ver QR Code"
                  className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground">
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal QR Code */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowQR(null)} />
          <div className="relative bg-white rounded-xl shadow-modal p-8 z-10 flex flex-col items-center gap-4 w-72">
            <button onClick={() => setShowQR(null)} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded hover:bg-muted">
              <X className="w-4 h-4" />
            </button>
            <p className="font-bold text-lg text-center">{showQR.nome}</p>
            <div className="bg-white p-3 rounded-lg border-2 border-primary/20">
              <QRCodeSVG
                value={`EduNest://aluno/${showQR.id}`}
                size={180}
                fgColor="#004ac6"
                level="H"
                includeMargin
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Escaneie na entrada/saída para registrar presença automaticamente.
            </p>
            <Button variant="outline" size="sm" className="gap-2 w-full"
              onClick={() => {
                const svg = document.querySelector('svg')
                if (!svg) return
                const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' })
                const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
                a.download = `qr-${showQR.nome.replace(/ /g,'-')}.svg`; a.click()
              }}>
              <Download className="w-4 h-4" /> Baixar QR Code
            </Button>
          </div>
        </div>
      )}

      {/* Modal Scanner */}
      {showScanner && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="flex items-center justify-between p-4">
            <p className="text-white font-bold text-lg">Scanner de Presença</p>
            <button onClick={() => setShowScanner(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 relative">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
            {/* Viewfinder */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-white rounded-xl opacity-70">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
              </div>
            </div>
          </div>
          {scanMsg && (
            <div className={`m-4 p-4 rounded-xl text-center font-semibold text-sm ${
              scanMsg.startsWith('✅') ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>{scanMsg}</div>
          )}
          <p className="text-white/60 text-center text-xs pb-6">
            Aponte para o QR Code do aluno
          </p>
        </div>
      )}
    </>
  )
}
