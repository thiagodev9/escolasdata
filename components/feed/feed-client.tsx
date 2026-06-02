'use client'

import { useState, useTransition, useRef } from 'react'
import { Plus, Heart, MessageCircle, Share2, X, Loader2, ImagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Post {
  id: string; conteudo: string; foto_url?: string; categoria: string
  curtidas: number; criado_em: string
  autor: { nome: string } | null
  turma: { nome: string } | null
}
interface Turma { id: string; nome: string }
interface Props {
  posts: Post[]; turmas: Turma[]
  escolaId: string; autorId: string; autorNome: string
}

const CATS = [
  { key: 'tudo',       label: 'Tudo'       },
  { key: 'artes',      label: 'Artes'      },
  { key: 'lazer',      label: 'Lazer'      },
  { key: 'refeicao',   label: 'Refeições'  },
  { key: 'pedagogico', label: 'Pedagógico' },
]
const CAT_COLORS: Record<string, string> = {
  artes:      'bg-purple-100 text-purple-700',
  lazer:      'bg-green-100  text-green-700',
  refeicao:   'bg-amber-100  text-amber-700',
  pedagogico: 'bg-blue-100   text-blue-700',
  geral:      'bg-gray-100   text-gray-600',
}

function tempoRelativo(data: string) {
  const diff = Date.now() - new Date(data).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'agora'
  if (h < 24) return `há ${h}h`
  return `há ${Math.floor(h / 24)}d`
}

export function FeedClient({ posts, turmas, escolaId, autorId, autorNome }: Props) {
  const [filtro,    setFiltro]    = useState('tudo')
  const [show,      setShow]      = useState(false)
  const [salvando,  setSalvando]  = useState(false)
  const [erro,      setErro]      = useState('')
  const [preview,   setPreview]   = useState<string | null>(null)
  const [fotoFile,  setFotoFile]  = useState<File | null>(null)
  const [curtidas,  setCurtidas]  = useState<Record<string, number>>({})
  const [, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const sb = createClient() as any

  const [form, setForm] = useState({
    conteudo: '', categoria: 'geral', turma_id: '',
  })

  const filtrados = filtro === 'tudo'
    ? posts
    : posts.filter(p => p.categoria === filtro)

  function selecionarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFotoFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!form.conteudo.trim()) { setErro('Escreva algo para publicar.'); return }
    setSalvando(true); setErro('')

    try {
      let foto_url: string | null = null

      // Upload da foto no Supabase Storage
      if (fotoFile) {
        const ext  = fotoFile.name.split('.').pop()
        const path = `feed/${escolaId}/${Date.now()}.${ext}`
        const { error: upErr } = await sb.storage.from('educare').upload(path, fotoFile)
        if (!upErr) {
          const { data: urlData } = sb.storage.from('educare').getPublicUrl(path)
          foto_url = urlData.publicUrl
        }
      }

      const { error } = await sb.from('feed_posts').insert({
        conteudo:  form.conteudo,
        categoria: form.categoria,
        turma_id:  form.turma_id  || null,
        foto_url,
        escola_id: escolaId,
        autor_id:  autorId,
        curtidas:  0,
      })
      if (error) throw error

      setShow(false)
      setForm({ conteudo: '', categoria: 'geral', turma_id: '' })
      setPreview(null); setFotoFile(null)
      startTransition(() => router.refresh())
    } catch (err: any) {
      setErro(err.message ?? 'Erro ao publicar.')
    } finally {
      setSalvando(false)
    }
  }

  function curtir(postId: string, atual: number) {
    setCurtidas(c => ({ ...c, [postId]: (c[postId] ?? atual) + 1 }))
    sb.from('feed_posts').update({ curtidas: (curtidas[postId] ?? atual) + 1 }).eq('id', postId)
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Feed da Turma</h1>
          <p className="text-muted-foreground mt-1">Registros e momentos compartilhados pelas professoras.</p>
        </div>
        <Button onClick={() => { setShow(true); setErro('') }} variant="accent" className="gap-2">
          <Plus className="w-4 h-4" /> Novo Registro
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {CATS.map(c => (
          <button key={c.key} onClick={() => setFiltro(c.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              filtro === c.key ? 'bg-primary text-white' : 'bg-white border border-border text-foreground hover:bg-muted'
            }`}>{c.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtrados.length === 0 ? (
        <div className="bg-white rounded-lg shadow-soft p-16 flex flex-col items-center text-center">
          <p className="text-2xl font-bold text-primary mb-2">
            {filtro === 'tudo' ? 'Nenhum post ainda' : `Sem posts de ${CATS.find(c=>c.key===filtro)?.label}`}
          </p>
          <p className="text-muted-foreground">
            {filtro === 'tudo' ? 'Crie o primeiro registro do feed da escola.' : 'Tente outra categoria.'}
          </p>
          {filtro === 'tudo' && (
            <button onClick={() => setShow(true)} className="mt-4 text-accent font-semibold hover:underline">
              + Criar primeiro registro
            </button>
          )}
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {filtrados.map(post => (
            <div key={post.id} className="break-inside-avoid bg-white rounded-lg shadow-soft overflow-hidden hover:shadow-float transition-shadow">
              {post.foto_url && (
                <div className="aspect-[4/3] bg-muted overflow-hidden">
                  <img src={post.foto_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3 ${CAT_COLORS[post.categoria] ?? CAT_COLORS.geral}`}>
                  {CATS.find(c => c.key === post.categoria)?.label ?? post.categoria}
                </span>
                <p className="text-sm text-foreground leading-relaxed">{post.conteudo}</p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-primary">{post.autor?.nome?.charAt(0) ?? 'P'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{post.autor?.nome ?? 'Professora'}</p>
                    {post.turma && <p className="text-[10px] text-muted-foreground">{post.turma.nome}</p>}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{tempoRelativo(post.criado_em)}</span>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/40">
                  <button onClick={() => curtir(post.id, post.curtidas)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors">
                    <Heart className="w-4 h-4" /> {curtidas[post.id] ?? post.curtidas}
                  </button>
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <MessageCircle className="w-4 h-4" /> 0
                  </button>
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors ml-auto">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB mobile */}
      <button onClick={() => setShow(true)}
        className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-accent text-white rounded-full shadow-modal flex items-center justify-center hover:bg-accent/90 transition-colors z-40">
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal Novo Registro */}
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShow(false)} />
          <div className="relative bg-white rounded-xl shadow-modal w-full max-w-lg z-10 max-h-[92vh] overflow-y-auto">

            <div className="flex items-center justify-between p-6 border-b border-border/50 sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{autorNome?.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-bold">{autorNome}</p>
                  <p className="text-xs text-muted-foreground">Publicando no feed</p>
                </div>
              </div>
              <button onClick={() => setShow(false)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={salvar} className="p-6 space-y-4">
              {/* Preview da foto */}
              {preview && (
                <div className="relative rounded-lg overflow-hidden aspect-video bg-muted">
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => { setPreview(null); setFotoFile(null) }}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center">
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              )}

              {/* Textarea */}
              <textarea
                value={form.conteudo}
                onChange={e => setForm(f => ({ ...f, conteudo: e.target.value }))}
                placeholder="O que aconteceu hoje na turma? Compartilhe um momento especial..."
                rows={4}
                className="flex w-full rounded border border-primary/20 bg-white px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
              />

              {/* Categoria */}
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <div className="flex flex-wrap gap-2">
                  {CATS.filter(c => c.key !== 'tudo').map(c => (
                    <button key={c.key} type="button" onClick={() => setForm(f => ({ ...f, categoria: c.key }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        form.categoria === c.key
                          ? `${CAT_COLORS[c.key] ?? 'bg-primary/10 text-primary'} border-current`
                          : 'border-border text-foreground hover:bg-muted'
                      }`}>{c.label}</button>
                  ))}
                </div>
              </div>

              {/* Turma */}
              <div className="space-y-1.5">
                <Label>Turma (opcional)</Label>
                <select value={form.turma_id} onChange={e => setForm(f => ({ ...f, turma_id: e.target.value }))}
                  className="flex h-12 w-full rounded border border-primary/20 bg-white px-4 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                  <option value="">Todas as turmas</option>
                  {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>

              {/* Upload foto */}
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 text-sm text-primary font-semibold border border-primary/30 rounded-md px-4 py-2.5 hover:bg-primary/5 transition-colors w-full justify-center">
                <ImagePlus className="w-4 h-4" />
                {preview ? 'Trocar foto' : 'Adicionar foto'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={selecionarFoto} />

              {erro && <p className="text-sm text-red-500 bg-red-50 rounded px-3 py-2">{erro}</p>}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShow(false)}>Cancelar</Button>
                <Button type="submit" variant="accent" className="flex-1" disabled={salvando}>
                  {salvando ? <><Loader2 className="w-4 h-4 animate-spin" />Publicando...</> : 'Publicar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
